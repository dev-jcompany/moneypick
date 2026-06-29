#!/usr/bin/env node
// 癒몃땲???ㅼ?以??앹꽦湲?// 留ㅼ씪 ?ㅽ뻾 ??topics.json ?먯꽌 ?덉젙+?꾪궎????덈뒗 湲??N媛?戮묒븘
// Claude API濡?珥덉븞 ?앹꽦 ??癒몃땲??愿由ъ옄 API濡?draft ???//
// ?ъ슜:
//   node scheduled-generator.mjs              # 湲곕낯 6媛?//   node scheduled-generator.mjs --limit 3    # 3媛쒕쭔
//   node scheduled-generator.mjs --dry        # 鍮꾩슜 ?놁씠 ??곷쭔 異쒕젰

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { generateThumbnail } from './thumbnail-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ?? ?섍꼍蹂??濡쒕뱶 ??
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

// ?? CLI ??
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

// ?? ?곸닔 ??
const TOPICS_PATH = path.join(__dirname, 'topics.json');
const STATE_PATH  = path.join(__dirname, 'schedule-state.json'); // 吏꾪뻾 ?곹깭
const SYSTEM_PROMPT_PATH = path.join(__dirname, 'system-prompt.md');
const SAMPLES_DIR = path.join(__dirname, 'samples');
const SLEEP_MS = 2000;

