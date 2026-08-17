import { generateSampleScenarios } from '../calculators/engine.mjs';
import { matchSources } from '../../mcp/official-registry.mjs';
import { selectArticleType } from '../../mcp/pattern-selector.mjs';

export const ARTICLE_TYPES = [
  'GUIDE',
  'COMPARISON',
  'CASE_STUDY',
  'CHECKLIST',
  'CALCULATOR_FOCUSED',
  'POLICY_CHANGE',
];

const DEFAULT_PATTERN = Object.fromEntries(ARTICLE_TYPES.map((type) => [type, `${type === 'CASE_STUDY' ? 'CASE' : type}_01`]));

const CALCULATORS = [
  { slug: 'dsr', label: 'DSR 계산기', href: '/calculators/dsr', keywords: ['dsr', '총부채원리금상환비율'] },
  { slug: 'acquisition-tax', label: '취득세 계산기', href: '/calculators/acquisition-tax', keywords: ['취득세'] },
  { slug: 'jeonse-loan', label: '전세대출 계산기', href: '/calculators/jeonse-loan', keywords: ['전세대출', '전세자금'] },
  { slug: 'mortgage', label: '주택담보대출 계산기', href: '/calculators/mortgage', keywords: ['주택담보대출', '담보대출', 'ltv'] },
  { slug: 'loan-refinancing', label: '대환대출 계산기', href: '/calculators/loan-refinancing', keywords: ['대환대출', '갈아타기'] },
  { slug: 'capital-gains-tax', label: '양도소득세 계산기', href: '/calculators/capital-gains-tax', keywords: ['양도소득세', '양도세'] },
  { slug: 'comprehensive-income-tax', label: '종합소득세 계산기', href: '/calculators/comprehensive-income-tax', keywords: ['종합소득세'] },
  { slug: 'deposit', label: '예금 이자 계산기', href: '/calculators/deposit', keywords: ['예금', '예금이자'] },
  { slug: 'compound-interest', label: '복리 계산기', href: '/calculators/compound-interest', keywords: ['복리'] },
];

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compactText(value) {
  return text(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function uniqueStrings(values, limit) {
  const result = [];
  for (const value of Array.isArray(values) ? values : []) {
    const item = compactText(value);
    if (item && !result.includes(item)) result.push(item);
    if (result.length >= limit) break;
  }
  return result;
}

function classBlock(html, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(html ?? '').match(new RegExp(`<div[^>]*class=["'][^"']*\\b${escaped}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`, 'i'));
  return match?.[1] ?? '';
}

export function extractSummary(bodyHtml, fallbacks = []) {
  const summaryHtml = classBlock(bodyHtml, 'mp-summary');
  const listItems = [...summaryHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => match[1]);
  const explicit = uniqueStrings(listItems, 5);
  if (explicit.length) return explicit;
  const paragraphs = [...String(bodyHtml ?? '').matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => match[1]);
  return uniqueStrings([...fallbacks, ...paragraphs], 5);
}

export function extractFaq(bodyHtml) {
  const faqHtml = classBlock(bodyHtml, 'mp-faq');
  const items = [];
  for (const details of faqHtml.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi)) {
    const question = details[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
    const answer = details[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1];
    const q = compactText(question);
    const a = compactText(answer);
    if (q && a && !items.some((item) => item.q === q)) items.push({ q, a });
    if (items.length >= 5) break;
  }
  return items;
}

function normalizeFaq(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const item of value) {
    const q = compactText(item?.q);
    const a = compactText(item?.a);
    if (q && a && !result.some((entry) => entry.q === q)) result.push({ q, a });
    if (result.length >= 5) break;
  }
  return result;
}

function normalizeCalculators(value) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const item of value) {
    const href = typeof item === 'string' ? `/calculators/${item.replace(/^.*\//, '')}` : text(item?.href);
    const known = CALCULATORS.find((calculator) => calculator.href === href || calculator.slug === item);
    const label = typeof item === 'object' ? text(item?.label) : '';
    if (href.startsWith('/calculators/') && !result.some((entry) => entry.href === href)) {
      result.push({ label: label || known?.label || '관련 계산기', href });
    }
  }
  return result.slice(0, 5);
}

