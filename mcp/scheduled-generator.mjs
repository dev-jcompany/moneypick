#!/usr/bin/env node
// 머니픽 스케줄 생성기
// 매일 실행 → topics.json 에서 예정+아키타입 있는 글을 N개 뽑아
// Claude API로 초안 생성 → 머니픽 관리자 API로 draft 저장
//
// 사용:
//   node scheduled-generator.mjs              # 기본 6개
//   node scheduled-generator.mjs --limit 3    # 3개만
//   node scheduled-generator.mjs --dry        # 비용 없이 대상만 출력

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { generateThumbnail } from './thumbnail-generator.mjs';
import {
  selectArticleType,
  pickPattern,
  pickTitleStyle,
  buildPatternPromptBlock,
  logSelection,
} from './pattern-selector.mjs';
import {
  generateSampleScenarios,
  formatResultValue,
  SCENARIO_SUPPORTED_CALCULATORS,
} from '../lib/calculators/engine.mjs';
import { matchSources } from './official-registry.mjs';
import {
  loadLinkCache,
  saveLinkCache,
  addToLinkCache,
  matchRecommended,
  buildRecommendedBlock,
  toArticleUrl,
} from './link-cache.mjs';

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

// ── CLI ──
const args = process.argv.slice(2);
const DRY   = args.includes('--dry');
const DEBUG = args.includes('--debug');
const LIMIT = (() => {
  const i = args.indexOf('--limit');
  return i !== -1 ? Number(args[i + 1]) : 6;
})();
const MODEL = (() => {
  const i = args.indexOf('--model');
  return i !== -1 ? args[i + 1] : 'claude-sonnet-4-6';
})();

// ── 상수 ──
const TOPICS_PATH = path.join(__dirname, 'topics.json');
const STATE_PATH  = path.join(__dirname, 'schedule-state.json'); // 진행 상태
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'system-prompt.md');
const SAMPLES_DIR = path.join(__dirname, 'samples');
const PATTERNS_PATH = path.join(__dirname, 'article-patterns.json');
const SLEEP_MS = 2000;
const HISTORY_LIMIT = 30; // 패턴/제목스타일 중복 방지용 최근 이력 보관 개수

// ── 글유형별 스켈레톤 리마인더 ──
const SKELETON = {
  '개념정리형':    '정의 → 비교표 → 작동원리(숫자 예시) → 흔한 오해 3가지',
  '비교형':        '큰 비교표 → 항목별 깊이 비교 → 상황별 A/B 추천 → 실제 사례 2명',
  '하우투·절차형': '준비물 → STEP 0~N(단계마다 h2, 상세+팁) → 단계별 흔한 실수 → 완료 체크',
  '완벽가이드형':  '자격 → 한도 → 금리 → 신청 → 실전 시뮬레이션(각 섹션 표)',
  '꿀팁·리스트형': '항목마다 미니 섹션(설명+왜 중요+실천법) → 효과 극대화',
  '함정주의형':    '충격 오프닝 → 함정 1~N(상황→이유→손해 예시→회피/대처) → 위험신호 체크 → 당했을 때 대응',
  '트렌드·정책형': '핵심 요약(무엇/언제/누구) → 이전 vs 이후 비교표 → 배경 → 대상별 영향 → 지금 할 행동 → 전망',
  '케이스·대상별형':'셀프 진단 → 대상별 섹션(상황→방법→숫자→제약) → 비교표 → 솔직한 컷오프 → 공통 팁',
};

// ── 유틸 ──
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) return { generated: [], history: [] };
  const state = loadJson(STATE_PATH);
  return {
    ...state,
    generated: Array.isArray(state.generated) ? state.generated : [],
    history: Array.isArray(state.history) ? state.history : [],
  };
}

function saveState(state) {
  state.generated = Array.from(new Set(state.generated));
  state.history = state.history.slice(-HISTORY_LIMIT);
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function topicKey(topic) {
  return `${topic.category}:${topic.id}`;
}

function generatedSet(state) {
  const done = new Set();
  for (const value of state.generated) {
    if (typeof value === 'number') {
      done.add(`대출연구소:${value}`);
    } else if (typeof value === 'string') {
      done.add(value);
    }
  }
  return done;
}

function charCount(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s/g, '').length;
}