// ?? 湲?좏삎蹂??ㅼ펷?덊넠 由щ쭏?몃뜑 ??
const SKELETON = {
  '媛쒕뀗?뺣━??:    '?뺤쓽 ??鍮꾧탳?????묐룞?먮━(?レ옄 ?덉떆) ???뷀븳 ?ㅽ빐 3媛吏',
  '鍮꾧탳??:        '??鍮꾧탳??????ぉ蹂?源딆씠 鍮꾧탳 ???곹솴蹂?A/B 異붿쿇 ???ㅼ젣 ?щ? 2紐?,
  '?섏슦??룹젅李⑦삎': '以鍮꾨Ъ ??STEP 0~N(?④퀎留덈떎 h2, ?곸꽭+?? ???④퀎蹂??뷀븳 ?ㅼ닔 ???꾨즺 泥댄겕',
  '?꾨꼍媛?대뱶??:  '?먭꺽 ???쒕룄 ??湲덈━ ???좎껌 ???ㅼ쟾 ?쒕??덉씠??媛??뱀뀡 ??',
  '轅?겶룸━?ㅽ듃??: '??ぉ留덈떎 誘몃땲 ?뱀뀡(?ㅻ챸+??以묒슂+?ㅼ쿇踰? ???④낵 洹밸???,
  '?⑥젙二쇱쓽??:    '異⑷꺽 ?ㅽ봽?????⑥젙 1~N(?곹솴?믪씠?졻넂?먰빐 ?덉떆?믫쉶???泥? ???꾪뿕?좏샇 泥댄겕 ???뱁뻽???????,
  '?몃젋?쑣룹젙梨낇삎': '?듭떖 ?붿빟(臾댁뾿/?몄젣/?꾧뎄) ???댁쟾 vs ?댄썑 鍮꾧탳????諛곌꼍 ????곷퀎 ?곹뼢 ??吏湲????됰룞 ???꾨쭩',
  '耳?댁뒪쨌??곷퀎??:'???吏꾨떒 ????곷퀎 ?뱀뀡(?곹솴?믩갑踰뺚넂?レ옄?믪젣?? ??鍮꾧탳?????붿쭅??而룹삤????怨듯넻 ??,
};

// ?? ?좏떥 ??
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

function sampleMetaDescription(sample) {
  if (sample.metaDescription) return sample.metaDescription;
  const title = String(sample.title ?? '湲덉쑖 ?뺣낫');
  const hero = String(sample.heroStat ?? '').replace(/\s*\/\s*/g, ' ');
  return `${title}???듭떖 湲곗?怨??쒖슜 諛⑸쾿??湲덉쑖 珥덈낫?먮룄 ?댄빐?섍린 ?쎄쾶 ?뺣━?덉뼱?? ${hero}??以묒떖?쇰줈 ?좎껌 ???뺤씤??議곌굔怨?二쇱쓽???먭퉴吏 ??踰덉뿉 ?댄렣蹂????덉뼱??`;
}

function withMetaDescription(sample) {
  return {
    ...sample,
    metaDescription: sampleMetaDescription(sample),
  };
}

// ?? ?앹꽦 ????좏깮 ??
function pickTargets(topics, state, limit) {
  const done = new Set(state.generated);
  return topics
    .filter(t => t.archetype && t.status === '?덉젙' && !done.has(t.id))
    .slice(0, limit);
}

// ?? few-shot ?섑뵆 ??
function loadSamples() {
  if (!fs.existsSync(SAMPLES_DIR)) return [];
  return fs.readdirSync(SAMPLES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => loadJson(path.join(SAMPLES_DIR, f)));
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
    `?ㅼ쓬 ??媛?二쇱젣濡?癒몃땲???꾪떚??珥덉븞 JSON???묒꽦?섏꽭??`,
    ``,
    `- id: ${topic.id}`,
    `- category: ${topic.category}`,
    `- archetype: ${topic.archetype}`,
    `- title: ${topic.title}`,
    `- 湲?좏삎 ?ㅼ펷?덊넠: ${SKELETON[topic.archetype] ?? '?쒖뒪??洹쒖튃 李멸퀬'}`,
    `- 李멸퀬 ?쒓렇: ${(topic.planTags || []).join(', ') || '(?놁쓬)'}`,
    ``,
    `recommended ?꾨낫(媛숈? 移댄뀒怨좊━ ???ㅻⅨ 湲 ??愿?⑤맂 3~4媛?怨⑤씪 slug ?⑸━?곸쑝濡??앹꽦):`,
    siblings.map(s => `  쨌 ${s}`).join('\n'),
    ``,
    `metaDescription ?꾨뱶??諛섎뱶???ы븿?섍퀬, 蹂몃Ц 泥?臾몄옣???꾨땲??寃??寃곌낵??SEO ?붿빟?쇰줈 120~150???묒꽦?섏꽭?? 120??誘몃쭔? 湲덉??낅땲??`,
    ``,
    `洹쒖튃??紐⑤몢 吏耳?JSON 媛앹껜 ?섎굹留?異쒕젰?섏꽭?? 肄붾뱶?쒖뒪쨌?ㅻ챸 湲덉?.`,
  ].join('\n');
}

function extractJson(text) {
  const t = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s === -1 || e === -1) throw new Error('JSON 媛앹껜瑜?李얠? 紐삵븿');
  return JSON.parse(t.slice(s, e + 1));
}

// ?? 寃利???
const REQUIRED = ['title', 'slug', 'category', 'archetype', 'heroStat', 'readingTime',
                  'relatedCalculators', 'tags', 'recommended', 'bodyHtml'];
function validate(obj) {
  const missing = REQUIRED.filter(k => !obj[k]);
  if (missing.length) throw new Error('?꾨뱶 ?꾨씫: ' + missing.join(', '));
  if (String(obj.metaDescription).length > 180) throw new Error('metaDescription 180??珥덇낵');
  if (String(obj.metaDescription).length < 120) throw new Error('metaDescription 120??誘몃쭔');
  if (!Array.isArray(obj.relatedCalculators) || obj.relatedCalculators.length < 3)
    throw new Error('relatedCalculators 3媛??댁긽 ?꾩슂');
  if (!/<ul class="mp-summary">/.test(obj.bodyHtml)) throw new Error('mp-summary ?꾨씫');
  if (!/<div class="mp-faq">/.test(obj.bodyHtml))    throw new Error('mp-faq ?꾨씫');
  if (/style=/.test(obj.bodyHtml)) throw new Error('?몃씪??style 諛쒓껄');
}

// ?? Claude API ?몄텧 ??
async function generateDraft(client, systemPrompt, topic, topics, samples) {
  const shots = pickShots(samples, topic.archetype);
  const messages = [];
  for (const s of shots) {
    const fakeTopic = { id: s.id, category: s.category, archetype: s.archetype,
                        title: s.title, planTags: s.tags || [] };
    messages.push({ role: 'user',      content: buildUserPrompt(fakeTopic, (s.recommended||[]).map(r=>r.title)) });
    messages.push({ role: 'assistant', content: JSON.stringify(withMetaDescription(s)) });
  }
  messages.push({ role: 'user', content: buildUserPrompt(topic, siblingTitles(topics, topic)) });

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: systemPrompt,
    messages,
  });
  const text = resp.content.filter(b => b.type === 'text').map(b => b.text).join('');
  const obj = extractJson(text);
  if (!obj.metaDescription && obj.meta_description) obj.metaDescription = obj.meta_description;
  return obj;
}

