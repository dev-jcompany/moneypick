#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const BUCKET = 'article-images';

loadEnv(path.join(projectRoot, '.env.local'));
loadEnv(path.join(__dirname, '.env'));

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const LIMIT = (() => {
  const index = args.indexOf('--limit');
  return index >= 0 ? Number(args[index + 1]) : 100;
})();

const CATEGORY_STYLES = {
  loan: ['대출연구소', '#27ab63', '#147a42', '#d9f99d'],
  estate: ['부동산 가이드', '#3b82f6', '#1d4ed8', '#bfdbfe'],
  realestate: ['부동산 가이드', '#3b82f6', '#1d4ed8', '#bfdbfe'],
  tax: ['세금 절약법', '#f59e0b', '#b45309', '#fde68a'],
  work: ['직장인 머니', '#8b5cf6', '#6d28d9', '#ddd6fe'],
  invest: ['투자 첫걸음', '#14b8a6', '#0f766e', '#99f6e4'],
  대출연구소: ['대출연구소', '#27ab63', '#147a42', '#d9f99d'],
  '부동산 가이드': ['부동산 가이드', '#3b82f6', '#1d4ed8', '#bfdbfe'],
  '세금 절약법': ['세금 절약법', '#f59e0b', '#b45309', '#fde68a'],
  '직장인 머니': ['직장인 머니', '#8b5cf6', '#6d28d9', '#ddd6fe'],
  '투자 첫걸음': ['투자 첫걸음', '#14b8a6', '#0f766e', '#99f6e4'],
};

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function splitTitle(title) {
  const words = title.trim().split(/\s+/);
  const lines = [];
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

function buildSvg(article) {
  const [categoryName, bg, dark, accent] =
    CATEGORY_STYLES[article.category_key] ??
    CATEGORY_STYLES[article.category_label] ??
    CATEGORY_STYLES.loan;
  const lines = splitTitle(article.title);
  const titleY = 280 - (lines.length - 1) * 48;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  <circle cx="1040" cy="90" r="220" fill="${dark}" opacity="0.35"/>
  <circle cx="1000" cy="520" r="170" fill="${accent}" opacity="0.22"/>
  <path d="M0 500 C210 430 350 590 560 520 C780 445 930 490 1200 410 L1200 630 L0 630 Z" fill="${dark}" opacity="0.28"/>
  <rect x="74" y="76" width="260" height="56" rx="28" fill="rgba(255,255,255,0.22)"/>
  <text x="104" y="113" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${escapeXml(categoryName)}</text>
  <g transform="translate(800 170)">
    <rect x="0" y="0" width="250" height="250" rx="44" fill="rgba(255,255,255,0.18)"/>
    <rect x="48" y="54" width="154" height="118" rx="20" fill="#ffffff" opacity="0.94"/>
    <rect x="48" y="54" width="154" height="38" rx="20" fill="${accent}"/>
    <circle cx="126" cy="132" r="42" fill="${bg}"/>
    <text x="126" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#ffffff">₩</text>
    <rect x="76" y="188" width="100" height="12" rx="6" fill="#ffffff" opacity="0.72"/>
  </g>
  ${lines.map((line, index) => `<text x="74" y="${titleY + index * 78}" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">${escapeXml(line)}</text>`).join('\n  ')}
  <text x="78" y="548" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="rgba(255,255,255,0.82)">MoneyPick</text>
</svg>`;
}

async function createThumbnail(supabase, article) {
  const svg = buildSvg(article);
  const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  const filePath = `thumbnails/${article.slug}-${Date.now()}.png`;
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, pngBuffer, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase credentials are missing.');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('moneypick_articles')
    .select('id, slug, title, category_key, category_label, thumbnail_url')
    .or('thumbnail_url.is.null,thumbnail_url.eq.')
    .order('created_at', { ascending: false })
    .limit(Number.isFinite(LIMIT) ? LIMIT : 100);

  if (error) throw error;
  const articles = data ?? [];
  console.log(`Missing thumbnail rows: ${articles.length}${DRY ? ' (dry-run)' : ''}`);

  for (const article of articles) {
    if (DRY) {
      console.log(`- ${article.id} ${article.slug}`);
      continue;
    }

    const thumbnailUrl = await createThumbnail(supabase, article);
    const { error: updateError } = await supabase
      .from('moneypick_articles')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', article.id);
    if (updateError) throw updateError;
    console.log(`Updated ${article.slug}: ${thumbnailUrl}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
