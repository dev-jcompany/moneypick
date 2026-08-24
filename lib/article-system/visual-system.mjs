export const VISUAL_STYLE = 'MONEYPICK_MINIMAL_FLAT';
export const VISUAL_PURPOSES = ['HERO', 'CONCEPT', 'EXPLANATION', 'COMPARISON', 'PROCESS', 'SCENARIO'];
export const VISUAL_COMPOSITIONS = ['OBJECT_FOCUS', 'PERSON_OBJECT', 'CENTER_FOCUS', 'LEFT_RIGHT', 'SIMPLE_PROCESS', 'COMPARISON'];
export const VISUAL_TYPES = ['EDITORIAL', 'NUMBER', 'COMPARISON', 'PROCESS', 'DATA'];
export const MAX_VISUALS_PER_ARTICLE = 3;

const CONTENT_TYPE_VISUALS = {
  GUIDE: [['CONCEPT', 'PERSON_OBJECT'], ['EXPLANATION', 'CENTER_FOCUS'], ['SCENARIO', 'LEFT_RIGHT']],
  COMPARISON: [['COMPARISON', 'LEFT_RIGHT'], ['EXPLANATION', 'CENTER_FOCUS'], ['SCENARIO', 'PERSON_OBJECT']],
  CASE_STUDY: [['SCENARIO', 'PERSON_OBJECT'], ['EXPLANATION', 'CENTER_FOCUS'], ['COMPARISON', 'LEFT_RIGHT']],
  CHECKLIST: [['CONCEPT', 'OBJECT_FOCUS'], ['PROCESS', 'SIMPLE_PROCESS']],
  CALCULATOR_FOCUSED: [['CONCEPT', 'PERSON_OBJECT'], ['EXPLANATION', 'CENTER_FOCUS'], ['COMPARISON', 'LEFT_RIGHT']],
  POLICY_CHANGE: [['EXPLANATION', 'CENTER_FOCUS'], ['PROCESS', 'SIMPLE_PROCESS']],
  HOW_TO: [['PROCESS', 'SIMPLE_PROCESS'], ['CONCEPT', 'OBJECT_FOCUS'], ['SCENARIO', 'PERSON_OBJECT']],
  TIPS_LIST: [['CONCEPT', 'OBJECT_FOCUS'], ['SCENARIO', 'PERSON_OBJECT']],
};

const STYLE_PROMPT = `Minimal financial editorial illustration, clean flat 2D design, thin delicate lines, simple geometric shapes, generous white space, minimal objects, restrained color palette, subtle accents, modern financial editorial aesthetic.`;
const NEGATIVE_PROMPT = `No heavy outlines. No photorealism. No 3D rendering. No isometric style. No clutter. No text, letters, numbers, logos, or watermarks inside the illustration.`;

function cleanText(value, fallback) {
  const result = typeof value === 'string' ? value.replace(/[\r\n]+/g, ' ').trim().slice(0, 240) : '';
  return result || fallback;
}

export function planArticleVisuals({ contentType, topic, count = 3 }) {
  const templates = CONTENT_TYPE_VISUALS[contentType] ?? CONTENT_TYPE_VISUALS.GUIDE;
  const safeCount = Math.max(0, Math.min(Number.isFinite(count) ? Math.floor(count) : 0, MAX_VISUALS_PER_ARTICLE, templates.length));
  const subject = cleanText(topic, 'the article topic');
  return templates.slice(0, safeCount).map(([purpose, composition], index) => ({
    id: `visual-${String(index + 1).padStart(2, '0')}`,
    style: VISUAL_STYLE,
    type: purpose === 'COMPARISON' ? 'COMPARISON' : purpose === 'PROCESS' ? 'PROCESS' : 'EDITORIAL',
    purpose,
    composition,
    visualSpec: {
      subject,
      objects: purpose === 'COMPARISON'
        ? ['two contrasting financial situations', 'simple balance indicator']
        : purpose === 'PROCESS'
          ? ['three simple process stages', 'document', 'check mark']
          : ['office worker', 'financial document', 'simple financial object'],
    },
    alt: `${subject}의 ${purpose.toLowerCase()} 개념을 설명하는 금융 일러스트`,
  }));
}

export function buildMoneyPickImagePrompt(visual, articleTopic) {
  const objects = Array.isArray(visual?.visualSpec?.objects) ? visual.visualSpec.objects.filter(Boolean).slice(0, 4).join(', ') : '';
  return [
    STYLE_PROMPT,
    `Article topic: ${cleanText(articleTopic, 'personal finance')}.`,
    `Visual purpose: ${visual.purpose}. Subject: ${cleanText(visual?.visualSpec?.subject, articleTopic)}.`,
    objects ? `Objects: ${objects}.` : '',
    `Composition: ${visual.composition}. Landscape 16:9 editorial layout.`,
    NEGATIVE_PROMPT,
  ].filter(Boolean).join('\n');
}

export function insertVisualBlocks(blocks, visuals) {
  const result = Array.isArray(blocks) ? blocks.slice() : [];
  if (!Array.isArray(visuals) || !visuals.length) return result;
  const faqIndex = result.findIndex((block) => block?.type === 'faq');
  const contentEnd = faqIndex === -1 ? result.length : faqIndex;
  const candidateIndexes = result
    .map((block, index) => ({ block, index }))
    .filter(({ block, index }) => index > 0 && index < contentEnd && ['paragraph', 'example', 'table', 'comparison', 'numberResult'].includes(block?.type))
    .map(({ index }) => index + 1);
  let offset = 0;
  visuals.forEach((visual, index) => {
    const fallback = Math.min(1 + index * 2 + offset, result.length);
    const target = Math.min((candidateIndexes[index] ?? contentEnd) + offset, result.length);
    result.splice(Number.isFinite(target) ? target : fallback, 0, { type: 'visual', visualId: visual.id });
    offset += 1;
  });
  return result;
}

export function visualCountForArticle({ contentType, blockCount = 0 }) {
  if (blockCount < 5) return 1;
  if (contentType === 'CALCULATOR_FOCUSED' || contentType === 'COMPARISON') return 3;
  return blockCount >= 12 ? 3 : 2;
}
