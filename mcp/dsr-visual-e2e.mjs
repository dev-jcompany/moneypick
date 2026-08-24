#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { articleSchemaToLegacyHtml, validateArticleSchemaV2 } from '../lib/article-system/article-schema.mjs';
import { createSupabaseVisualStorage, safeArticleAssetPath } from '../lib/article-system/image-pipeline.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const filename of ['.env.local', 'mcp/.env']) {
  const fullPath = path.join(root, filename);
  if (!fs.existsSync(fullPath)) continue;
  for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index <= 0 || line.trim().startsWith('#')) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] == null) process.env[key] = value;
  }
}

const assets = [
  { id: 'visual-01', file: 'dsr-income-debt-concept.webp', purpose: 'CONCEPT', composition: 'PERSON_OBJECT', alt: '직장인이 소득과 대출 부담의 관계를 검토하는 금융 일러스트' },
  { id: 'visual-02', file: 'dsr-repayment-balance.webp', purpose: 'EXPLANATION', composition: 'CENTER_FOCUS', alt: '소득 대비 원리금 상환 부담의 균형을 설명하는 금융 일러스트' },
  { id: 'visual-03', file: 'dsr-burden-comparison.webp', purpose: 'COMPARISON', composition: 'LEFT_RIGHT', alt: '낮은 부채 부담과 높은 부채 부담을 비교하는 금융 일러스트' },
];

async function uploadAssets() {
  const storage = createSupabaseVisualStorage();
  const visuals = [];
  for (const definition of assets) {
    const bytes = fs.readFileSync(path.join(root, 'public', 'images', 'articles', definition.file));
    const objectPath = safeArticleAssetPath('dsr-visual-e2e-20260824', definition.id, bytes);
    let url;
    try {
      url = await storage.upload({ path: objectPath, bytes, mimeType: 'image/webp' });
    } catch (error) {
      if (error?.code !== 'storage_upload' || !/already exists|duplicate/i.test(error.message)) throw error;
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
      url = `${base}/storage/v1/object/public/${storage.bucket}/${objectPath}`;
    }
    visuals.push({
      ...definition,
      style: 'MONEYPICK_MINIMAL_FLAT',
      type: definition.purpose === 'COMPARISON' ? 'COMPARISON' : 'EDITORIAL',
      visualSpec: { subject: 'DSR 계산과 소득 대비 원리금 부담', objects: [] },
      asset: { url, width: 1400, height: 788, mimeType: 'image/webp' },
    });
  }
  return visuals;
}

function buildSchema(visuals) {
  return {
    version: 2,
    contentType: 'CALCULATOR_FOCUSED',
    pattern: 'CALCULATOR_01',
    variant: 'A',
    visuals,
    blocks: [
      { type: 'summary', variant: 'S2', items: ['DSR은 연 소득과 연간 원리금 상환액의 관계를 보는 지표예요.', '대출 한도 판단 전 소득과 모든 부채의 상환액을 함께 확인해야 해요.', '정확한 결과는 검증된 DSR 계산기로 확인하세요.'] },
      { type: 'visual', visualId: 'visual-01' },
      { type: 'heading', text: 'DSR이 보여주는 것' },
      { type: 'paragraph', text: 'DSR은 연간 원리금 상환액이 연 소득에서 차지하는 비중을 확인하는 지표입니다. 금융기관과 상품별 산정 기준이 다를 수 있으므로 실제 심사 전에는 최신 기준을 확인해야 합니다.' },
      { type: 'numberResult', variant: 'HIGHLIGHT', label: '검증용 예시 결과', value: '30%', caption: '예시 입력값을 계산기 공식으로 산출한 표시 영역이며 AI 이미지 안에는 숫자를 넣지 않았습니다.' },
      { type: 'visual', visualId: 'visual-02' },
      { type: 'heading', text: '부채 부담을 함께 비교하세요' },
      { type: 'comparison', variant: 'TABLE', caption: '부채 부담 비교 예시', headers: ['구분', '낮은 부담', '높은 부담'], rows: [['상환 여력', '상대적으로 여유', '추가 점검 필요'], ['대출 전 확인', '기존 부채 포함', '상환 계획 우선']] },
      { type: 'paragraph', text: '같은 소득이라도 기존 대출의 종류와 상환 방식에 따라 결과가 달라질 수 있습니다. 숫자는 임의로 추정하지 말고 계산기 입력값과 공식 자료를 기준으로 판단하세요.' },
      { type: 'visual', visualId: 'visual-03' },
      { type: 'example', text: '예시: 직장인이 새 대출을 검토할 때는 연 소득뿐 아니라 기존 주택담보대출, 신용대출 등 연간 원리금 상환액을 함께 입력해 비교합니다.' },
      { type: 'calculator', items: [{ label: 'DSR 계산기', href: '/calculators/dsr', caption: '검증된 계산식으로 직접 확인' }] },
      { type: 'faq', items: [{ q: 'DSR은 낮을수록 좋은가요?', a: '일반적으로 상환 부담이 상대적으로 낮다는 의미지만 실제 대출 가능 여부는 금융기관 심사와 최신 규정을 함께 확인해야 합니다.' }] },
    ],
  };
}

