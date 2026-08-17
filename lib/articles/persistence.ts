import {
  createMoneypickArticle,
  updateMoneypickArticle,
  type ArticleSavePayload,
  type ArticleSaveResult,
} from '@/lib/db';
import { normalizeArticle } from './generation-core.mjs';

export function prepareArticleForPersistence(payload: ArticleSavePayload): ArticleSavePayload {
  return normalizeArticle(payload).article as ArticleSavePayload;
}

export async function createArticleThroughPipeline(payload: ArticleSavePayload): Promise<ArticleSaveResult> {
  return createMoneypickArticle(prepareArticleForPersistence(payload));
}

export async function updateArticleThroughPipeline(id: string, payload: Partial<ArticleSavePayload>) {
  const hasArticleBody = typeof payload.body_html === 'string' && payload.body_html.trim().length > 0;
  const normalized = hasArticleBody
    ? prepareArticleForPersistence(payload as ArticleSavePayload)
    : {
        ...payload,
        ...(Array.isArray(payload.summary) ? { summary: payload.summary.filter((item) => typeof item === 'string' && item.trim()) } : {}),
        ...(Array.isArray(payload.faq)
          ? { faq: payload.faq.filter((item) => item && typeof item.q === 'string' && typeof item.a === 'string') }
          : {}),
      };
  return updateMoneypickArticle(id, normalized);
}
