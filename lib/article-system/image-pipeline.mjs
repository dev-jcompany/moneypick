import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { buildMoneyPickImagePrompt } from './visual-system.mjs';

const DEFAULT_BUCKET = 'article-images';

export class ImageGenerationError extends Error {
  constructor(message, code = 'provider_error', retryable = false) {
    super(message);
    this.name = 'ImageGenerationError';
    this.code = code;
    this.retryable = retryable;
  }
}

function classifyProviderError(status, body) {
  const message = body?.error?.message || `Image provider returned HTTP ${status}`;
  if (status === 401 || status === 403) return new ImageGenerationError(message, 'authentication', false);
  if (status === 402 || /credit|quota|billing/i.test(message)) return new ImageGenerationError(message, 'credit_exhausted', false);
  if (status === 429) return new ImageGenerationError(message, 'rate_limit', true);
  return new ImageGenerationError(message, status >= 500 ? 'provider_unavailable' : 'provider_error', status >= 500);
}

export function createOpenAIImageProvider({ apiKey = process.env.OPENAI_API_KEY, model = process.env.IMAGE_GENERATION_MODEL || 'gpt-image-2', fetchImpl = fetch } = {}) {
  if (!apiKey?.trim()) throw new ImageGenerationError('OPENAI_API_KEY is not configured', 'authentication', false);
  return {
    name: 'openai',
    model,
    async generate({ prompt }) {
      const response = await fetchImpl('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, size: '1536x1024', quality: 'medium', output_format: 'png', n: 1 }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw classifyProviderError(response.status, body);
      const b64 = body?.data?.[0]?.b64_json;
      if (!b64) throw new ImageGenerationError('Image provider returned no image data', 'invalid_response', false);
      return { bytes: Buffer.from(b64, 'base64'), mimeType: 'image/png' };
    },
  };
}

export function createSupabaseVisualStorage({
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY,
  bucket = process.env.ARTICLE_IMAGE_BUCKET || DEFAULT_BUCKET,
  client,
} = {}) {
  if (!client && (!url?.trim() || !serviceRoleKey?.trim())) {
    throw new ImageGenerationError('Supabase server storage credentials are not configured', 'storage_authentication', false);
  }
  const supabase = client ?? createClient(url.trim(), serviceRoleKey.trim(), { auth: { persistSession: false, autoRefreshToken: false } });
  return {
    name: 'supabase',
    bucket,
    async upload({ path, bytes, mimeType }) {
      const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType: mimeType, upsert: false, cacheControl: '31536000' });
      if (error) throw new ImageGenerationError(`Storage upload failed: ${error.message}`, 'storage_upload', false);
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      if (!data?.publicUrl) throw new ImageGenerationError('Storage returned no public URL', 'storage_response', false);
      return data.publicUrl;
    },
  };
}

export function safeArticleAssetPath(articleId, visualId, bytes) {
  const safeArticle = String(articleId).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'draft';
  const safeVisual = String(visualId).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'visual';
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  return `articles/${safeArticle}/${safeVisual}-${hash}.webp`;
}

async function optimizeImage(bytes) {
  const output = await sharp(bytes).rotate().resize({ width: 1400, height: 788, fit: 'cover', position: 'centre', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  return { bytes: output.data, width: output.info.width, height: output.info.height, mimeType: 'image/webp' };
}

export async function generateArticleVisualAssets({
  articleId,
  articleTopic,
  visuals,
  provider,
  storage,
  retry = Number(process.env.IMAGE_GENERATION_RETRY ?? 1),
  logger = console,
}) {
  const generated = [];
  const failures = [];
  let stopProviderCalls = false;

  for (const visual of visuals) {
    if (stopProviderCalls) {
      failures.push({ id: visual.id, code: 'provider_stopped' });
      continue;
    }
    let lastError;
    for (let attempt = 0; attempt <= Math.max(0, Math.min(retry, 1)); attempt += 1) {
      try {
        const source = await provider.generate({ prompt: buildMoneyPickImagePrompt(visual, articleTopic), visual });
        const optimized = await optimizeImage(source.bytes);
        const path = safeArticleAssetPath(articleId, visual.id, optimized.bytes);
        const url = await storage.upload({ path, bytes: optimized.bytes, mimeType: optimized.mimeType });
        generated.push({ ...visual, asset: { url, width: optimized.width, height: optimized.height, mimeType: optimized.mimeType } });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (['authentication', 'credit_exhausted'].includes(error?.code)) stopProviderCalls = true;
        if (!error?.retryable || attempt >= Math.max(0, Math.min(retry, 1))) break;
      }
    }
    if (lastError) {
      failures.push({ id: visual.id, code: lastError.code ?? 'unknown' });
      logger.warn?.(`[visual] ${visual.id} skipped (${lastError.code ?? 'unknown'})`);
    }
  }
  return { visuals: generated, failures };
}