export function matchArticleCalculators(input) {
  const explicit = normalizeCalculators(input.related_calculators ?? input.relatedCalculators);
  if (explicit.length) return explicit;
  const haystack = [input.title, input.lead, input.meta_description, ...(input.tags ?? [])].map(compactText).join(' ').toLowerCase();
  return CALCULATORS.filter((calculator) => calculator.keywords.some((keyword) => haystack.includes(keyword.toLowerCase())))
    .slice(0, 3)
    .map(({ label, href }) => ({ label, href }));
}

export function calculatorScenarios(calculators) {
  return calculators.flatMap((calculator) => {
    const slug = calculator.href.replace('/calculators/', '');
    return generateSampleScenarios(slug).map((scenario) => ({ calculator: slug, ...scenario }));
  });
}

function sourceTopic(input) {
  return {
    title: text(input.title),
    planTags: uniqueStrings(input.tags, 12),
    archetype: text(input.archetype),
    category: text(input.category_label ?? input.category),
  };
}

export function matchOfficialSources(input) {
  const seen = new Set();
  return matchSources(sourceTopic(input)).filter((source) => {
    if (seen.has(source.id)) return false;
    seen.add(source.id);
    return true;
  });
}

function officialSourcesHtml(sources) {
  if (!sources.length) return '';
  const items = sources.map((source) => `<li><a href="${source.url}" target="_blank" rel="noopener noreferrer"><strong>${source.name}</strong></a><br>${source.description}</li>`).join('\n');
  return `<div class="mp-official-sources">\n<h2>공식 확인처</h2>\n<ul>\n${items}\n</ul>\n<p class="mp-official-sources-note">정책과 조건은 변경될 수 있으므로 의사결정 전에 공식 기관의 최신 내용을 확인하세요.</p>\n</div>`;
}

function hasOfficialSources(bodyHtml) {
  return /class=["'][^"']*\bmp-official-sources\b/i.test(bodyHtml);
}

function articleType(input) {
  const explicit = text(input.article_type ?? input.articleType).toUpperCase();
  if (ARTICLE_TYPES.includes(explicit)) return explicit;
  return selectArticleType(sourceTopic(input)).articleType;
}

export function validateNormalizedArticle(article) {
  const errors = [];
  if (!text(article.title)) errors.push('title is required');
  if (!text(article.slug)) errors.push('slug is required');
  if (!text(article.body_html)) errors.push('body_html is required');
  if (!ARTICLE_TYPES.includes(article.article_type)) errors.push('article_type is invalid');
  if (!Array.isArray(article.summary) || article.summary.some((item) => !text(item))) errors.push('summary must be a string array');
  if (!Array.isArray(article.faq) || article.faq.some((item) => !text(item?.q) || !text(item?.a))) errors.push('faq must contain q/a pairs');
  if (/<script\b|\son\w+\s*=|javascript:/i.test(article.body_html)) errors.push('body_html contains unsafe markup');
  return errors;
}

export function normalizeArticle(input, options = {}) {
  const manualSummary = uniqueStrings(input.summary, 5);
  const manualFaq = normalizeFaq(input.faq);
  const summary = manualSummary.length
    ? manualSummary
    : extractSummary(input.body_html, [input.lead, input.meta_description, input.title]);
  const faq = manualFaq.length ? manualFaq : extractFaq(input.body_html);
  const calculators = matchArticleCalculators(input);
  const sources = matchOfficialSources(input);
  let bodyHtml = text(input.body_html);
  if (options.enrichBody !== false && sources.length && !hasOfficialSources(bodyHtml)) {
    bodyHtml = `${bodyHtml}\n${officialSourcesHtml(sources)}`;
  }
  const type = articleType(input);
  const normalized = {
    ...input,
    body_html: bodyHtml,
    summary,
    faq,
    related_calculators: calculators,
    article_type: type,
    pattern_id: text(input.pattern_id ?? input.patternId) || DEFAULT_PATTERN[type] || 'GUIDE_01',
  };
  const errors = validateNormalizedArticle(normalized);
  if (errors.length) throw new Error(`Article validation failed: ${errors.join('; ')}`);
  return {
    article: normalized,
    quality: {
      calculatorScenarios: calculatorScenarios(calculators),
      officialSources: sources.map(({ id, name, url }) => ({ id, name, url })),
    },
  };
}