// ?? 愿由ъ옄 API??draft ?????
async function postDraft(obj) {
  const adminApiUrl = process.env.ADMIN_API_URL?.trim();
  const adminApiKey = process.env.ADMIN_API_KEY?.trim();

  if (!adminApiUrl || !adminApiKey) {
    throw new Error('ADMIN_API_URL ?먮뒗 ADMIN_API_KEY 媛 .env???놁뼱??');
  }

  const endpoint = adminApiUrl.replace(/\/+$/, '') + '/api/admin/articles/draft';

  // heroStat = "0.5%p / 湲덈━留???떠???섎갚留??먯씠 援녹뼱?? ??heroValue / heroLabel 遺꾨━
  const [heroValue = '', heroLabel = ''] = (obj.heroStat ?? '').split(' / ').map(s => s.trim());
  const metaDescription = obj.metaDescription ?? obj.heroStat ?? '';

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminApiKey}`,
    },
    body: JSON.stringify({
      title:        obj.title,
      seoTitle:     obj.seoTitle ?? obj.title,
      slug:         obj.slug,
      category:     obj.category,
      summary:      metaDescription,
      contentHtml:  obj.bodyHtml,
      tags:         obj.tags ?? [],
      heroStat:     obj.heroStat ?? null,
      heroValue:    heroValue || null,
      heroLabel:    heroLabel || null,
      readingTime:  obj.readingTime ?? null,
      metaDescription,
      thumbnailUrl: obj.thumbnailUrl ?? null,
      status:       'draft',
      source:       'claude_scheduled',
    }),
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) throw new Error(`API ${resp.status}: ${data?.error ?? resp.statusText}`);
  return data;
}

// ?? 硫붿씤 ??
async function main() {
  const topics       = loadJson(TOPICS_PATH);
  const state        = loadState();
  const systemPrompt = fs.readFileSync(SYSTEM_PROMPT_PATH, 'utf8');
  const samples      = loadSamples();
  const targets      = pickTargets(topics, state, LIMIT);

  const total   = topics.filter(t => t.archetype && t.status === '?덉젙').length;
  const done    = state.generated.length;
  const remain  = total - done;

  console.log(`\n癒몃땲???ㅼ?以??앹꽦湲???${new Date().toLocaleString('ko-KR')}`);
  console.log(`?꾩껜 ?앹꽦 媛?? ${total}媛?/ ?꾨즺: ${done}媛?/ ?⑥?: ${remain}媛?);
  console.log(`?ㅻ뒛 ??? ${targets.length}媛?/ 紐⑤뜽: ${MODEL}${DRY ? ' (dry-run)' : ''}\n`);

  if (targets.length === 0) {
    console.log('?앹꽦??二쇱젣媛 ?놁뼱?? ?꾪궎???諛곗젙 ???ㅼ떆 ?ㅽ뻾?섏꽭??');
    return;
  }

  if (DRY) {
    targets.forEach(t => console.log(`쨌 (dry) #${t.id} [${t.archetype}] ${t.title}`));
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY 媛 ?놁뼱?? .env??異붽??섏꽭??');
    process.exit(1);
  }

  const client = new Anthropic();
  const results = { success: [], failed: [] };

  for (const topic of targets) {
    const label = `#${topic.id} [${topic.archetype}] ${topic.title}`;
    let lastErr;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // 1) ?앹꽦
        const obj = await generateDraft(client, systemPrompt, topic, topics, samples);
        obj.id       = topic.id;
        // metaDescription이 없으면 heroStat 또는 title로 대체
        if (!obj.metaDescription) {
          obj.metaDescription = obj.heroStat ?? obj.title;
        }
        obj.category = topic.category;
        obj.archetype = topic.archetype;
        obj.status   = 'draft';
        validate(obj);

        // 1.5) ?몃꽕???앹꽦 (?ㅽ뙣?대룄 湲 ??μ? 怨꾩냽)
        obj.thumbnailUrl = await generateThumbnail({ category: obj.category, archetype: obj.archetype, slug: obj.slug });

        // 2) 愿由ъ옄 API ???        const saved = await postDraft(obj);
        const cc    = charCount(obj.bodyHtml);
        const flag  = /\[?뺤씤 ?꾩슂\]/.test(obj.bodyHtml) ? ' ?묓솗?명븘?? : '';

        console.log(`??${label}`);
        console.log(`  ??articleId: ${saved.articleId} | ${cc}??{flag}`);
        console.log(`  ??${saved.editUrl}`);

        state.generated.push(topic.id);
        saveState(state);
        results.success.push(topic.id);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.warn(`  ?ъ떆??${attempt}/3 ??${e.message}`);
        await sleep(3000 * attempt);
      }
    }

    if (lastErr) {
      console.error(`???ㅽ뙣 ${label} ??${lastErr.message}`);
      results.failed.push(topic.id);
    }
    await sleep(SLEEP_MS);
  }

  console.log(`\n?꾨즺: ?깃났 ${results.success.length}媛?/ ?ㅽ뙣 ${results.failed.length}媛?);
  console.log(`愿由ъ옄?먯꽌 寃????諛쒗뻾?섏꽭?? ${process.env.ADMIN_API_URL}/mp-hub-8r6q2/articles`);
}

main().catch(e => { console.error(e); process.exit(1); });
