import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'article-images';

const CATEGORY_STYLES: Record<string, { name: string; bg: string; dark: string; accent: string }> = {
  loan: { name: '대출연구소', bg: '#27ab63', dark: '#147a42', accent: '#d9f99d' },
  '대출연구소': { name: '대출연구소', bg: '#27ab63', dark: '#147a42', accent: '#d9f99d' },
  estate: { name: '부동산 가이드', bg: '#3b82f6', dark: '#1d4ed8', accent: '#bfdbfe' },
  realestate: { name: '부동산 가이드', bg: '#3b82f6', dark: '#1d4ed8', accent: '#bfdbfe' },
  '부동산 가이드': { name: '부동산 가이드', bg: '#3b82f6', dark: '#1d4ed8', accent: '#bfdbfe' },
  tax: { name: '세금 절약법', bg: '#f59e0b', dark: '#b45309', accent: '#fde68a' },
  '세금 절약법': { name: '세금 절약법', bg: '#f59e0b', dark: '#b45309', accent: '#fde68a' },
  work: { name: '직장인 머니', bg: '#8b5cf6', dark: '#6d28d9', accent: '#ddd6fe' },
  '직장인 머니': { name: '직장인 머니', bg: '#8b5cf6', dark: '#6d28d9', accent: '#ddd6fe' },
  invest: { name: '투자 첫걸음', bg: '#14b8a6', dark: '#0f766e', accent: '#99f6e4' },
  '투자 첫걸음': { name: '투자 첫걸음', bg: '#14b8a6', dark: '#0f766e', accent: '#99f6e4' },
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 18 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function buildSvg(title: string, categoryKey: string, categoryLabel: string) {
  const style =
    CATEGORY_STYLES[categoryKey] ??
    CATEGORY_STYLES[categoryLabel] ??
    CATEGORY_STYLES.loan;
  const lines = splitTitle(title);
  const titleY = 280 - (lines.length - 1) * 48;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${style.bg}"/>
  <circle cx="1040" cy="90" r="220" fill="${style.dark}" opacity="0.35"/>
  <circle cx="1000" cy="520" r="170" fill="${style.accent}" opacity="0.22"/>
  <path d="M0 500 C210 430 350 590 560 520 C780 445 930 490 1200 410 L1200 630 L0 630 Z" fill="${style.dark}" opacity="0.28"/>
  <rect x="74" y="76" width="260" height="56" rx="28" fill="rgba(255,255,255,0.22)"/>
  <text x="104" y="113" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${escapeXml(style.name)}</text>
  <g transform="translate(800 170)">
    <rect x="0" y="0" width="250" height="250" rx="44" fill="rgba(255,255,255,0.18)"/>
    <rect x="48" y="54" width="154" height="118" rx="20" fill="#ffffff" opacity="0.94"/>
    <rect x="48" y="54" width="154" height="38" rx="20" fill="${style.accent}"/>
    <circle cx="126" cy="132" r="42" fill="${style.bg}"/>
    <text x="126" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#ffffff">₩</text>
    <rect x="76" y="188" width="100" height="12" rx="6" fill="#ffffff" opacity="0.72"/>
  </g>
  ${lines
    .map(
      (line, index) =>
        `<text x="74" y="${titleY + index * 78}" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`,
    )
    .join('\n  ')}
  <text x="78" y="548" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.82)">MoneyPick</text>
</svg>`;
}

export async function createArticleThumbnail(input: {
  title: string;
  slug: string;
  categoryKey: string;
  categoryLabel: string;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[thumbnail] Supabase credentials are missing.');
    return null;
  }

  try {
    const svg = buildSvg(input.title, input.categoryKey, input.categoryLabel);
    const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const filePath = `thumbnails/${input.slug}-${Date.now()}.png`;
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, pngBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

    if (error) {
      console.warn(`[thumbnail] Upload failed: ${error.message}`);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl ?? null;
  } catch (error) {
    console.warn('[thumbnail] Generation failed:', error);
    return null;
  }
}