function plainText(html) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function metaCharCount(value) {
  return Array.from(String(value ?? '').replace(/\s+/g, ' ').trim()).length;
}

// ── 생성 대상 선택 ──
function pickTargets(topics, state, limit) {
  const done = generatedSet(state);
  return topics
    .filter(t => t.archetype && t.status === '예정' && !done.has(topicKey(t)))
    .slice(0, limit);
}

// ── few-shot 샘플 ──
function loadSamples() {
  if (!fs.existsSync(SAMPLES_DIR)) return [];
  return fs.readdirSync(SAMPLES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => withMetaDescription(loadJson(path.join(SAMPLES_DIR, f))));
}

function sampleMetaDescription(sample) {
  const title = String(sample.title ?? '머니픽 금융 글');
  const text = `${title}를 처음 확인하는 분을 위해 기본 개념, 준비할 서류, 신청 전 체크할 점을 쉽게 정리했어요. 핵심 기준과 실수하기 쉬운 부분까지 한 번에 살펴보세요.`;
  return Array.from(text).slice(0, 150).join('');
}

function withMetaDescription(sample) {
  if (metaCharCount(sample.metaDescription) >= 120) return sample;
  return { ...sample, metaDescription: sampleMetaDescription(sample) };
}

function pickShots(samples, archetype) {
  const same   = samples.filter(s => s.archetype === archetype);
  const others = samples.filter(s => s.archetype !== archetype);
  return [...same, ...others].slice(0, 2);
}

function siblingTitles(topics, topic) {
  return topics
    .filter(t => t.category === topic.category && t.id !== topic.id)
    .map(t => t.title)
    .slice(0, 12);
}

// ── 사례 자동 생성 (Phase 2 ①) ──
// AI가 숫자를 지어내지 않도록, 실제 계산기 공식으로 미리 계산한 사례를 프롬프트에 주입한다.
// topics.json에는 relatedCalculators 필드가 없으므로(그건 AI 출력 스키마 쪽 필드),
// 제목+planTags 키워드로 관련 계산기를 추정한다. 순서가 우선순위(먼저 매칭되는 것 사용).
const CALCULATOR_KEYWORDS = {
  dsr: ['DSR'],
  'acquisition-tax': ['취득세'],
  'jeonse-loan': ['전세자금대출', '전세대출'],
  mortgage: ['주택담보대출', '담보대출'],
};

function detectScenarioCalculator(topic) {
  const text = [topic.title, ...(topic.planTags || [])].filter(Boolean).join(' ');
  for (const slug of SCENARIO_SUPPORTED_CALCULATORS) {
    const keywords = CALCULATOR_KEYWORDS[slug] || [];
    if (keywords.some((kw) => text.includes(kw))) return slug;
  }
  return null;
}

function buildScenarioBlock(topic) {
  const slug = detectScenarioCalculator(topic);
  if (!slug) return null;

  const scenarios = generateSampleScenarios(slug);
  if (!scenarios.length) return null;

  const lines = scenarios.map((sc, i) => {
    const resultText = sc.results.map((r) => `${r.label} ${formatResultValue(r)}`).join(', ');
    return `  ${i + 1}) ${sc.name} → ${resultText}`;
  });

  return {
    slug,
    scenarioNames: scenarios.map((s) => s.name),
    block: [
      `[실제 계산된 사례 데이터 — 숫자를 새로 지어내지 말고 반드시 이 값을 그대로 사용할 것]`,
      `아래는 '${slug}' 계산기 공식으로 실제로 계산한 결과입니다. 이 중 최소 2개를 골라 실제 사람의 상황처럼 자연스럽게 풀어서 서술하세요(숫자를 다시 계산하거나 변형하지 마세요).`,
      ...lines,
    ].join('\n'),
  };
}

