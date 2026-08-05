// 내부링크 캐시 — 생성 성공한 글의 slug/title/category/tags 저장 및 추천 매칭
// 생성기 실행마다 업데이트되며, recommended 필드에 실제 존재하는 slug를 주입할 때 사용.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = path.join(__dirname, 'link-cache.json');

// 카테고리 레이블 → URL 경로
const CATEGORY_PATH = {
  '대출연구소':  'loan',
  '부동산연구소': 'realestate',
  '세금연구소':  'tax',
  '직장인연구소': 'work',
  '투자연구소':  'invest',
};

export function toArticleUrl(categoryLabel, slug) {
  const p = CATEGORY_PATH[categoryLabel] ?? 'loan';
  return `/${p}/${slug}`;
}

// ── 읽기/쓰기 ──

export function loadLinkCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

export function saveLinkCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

/**
 * 캐시에 항목 추가. 동일 slug이면 덮어씀.
 * entry: { slug, title, categoryLabel, tags, calcSlugs?, views?, publishedAt? }
 */
export function addToLinkCache(cache, entry) {
  const idx = cache.findIndex(e => e.slug === entry.slug);
  if (idx >= 0) {
    cache[idx] = { ...cache[idx], ...entry };
  } else {
    cache.push(entry);
  }
}

// ── 추천 매칭 ──

// 흔한 단어 필터 (점수 왜곡 방지)
const STOPWORDS = new Set([
  '방법', '계산', '정리', '완벽', '가이드', '알아보기', '이란', '이유',
  '총정리', '조건', '비교', '종류', '알면', '주의', '완전', '쉽게',
  '하는', '있는', '위한', '경우', '때문', '그리고', '하지만',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[\s,·\-\/]+/)
    .map(w => w.replace(/[?!:;()]/g, ''))
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// 30일 이내 게시글 여부
function isRecent(publishedAt) {
  if (!publishedAt) return false;
  const diff = Date.now() - new Date(publishedAt).getTime();
  return diff < 30 * 24 * 60 * 60 * 1000;
}

/**
 * 점수 기반 추천 매칭 (Sprint 4 개선판)
 *
 * 점수 기준:
 *   태그 동일     +5 / 태그
 *   카테고리 동일 +3
 *   동일 계산기   +4 / 계산기 slug
 *   최근 30일     +1
 *   조회수 > 0    +2
 *
 * 제외:
 *   현재 글 slug (excludeSlug)
 *   점수 0 항목
 *
 * @param {object}   topic        - { title, planTags, category }
 * @param {object[]} cache        - link-cache 항목 배열
 * @param {number}   max          - 반환 최대 개수 (기본 5)
 * @param {string}   [excludeSlug] - 제외할 slug (현재 생성 중인 글)
 * @param {string[]} [topicCalcSlugs] - 현재 주제 관련 계산기 slugs
 * @param {boolean}  [debug]      - 점수 상세 출력 여부
 */
export function matchRecommended(topic, cache, max = 5, excludeSlug = null, topicCalcSlugs = [], debug = false) {
  if (!cache.length) return [];

  const topicTags = new Set((topic.planTags ?? []).map(t => t.toLowerCase()));
  const topicCalcs = new Set(topicCalcSlugs.map(s => s.toLowerCase()));

  const scored = cache
    .filter(entry => entry.slug !== excludeSlug)
    .map(entry => {
      const breakdown = [];
      let score = 0;

      // 카테고리 동일 +3
      if (entry.categoryLabel === topic.category) {
        score += 3;
        if (debug) breakdown.push('카테고리+3');
      }

      // 태그 동일 +5/태그
      const entryTags = new Set((entry.tags ?? []).map(t => t.toLowerCase()));
      let tagHits = 0;
      for (const tag of entryTags) {
        if (topicTags.has(tag)) { score += 5; tagHits++; }
      }
      if (debug && tagHits) breakdown.push(`태그+${tagHits * 5}(${tagHits}개)`);

      // 동일 계산기 +4/계산기
      const entryCalcs = new Set((entry.calcSlugs ?? []).map(s => s.toLowerCase()));
      let calcHits = 0;
      for (const cs of entryCalcs) {
        if (topicCalcs.has(cs)) { score += 4; calcHits++; }
      }
      if (debug && calcHits) breakdown.push(`계산기+${calcHits * 4}(${calcHits}개)`);

      // 최근 30일 +1
      if (isRecent(entry.publishedAt)) {
        score += 1;
        if (debug) breakdown.push('최근+1');
      }

      // 조회수 > 0 +2
      if ((entry.views ?? 0) > 0) {
        score += 2;
        if (debug) breakdown.push(`조회수+2(${entry.views})`);
      }

      return { entry, score, breakdown };
    });

  const filtered = scored.filter(({ score }) => score > 0);
  filtered.sort((a, b) => b.score - a.score);

  if (debug) {
    console.log(`\n[DEBUG] 추천 후보 점수 (상위 ${Math.min(max + 3, filtered.length)}개):`);
    filtered.slice(0, max + 3).forEach(({ entry, score, breakdown }) => {
      console.log(`  ${score}점 ${entry.slug} [${breakdown.join(', ')}]`);
    });
    if (excludeSlug) {
      console.log(`  (제외: ${excludeSlug})`);
    }
  }

  return filtered.slice(0, max).map(({ entry }) => entry);
}

/**
 * 실제 슬러그 목록을 Claude 프롬프트 블록으로 변환.
 * recommended 배열 작성 시 이 슬러그를 우선 사용하도록 지시.
 */
export function buildRecommendedBlock(candidates) {
  if (!candidates.length) return null;
  const lines = candidates.map(c =>
    `  · ${c.title} | category: ${c.categoryLabel} | slug: ${c.slug}`,
  );
  return [
    `[실제 발행된 관련 글 — recommended slug 우선 사용]`,
    `아래는 사이트에 실제 존재하는 글입니다. recommended 배열은 아래 목록에서 관련성 높은 3~4개를 골라 title·category·slug를 그대로 사용하세요.`,
    `아래 후보만으로 3개가 부족할 경우에만 카테고리 내 다른 주제로 slug를 합리적으로 생성하세요.`,
    ...lines,
  ].join('\n');
}
