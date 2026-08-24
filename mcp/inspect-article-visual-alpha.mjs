#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const directory = path.dirname(fileURLToPath(import.meta.url));

for (const envPath of [path.join(directory, '.env'), path.join(directory, '..', '.env.local')]) {
  if (!fs.existsSync(envPath)) continue;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (process.env[key] == null) process.env[key] = value;
  }
}

const articleId = process.argv[2]?.trim();
if (!articleId) throw new Error('Usage: node mcp/inspect-article-visual-alpha.mjs <article-id>');
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase credentials are not configured');
}

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await client
  .from('moneypick_articles')
  .select('id, slug, status, article_schema')
  .eq('id', articleId)
  .single();
if (error) throw new Error(error.message);

const checks = [];
for (const visual of data.article_schema?.visuals ?? []) {
  const response = await fetch(visual.asset.url);
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const [metadata, stats] = await Promise.all([sharp(bytes).metadata(), sharp(bytes).stats()]);
  const alpha = stats.channels[3];
  checks.push({
    id: visual.id,
    format: metadata.format,
    width: metadata.width,
    height: metadata.height,
    hasAlpha: metadata.hasAlpha,
    alphaMin: alpha?.min ?? null,
    alphaMax: alpha?.max ?? null,
    hasTransparentPixels: alpha ? alpha.min < 255 : false,
  });
}

console.log(JSON.stringify({
  articleId: data.id,
  slug: data.slug,
  status: data.status,
  visualCount: checks.length,
  checks,
}, null, 2));