// ── 공식 확인처 자동 연결 (v1) ──
function buildSourcesPromptBlock(matched) {
  if (!matched.length) return null;
  const list = matched.map(a => `  - ${a.name} (${a.url}): ${a.description}`).join('\n');
  return [
    `[공식 확인처 안내 — 아래 기관 정보를 참고하되 다음 규칙을 반드시 지킬 것]`,
    `독자가 추가 확인할 수 있는 공식 기관입니다. 이 기관들이 직접 검증하지 않은 사실을 "기관이 발표했다", "공식 자료에 따르면"이라고 단정하지 마세요.`,
    `제공된 기관명·URL 외의 기관명이나 URL을 임의로 만들지 마세요.`,
    `정책·금리·세율·지원 조건처럼 변경 가능한 정보에는 "기준일 기준" 또는 "[확인 필요]" 마커를 활용하세요.`,
    `기관 링크를 본문에 반복 삽입하지 마세요. 공식 확인처 섹션은 시스템이 자동으로 추가합니다.`,
    `관련 공식 기관:`,
    list,
  ].join('\n');
}

function buildSourcesHtml(matched, dateStr) {
  if (!matched.length) return '';
  const items = matched
    .map(a =>
      `<li><a href="${a.url}" target="_blank" rel="noopener noreferrer"><strong>${a.name}</strong></a><br>${a.description}</li>`,
    )
    .join('\n');
  return [
    `<div class="mp-official-sources">`,
    `<h2>공식 확인처</h2>`,
    `<ul>`,
    items,
    `</ul>`,
    `<p class="mp-official-sources-date">기준일: ${dateStr}</p>`,
    `<p class="mp-official-sources-note">정책과 세부 조건은 변경될 수 있으므로 신청 또는 의사결정 전에 공식 기관의 최신 내용을 확인하세요.</p>`,
    `</div>`,
  ].join('\n');
}

function buildUserPrompt(topic, siblings) {
  return [
    `다음 한 개 주제로 머니픽 아티클 초안 JSON을 작성하세요.`,
    ``,
    `- id: ${topic.id}`,
    `- category: ${topic.category}`,
    `- archetype: ${topic.archetype}`,
    `- title: ${topic.title}`,
    `- metaDescription: Korean SEO summary, 120-150 characters, minimum 120 and maximum 180. Do not copy the body opening.`,
    `- 글유형 스켈레톤: ${SKELETON[topic.archetype] ?? '시스템 규칙 참고'}`,
    `- 참고 태그: ${(topic.planTags || []).join(', ') || '(없음)'}`,
    ``,
    `recommended 후보(같은 카테고리 내 다른 글 — 관련된 3~4개 골라 slug 합리적으로 생성):`,
    siblings.map(s => `  · ${s}`).join('\n'),
    ``,
    `규칙을 모두 지켜 JSON 객체 하나만 출력하세요. 코드펜스·설명 금지.`,
  ].join('\n');
}

function extractJson(text) {
  const t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('JSON 객체를 찾지 못함');
  return JSON.parse(t.slice(s, e + 1));
}

// ── 검증 ──
const REQUIRED = ['title', 'slug', 'category', 'archetype', 'heroStat', 'metaDescription', 'readingTime',
                  'relatedCalculators', 'tags', 'recommended', 'bodyHtml'];
function validate(obj) {
  const missing = REQUIRED.filter(k => !obj[k]);
  if (missing.length) throw new Error('필드 누락: ' + missing.join(', '));
  const metaLength = metaCharCount(obj.metaDescription);
  if (metaLength < 120) throw new Error(`metaDescription 120자 미만: ${metaLength}자`);
  if (metaLength > 180) throw new Error(`metaDescription 180자 초과: ${metaLength}자`);
  if (!Array.isArray(obj.relatedCalculators) || obj.relatedCalculators.length < 3)
    throw new Error('relatedCalculators 3개 이상 필요');
  if (!/<ul class="mp-summary">/.test(obj.bodyHtml)) throw new Error('mp-summary 누락');
  if (!/<div class="mp-faq">/.test(obj.bodyHtml))    throw new Error('mp-faq 누락');
  if (/style=/.test(obj.bodyHtml)) throw new Error('인라인 style 발견');
}

