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
const DRY = args.includes('--dry');
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
const SLEEP_MS = 2000;

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
  if (!fs.existsSync(STATE_PATH)) return { generated: [] };
  return loadJson(STATE_PATH);
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
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
  const done = new Set(state.generated);
  return topics
    .filter(t => t.archetype && t.status === '예정' && !done.has(t.id))
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
async function generateDraft(client, systemPrompt, topic, topics, samples) {
  const shots = pickShots(samples, topic.archetype);
  const messages = [];
  for (const s of shots) {
    const fakeTopic = { id: s.id, category: s.category, archetype: s.archetype,
                        title: s.title, planTags: s.tags || [] };
    messages.push({ role: 'user',      content: buildUserPrompt(fakeTopic, (s.recommended||[]).map(r=>r.title)) });
    messages.push({ role: 'assistant', content: JSON.stringify(s) });
  }
  messages.push({ role: 'user', content: buildUserPrompt(topic, siblingTitles(topics, topic)) });

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
  const topics       = loadJson(TOPICS_PATH);
  const state        = loadState();
  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  const samples      = loadSamples();
  const targets      = pickTargets(topics, state, LIMIT);

  const total   = topics.filter(t => t.archetype && t.status === '예정').length;
  const done    = state.generated.length;
  const remain  = total - done;

  console.log(`\n머니픽 스케줄 생성기 — ${new Date().toLocaleString('ko-KR')}`);
  console.log(`전체 생성 가능: ${total}개 / 완료: ${done}개 / 남은: ${remain}개`);
  console.log(`오늘 대상: ${targets.length}개 / 모델: ${MODEL}${DRY ? ' (dry-run)' : ''}\n`);

  if (targets.length === 0) {
    console.log('생성할 주제가 없어요. 아키타입 배정 후 다시 실행하세요.');
    return;
  }

  if (DRY) {
    targets.forEach(t => console.log(`· (dry) #${t.id} [${t.archetype}] ${t.title}`));
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

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 1) 생성
        const obj = await generateDraft(client, systemPrompt, topic, topics, samples);
        obj.id       = topic.id;
        if (!obj.metaDescription && obj.meta_description) obj.metaDescription = obj.meta_description;
        obj.category = topic.category;
        obj.archetype = topic.archetype;
        obj.status   = 'draft';
        if (metaCharCount(obj.metaDescription) < 120 || metaCharCount(obj.metaDescription) > 180) {
          obj.metaDescription = await repairMetaDescription(client, obj);
        }
        validate(obj);

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

        state.generated.push(topic.id);
        saveState(state);
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
