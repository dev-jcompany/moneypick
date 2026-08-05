#!/usr/bin/env node
// DB에서 발행된 모든 글을 읽어 link-cache.json을 초기 구축하는 스크립트.
// 최초 1회 또는 캐시가 의심될 때 실행.
//
// 사용:
//   node mcp/backfill-link-cache.mjs          # 발행글만 (published)
//   node mcp/backfill-link-cache.mjs --all    # draft 포함 전체

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 환경변수 로드 ──
function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && process.env[k] == null) process.env[k] = v;
  }
}
loadEnv(path.join(__dirname, '.env'));
loadEnv(path.join(__dirname, '..', '.env.local'));

const CACHE_PATH = path.join(__dirname, 'link-cache.json');
const ALL_STATUS = process.argv.includes('--all');

// ── 캐시 로드 ──
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); }
  catch { return []; }
}

// related_calculators JSON에서 slug 추출
// href 형식: "/calculators/dsr" 또는 "/calculators/acquisition-tax"
function extractCalcSlugs(relatedCalc) {
  if (!Array.isArray(relatedCalc)) return [];
  return relatedCalc
    .map(c => {
      const href = c?.href ?? '';
      const match = href.match(/\/calculators\/([a-z0-9-]+)/);
      return match?.[1] ?? null;
    })
    .filter(Boolean);
}

// ── 카테고리 key → label ──
const CATEGORY_LABEL = {
  loan:   '대출연구소',
  estate: '부동산연구소',
  tax:    '세금연구소',
  work:   '직장인연구소',
  invest: '투자연구소',
};

async function main() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY
             ?? process.env.SUPABASE_SERVICE_KEY
             ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('NEXT_PUBLIC_SUPABASE_URL 또는 Supabase 키가 .env.local에 없어요.');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  console.log(`\n머니픽 link-cache 백필 — ${new Date().toLocaleString('ko-KR')}`);
  console.log(`대상: ${ALL_STATUS ? '전체 (draft 포함)' : '발행 글만 (published)'}`);

  // DB 조회
  let query = supabase
    .from('moneypick_articles')
    .select('slug, title, category_key, category_label, tags, views, related_calculators, created_at, status')
    .order('created_at', { ascending: false });

  if (!ALL_STATUS) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;

  if (error) {
    console.error('DB 조회 실패:', error.message);
    process.exit(1);
  }

  if (!data?.length) {
    console.log('조회된 글이 없어요.');
    return;
  }

  console.log(`DB 조회: ${data.length}개\n`);

  // 기존 캐시 로드
  const existing = loadCache();
  const cacheMap = new Map(existing.map(e => [e.slug, e]));

  let added = 0, updated = 0;

  for (const row of data) {
    const categoryLabel = row.category_label
      ?? CATEGORY_LABEL[row.category_key]
      ?? row.category_key;

    const calcSlugs = extractCalcSlugs(row.related_calculators);

    const entry = {
      slug:          row.slug,
      title:         row.title,
      categoryLabel,
      tags:          Array.isArray(row.tags) ? row.tags : [],
      calcSlugs,
      views:         row.views ?? 0,
      publishedAt:   row.created_at?.slice(0, 10) ?? null,
    };

    if (cacheMap.has(row.slug)) {
      updated++;
    } else {
      added++;
    }
    cacheMap.set(row.slug, entry);
  }

  const merged = [...cacheMap.values()];
  fs.writeFileSync(CACHE_PATH, JSON.stringify(merged, null, 2));

  console.log(`완료: 신규 ${added}개 추가, ${updated}개 업데이트`);
  console.log(`캐시 총 ${merged.length}개 → ${CACHE_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