// ── Claude API 호출 ──
async function generateDraft(client, systemPrompt, topic, topics, samples, extraBlocks = []) {
  const shots = pickShots(samples, topic.archetype);
  const messages = [];
  for (const s of shots) {
    const fakeTopic = { id: s.id, category: s.category, archetype: s.archetype,
                        title: s.title, planTags: s.tags || [] };
    messages.push({ role: 'user',      content: buildUserPrompt(fakeTopic, (s.recommended||[]).map(r=>r.title)) });
    messages.push({ role: 'assistant', content: JSON.stringify(s) });
  }
  const targetPrompt = buildUserPrompt(topic, siblingTitles(topics, topic));
  const fullPrompt = [targetPrompt, ...extraBlocks.filter(Boolean)].join('\n\n');
  messages.push({ role: 'user', content: fullPrompt });

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages,
  });
  const text = resp.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return extractJson(text);
}

async function repairMetaDescription(client, obj) {
  const sourceText = plainText(obj.bodyHtml).slice(0, 800);
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: 'You write Korean SEO meta descriptions for MoneyPick. Return only one plain Korean sentence. No JSON, no quotes, no markdown.',
    messages: [{
      role: 'user',
      content: [
        'Rewrite metaDescription in Korean.',
        'Length: 130-150 Korean characters, never under 120 and never over 180.',
        'Structure: what this article is about + who should read it + core value.',
        'Tone: friendly hae-yo style. Do not copy the body opening.',
        `Title: ${obj.title}`,
        `Category: ${obj.category}`,
        `Hero: ${obj.heroStat ?? ''}`,
        `Current metaDescription: ${obj.metaDescription ?? ''}`,
        `Article gist: ${sourceText}`,
      ].join('\n'),
    }],
  });

  return resp.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── 관리자 API에 draft 저장 ──