const productionConfirmed = process.argv.includes('--production-confirmed');
const uploadRequested = process.argv.includes('--upload');
if ((uploadRequested || process.argv.includes('--create-draft')) && !productionConfirmed) {
  throw new Error('Production mutation requires the explicit --production-confirmed flag');
}
const visuals = uploadRequested
  ? await uploadAssets()
  : assets.map((definition) => ({
      ...definition,
      style: 'MONEYPICK_MINIMAL_FLAT',
      type: definition.purpose === 'COMPARISON' ? 'COMPARISON' : 'EDITORIAL',
      visualSpec: { subject: 'DSR 계산과 소득 대비 원리금 부담', objects: [] },
      asset: { url: `/images/articles/${definition.file}`, width: 1400, height: 788, mimeType: 'image/webp' },
    }));
const schema = buildSchema(visuals);
const validation = validateArticleSchemaV2(schema);
if (!validation.valid) throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
console.log(JSON.stringify({ uploaded: visuals.map((visual) => visual.asset.url), schemaValid: true }, null, 2));

if (process.argv.includes('--create-draft')) {
  if (!uploadRequested) throw new Error('--create-draft requires --upload so Draft assets use permanent Storage URLs');
  const apiKey = process.env.ADMIN_API_KEY?.trim();
  const siteUrl = (process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://moneypick.co.kr').replace(/\/$/, '');
  if (!apiKey) throw new Error('ADMIN_API_KEY is required for draft creation');
  const response = await fetch(`${siteUrl}/api/admin/articles/draft`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '[V2 Visual E2E] DSR 계산 가이드', seoTitle: 'DSR 계산 가이드 | MoneyPick V2 Visual E2E', slug: 'dsr-visual-e2e-20260824', category: 'loan',
      summary: 'DSR 계산과 소득 대비 원리금 부담을 구조화 블록과 금융 일러스트로 확인하는 관리자 검수용 비공개 초안입니다.',
      metaDescription: 'DSR 계산과 소득 대비 원리금 부담을 구조화 블록과 금융 일러스트로 확인하는 관리자 검수용 비공개 초안입니다.',
      contentHtml: articleSchemaToLegacyHtml(schema), summaryItems: schema.blocks[0].items, faq: schema.blocks.at(-1).items,
      tags: ['DSR', 'Article V2', 'Visual E2E'], relatedCalculators: [{ label: 'DSR 계산기', href: '/calculators/dsr' }],
      readingTime: '4분', articleType: schema.contentType, patternId: schema.pattern, articleSchema: schema, status: 'draft', source: 'codex_visual_e2e',
    }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Draft API ${response.status}: ${body?.error ?? response.statusText}`);
  console.log(JSON.stringify({ articleId: body.articleId, editUrl: body.editUrl, status: body.status }, null, 2));
}