async function postDraft(obj, thumbnailUrl) {
  const adminApiUrl = process.env.ADMIN_API_URL?.trim();
  const adminApiKey = process.env.ADMIN_API_KEY?.trim();

  if (!adminApiUrl || !adminApiKey) {
    throw new Error('ADMIN_API_URL 또는 ADMIN_API_KEY 가 .env에 없어요.');
  }

  const endpoint = adminApiUrl.replace(/\/+$/, '') + '/api/admin/articles/draft';

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminApiKey}`,
    },
    body: JSON.stringify({
      title:           obj.title,
      seoTitle:        obj.seoTitle ?? obj.title,
      slug:            obj.slug,
      category:        obj.category,
      summary:         obj.metaDescription ?? obj.heroStat ?? '',
      metaDescription: obj.metaDescription ?? obj.heroStat ?? '',
      heroValue:       obj.heroStat?.split(' / ')[0]?.trim() ?? '',
      heroLabel:       obj.heroStat?.split(' / ')[1]?.trim() ?? '',
      readingTime:     obj.readingTime ?? '5분',
      contentHtml:     obj.bodyHtml,
      tags:            obj.tags ?? [],
      thumbnailUrl:    thumbnailUrl ?? null,
      articleType:     obj.articleType ?? null,
      patternId:       obj.patternId ?? null,
      relatedSlugs:    Array.isArray(obj.recommended)
                         ? obj.recommended.map(r => r?.slug).filter(Boolean)
                         : [],
      status:          'draft',
      source:          'claude_scheduled',
    }),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new Error(`API ${resp.status}: ${data?.error ?? resp.statusText}`);
  return data;
}

// ── 메인 ──
async function main() {
  const topics         = loadJson(TOPICS_PATH);
  const state          = loadState();
  const systemPrompt   = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  const samples        = loadSamples();
  const patternsConfig = loadJson(PATTERNS_PATH);
  const targets        = pickTargets(topics, state, LIMIT);

  const total   = topics.filter(t => t.archetype && t.status === '예정').length;
  const done    = generatedSet(state).size;
  const remain  = Math.max(total - done, 0);

  console.log(`\n머니픽 스케줄 생성기 — ${new Date().toLocaleString('ko-KR')}`);
  console.log(`전체 생성 가능: ${total}개 / 완료: ${done}개 / 남은: ${remain}개`);
  console.log(`오늘 대상: ${targets.length}개 / 모델: ${MODEL}${DRY ? ' (dry-run)' : ''}\n`);

  if (targets.length === 0) {
    console.log('생성할 주제가 없어요. 아키타입 배정 후 다시 실행하세요.');
    return;
  }

  const linkCache = loadLinkCache();
  console.log(`내부링크 캐시: ${linkCache.length}개 항목`);

  if (DRY) {
    const previewHistory = state.history.slice();
    targets.forEach(t => {
      const typeResult = selectArticleType(t);
      const { patternId, pattern } = pickPattern(typeResult.articleType, previewHistory, patternsConfig);
      const titleStyle = pickTitleStyle(previewHistory);
      console.log(`\n· (dry) #${t.id} [${t.archetype}] ${t.title}`);
      logSelection({ topic: t, typeResult, patternId, pattern, titleStyle });
      const scenario = buildScenarioBlock(t);
      console.log(`scenarios: ${scenario ? `${scenario.slug} → ${scenario.scenarioNames.join(' / ')}` : '(해당 계산기 프리셋 없음)'}`);
      const dryMatched = matchSources(t);
      console.log(`sources: ${dryMatched.length ? dryMatched.map(a => a.name).join(', ') : '(매칭 없음)'}`);
      const dryScenario = buildScenarioBlock(t);
      const dryCalcSlugs = dryScenario?.slug ? [dryScenario.slug] : [];
      const dryCandidates = matchRecommended(t, linkCache, 5, null, dryCalcSlugs, DEBUG);
      console.log(`recommended 후보(${dryCandidates.length}개): ${dryCandidates.length ? dryCandidates.map(c => c.slug).join(', ') : '(캐시 없음 — 기존 방식)'}`);
      previewHistory.push({ topicKey: topicKey(t), articleType: typeResult.articleType, patternId, titleStyle });
    });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY 가 없어요. .env에 추가하세요.');
    process.exit(1);
  }

  const client = new Anthropic();
  const results = { success: [], failed: [] };

  for (const topic of targets) {
    const label = `#${topic.id} [${topic.archetype}] ${topic.title}`;
    let lastErr;

    // 기사 유형 / 패턴 / 제목 스타일 선택 (재시도해도 동일 선택 유지)
    const typeResult  = selectArticleType(topic);
    const { patternId, pattern } = pickPattern(typeResult.articleType, state.history, patternsConfig);
    const titleStyle  = pickTitleStyle(state.history);
    const patternBlock = buildPatternPromptBlock(typeResult.articleType, patternId, pattern, titleStyle);
    logSelection({ topic, typeResult, patternId, pattern, titleStyle });

    // 사례 자동 생성: 실제 계산기 공식으로 미리 계산한 값을 프롬프트에 주입 (있는 경우만)
    const scenario = buildScenarioBlock(topic);
    console.log(`scenarios: ${scenario ? `${scenario.slug} → ${scenario.scenarioNames.join(' / ')}` : '(해당 계산기 프리셋 없음)'}`);

    // 공식 확인처 매칭 (재시도 루프 밖에서 한 번만 수행)
    const matchedSources = matchSources(topic);
    const sourcesBlock = buildSourcesPromptBlock(matchedSources);
    if (matchedSources.length) {
      console.log(`sources: ${matchedSources.map(a => a.name).join(', ')}`);
    }

    // 내부링크 추천 후보 (실제 생성된 글 슬러그 기반)
    const scenarioSlug = scenario?.slug ? [scenario.slug] : [];
    const linkCandidates = matchRecommended(topic, linkCache, 5, null, scenarioSlug, DEBUG);
    const recommendedBlock = buildRecommendedBlock(linkCandidates);
    if (DEBUG) {
      console.log(`[DEBUG] 캐시 크기: ${linkCache.length}개`);
      console.log(`[DEBUG] 계산기 힌트: ${scenarioSlug.join(', ') || '없음'}`);
      console.log(`[DEBUG] 최종 추천 후보: ${linkCandidates.length}개`);
    }
    if (linkCandidates.length) {
      console.log(`recommended 후보(${linkCandidates.length}개): ${linkCandidates.map(c => c.slug).join(', ')}`);
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 1) 생성
        const obj = await generateDraft(client, systemPrompt, topic, topics, samples, [patternBlock, scenario?.block, sourcesBlock, recommendedBlock]);
        obj.id       = topic.id;
        if (!obj.metaDescription && obj.meta_description) obj.metaDescription = obj.meta_description;
        obj.category = topic.category;
        obj.archetype = topic.archetype;
        obj.articleType = typeResult.articleType;
        obj.patternId   = patternId;
        obj.status   = 'draft';
        if (metaCharCount(obj.metaDescription) < 120 || metaCharCount(obj.metaDescription) > 180) {
          obj.metaDescription = await repairMetaDescription(client, obj);
        }
        validate(obj);

        // 공식 확인처 HTML을 bodyHtml 끝에 append (validate 이후이므로 검증 영향 없음)
        if (matchedSources.length) {
          const dateStr = new Date().toISOString().slice(0, 10);
          obj.bodyHtml += '\n' + buildSourcesHtml(matchedSources, dateStr);
        }

        // 2) 썸네일 생성 (실패해도 글 등록은 계속)
        let thumbnailUrl = null;
        try {
          thumbnailUrl = await generateThumbnail({
            category: obj.category,
            archetype: obj.archetype,
            slug: obj.slug,
          });
        } catch (e) {
          console.warn(`  썸네일 생성 실패 (계속 진행): ${e.message}`);
        }

        // 3) 관리자 API 저장
        const saved = await postDraft(obj, thumbnailUrl);
        const cc    = charCount(obj.bodyHtml);
        const flag  = /\[확인 필요\]/.test(obj.bodyHtml) ? ' ⚑확인필요' : '';

        console.log(`✓ ${label}`);
        console.log(`  → articleId: ${saved.articleId} | ${cc}자${flag}${thumbnailUrl ? ' | 🖼️' : ''}`);
        console.log(`  → ${saved.editUrl}`);

        state.generated.push(topicKey(topic));
        state.history.push({
          topicKey: topicKey(topic),
          articleType: typeResult.articleType,
          patternId,
          titleStyle,
          generatedAt: new Date().toISOString(),
        });
        saveState(state);

        // 내부링크 캐시에 이번 글 추가 (다음 생성 시 recommended 후보로 사용)
        const calcSlugs = (obj.relatedCalculators ?? [])
          .map(s => (typeof s === 'string' ? s : null))
          .filter(Boolean);
        addToLinkCache(linkCache, {
          slug: obj.slug,
          title: obj.title,
          categoryLabel: topic.category,
          tags: obj.tags ?? [],
          calcSlugs,
          views: 0,
          publishedAt: new Date().toISOString().slice(0, 10),
        });
        saveLinkCache(linkCache);

        results.success.push(topic.id);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`  재시도 ${attempt}/3 — ${e.message}`);
        await sleep(3000 * attempt);
      }
    }

    if (lastErr) {
      console.error(`✗ 실패 ${label} — ${lastErr.message}`);
      results.failed.push(topic.id);
    }
    await sleep(SLEEP_MS);
  }

  console.log(`\n완료: 성공 ${results.success.length}개 / 실패 ${results.failed.length}개`);
  console.log(`관리자에서 검수 후 발행하세요: ${process.env.ADMIN_API_URL}/mp-hub-8r6q2/articles`);
}

main().catch(e => { console.error(e); process.exit(1); });
