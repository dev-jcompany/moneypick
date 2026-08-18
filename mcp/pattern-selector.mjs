// 머니픽 기사 유형 · 구성 패턴 선택기
import { mapLegacyArchetype, mapLegacyArticleType } from '../lib/article-system/content-types.mjs';
// 주제 → (1) 6개 기사 유형 중 하나 선택 → (2) 해당 유형의 2개 패턴 중 최근 중복을 피해 하나 선택
//
// 유형 분류 우선순위:
//   0. 제목에 구체적 상황형 신호(연봉·소득·나이·대출금 + 실제 숫자, 또는 '사례'/'케이스')가
//      있으면 다른 무엇보다 우선 CASE_STUDY로 판정한다.
//   1. 제목(+태그)에 강한 의도 키워드(OVERRIDE_KEYWORDS)가 있으면 기존 archetype 명칭보다
//      우선해서 해당 유형으로 override한다.
//   2. 위 두 단계에서 못 정하면 기존 archetype 명칭을 기본값으로 사용한다.
//   3. archetype 명칭으로도 못 정하면 제목/태그의 일반 키워드를 보조 신호로 사용한다.
//   4. 그래도 못 정하면 searchIntent 또는 category를 본다.
//   5. 매칭 실패 시 GUIDE.
//
// 같은 텍스트 안에 여러 유형 키워드가 동시에 등장하면(예: "정책 변경" + "계산 방법")
// 아래 TYPE_PRIORITY / OVERRIDE_PRIORITY 순서를 따른다. CALCULATOR_FOCUSED가 가장 약한
// 신호라는 원칙(정책+계산→POLICY_CHANGE, 비교+계산→COMPARISON)에 따라 최하위에 둔다.
const TYPE_PRIORITY = ['POLICY_CHANGE', 'COMPARISON', 'CASE_STUDY', 'CHECKLIST', 'CALCULATOR_FOCUSED'];

const KEYWORDS = {
  CALCULATOR_FOCUSED: ['계산', '금액', '한도', '수수료', '세액', '실수령액'],
  COMPARISON: ['비교', '차이', 'vs', 'VS', '선택'],
  // '케이스'는 기존 archetype "케이스·대상별형" 명칭을 바로 인식시키기 위해 추가.
  CASE_STUDY: ['사례', '연봉', '소득', '나이', '대출금', '케이스'],
  CHECKLIST: ['체크리스트', '준비물', '신청 전', '확인사항', '실수'],
  POLICY_CHANGE: ['변경', '개정', '시행', '금리', '규제', '정책'],
};

// 제목에 이 키워드가 있으면 archetype 명칭보다 우선해서 해당 유형으로 override한다.
const OVERRIDE_PRIORITY = ['POLICY_CHANGE', 'COMPARISON', 'CHECKLIST', 'CALCULATOR_FOCUSED'];
const OVERRIDE_KEYWORDS = {
  CALCULATOR_FOCUSED: ['계산', '계산법', '계산기', '실수령액', '수수료', '세액', '한도'],
  COMPARISON: ['vs', 'VS', '비교', '차이', '무엇이 유리', '어느 것이 유리'],
  POLICY_CHANGE: ['개정', '시행', '변경', '규제', '정책'],
  CHECKLIST: ['체크리스트', '준비물', '신청 전 확인', '확인사항'],
};

// CASE_STUDY 최우선 조건: '사례'/'케이스' 단어가 명시되어 있거나, 연봉·소득·나이·대출금 같은
// 구체적 인적 조건 키워드가 실제 숫자와 함께 등장하는 "실제 상황형" 제목.
// 예) "연봉 실수령액 계산법"(숫자 없음) → 조건 미충족 → CALCULATOR_FOCUSED로 넘어감
//     "연봉 5천만 원이면 전세대출 얼마까지 가능할까"(숫자 있음) → 조건 충족 → CASE_STUDY
const CASE_CONDITION_KEYWORDS = ['연봉', '소득', '나이', '대출금'];

export const TITLE_STYLES = ['질문형', '결과형', '비교형', '사례형', '경고형', '숫자형', '대상자형', '변화 설명형'];

function matchByKeywords(text) {
  if (!text) return null;
  for (const type of TYPE_PRIORITY) {
    const hits = KEYWORDS[type].filter((kw) => text.includes(kw));
    if (hits.length) return { type, matchedKeywords: hits };
  }
  return null;
}

function matchOverride(text) {
  if (!text) return null;
  for (const type of OVERRIDE_PRIORITY) {
    const hits = OVERRIDE_KEYWORDS[type].filter((kw) => text.includes(kw));
    if (hits.length) return { type, matchedKeywords: hits };
  }
  return null;
}

function isConcreteCaseStudyTitle(text) {
  if (!text) return false;
  if (text.includes('사례') || text.includes('케이스')) return true;
  const hasCaseKeyword = CASE_CONDITION_KEYWORDS.some((kw) => text.includes(kw));
  const hasNumber = /\d/.test(text);
  return hasCaseKeyword && hasNumber;
}

/**
 * @param {{ archetype?: string, title?: string, planTags?: string[], searchIntent?: string, category?: string }} topic
 * @returns {{ articleType: string, reason: string, level: string }}
 */
export function selectArticleType(topic) {
  const titleText = [topic.title, ...(topic.planTags || [])].filter(Boolean).join(' ');

  // 0) 구체적 상황형 제목은 archetype/override보다 우선 CASE_STUDY
  if (isConcreteCaseStudyTitle(titleText)) {
    return {
      articleType: 'CASE_STUDY',
      contentType: mapLegacyArticleType('CASE_STUDY'),
      reason: `구체적 상황형 제목 감지("사례"/"케이스" 또는 연봉·소득·나이·대출금 + 숫자) → CASE_STUDY 최우선`,
      level: 'case-priority',
    };
  }

  // 1) 제목의 강한 의도 키워드는 기존 archetype 명칭보다 우선 적용(override)
  const overrideMatch = matchOverride(titleText);
  if (overrideMatch) {
    return {
      articleType: overrideMatch.type,
      contentType: mapLegacyArticleType(overrideMatch.type),
      reason: `제목의 강한 의도 키워드로 archetype override: [${overrideMatch.matchedKeywords.join(', ')}]`,
      level: 'title-override',
    };
  }

  // 2) Canonical registry로 기존 8개 archetype을 명시적으로 해석한다.
  // HOW_TO/TIPS_LIST는 legacy DB article_type에 없으므로 GUIDE를 유지하고 contentType만 canonical 값을 제공한다.
  const canonicalArchetype = mapLegacyArchetype(topic.archetype);
  if (canonicalArchetype) {
    const legacyArticleType = ['HOW_TO', 'TIPS_LIST'].includes(canonicalArchetype) ? 'GUIDE' : canonicalArchetype;
    return {
      articleType: legacyArticleType,
      contentType: canonicalArchetype,
      reason: `canonical archetype registry match: "${topic.archetype}"`,
      level: 'archetype-registry',
    };
  }

  // 3) Registry에 없는 과거 변형 명칭은 기존 keyword 규칙으로 보조한다.
  const archetypeText = topic.archetype ?? '';
  const archetypeMatch = matchByKeywords(archetypeText);
  if (archetypeMatch) {
    return {
      articleType: archetypeMatch.type,
      contentType: mapLegacyArticleType(archetypeMatch.type),
      reason: `기존 archetype 명칭 매칭: "${topic.archetype}" → [${archetypeMatch.matchedKeywords.join(', ')}]`,
      level: 'archetype',
    };
  }

  // 3) archetype으로 못 정하면 제목/태그의 일반 키워드를 보조 신호로 사용
  const titleMatch = matchByKeywords(titleText);
  if (titleMatch) {
    return {
      articleType: titleMatch.type,
      contentType: mapLegacyArticleType(titleMatch.type),
      reason: `제목/태그 키워드 매칭: [${titleMatch.matchedKeywords.join(', ')}]`,
      level: 'title',
    };
  }

  // 4) searchIntent 또는 category
  const intentText = [topic.searchIntent, topic.category].filter(Boolean).join(' ');
  const intentMatch = matchByKeywords(intentText);
  if (intentMatch) {
    return {
      articleType: intentMatch.type,
      contentType: mapLegacyArticleType(intentMatch.type),
      reason: `searchIntent/category 키워드 매칭: [${intentMatch.matchedKeywords.join(', ')}]`,
      level: 'searchIntent',
    };
  }

  return {
    articleType: 'GUIDE',
    contentType: mapLegacyArticleType('GUIDE'),
    reason: '0~4단계 키워드 매칭 실패 → GUIDE 기본값',
    level: 'fallback',
  };
}

/**
 * 같은 유형의 2개 패턴 중 하나를 고른다.
 * - 바로 직전 글과 같은 패턴은 선택하지 않는다.
 * - 최근 5개 중 같은 패턴이 2회 이상 쓰였으면 다른 패턴을 우선한다.
 * @param {string} articleType
 * @param {Array<{ patternId: string }>} history 오래된 순서 → 최신 순서
 * @param {object} patternsConfig article-patterns.json 내용
 */
export function pickPattern(articleType, history, patternsConfig) {
  const typeConfig = patternsConfig[articleType] ?? patternsConfig.GUIDE;
  const candidates = Object.keys(typeConfig);
  const recent = history.slice(-5);
  const lastPatternId = history.length ? history[history.length - 1].patternId : null;

  const recentCount = Object.fromEntries(candidates.map((id) => [id, 0]));
  for (const h of recent) {
    if (h.patternId in recentCount) recentCount[h.patternId] += 1;
  }

  let pool = candidates.filter((id) => id !== lastPatternId);
  if (pool.length === 0) pool = candidates.slice();

  const notOverused = pool.filter((id) => recentCount[id] < 2);
  const finalPool = notOverused.length ? notOverused : pool;

  finalPool.sort((a, b) => recentCount[a] - recentCount[b]);
  const patternId = finalPool[0];

  return { patternId, pattern: typeConfig[patternId] };
}

/**
 * 제목 스타일 로테이션: 바로 직전과 다른 스타일, 최근 5개 중 2회 이상 쓰인 스타일은 회피.
 * @param {Array<{ titleStyle?: string }>} history
 */
export function pickTitleStyle(history) {
  const lastStyle = history.length ? history[history.length - 1].titleStyle : null;
  const recent = history.slice(-5).map((h) => h.titleStyle).filter(Boolean);

  const recentCount = Object.fromEntries(TITLE_STYLES.map((s) => [s, 0]));
  for (const s of recent) {
    if (s in recentCount) recentCount[s] += 1;
  }

  let pool = TITLE_STYLES.filter((s) => s !== lastStyle);
  const notOverused = pool.filter((s) => recentCount[s] < 2);
  const finalPool = notOverused.length ? notOverused : pool;

  const minCount = Math.min(...finalPool.map((s) => recentCount[s]));
  const tied = finalPool.filter((s) => recentCount[s] === minCount);
  return tied[Math.floor(Math.random() * tied.length)];
}

export function buildPatternPromptBlock(articleType, patternId, pattern, titleStyle) {
  return [
    `[콘텐츠 구성 지시 — 반드시 따를 것]`,
    `- 기사 유형: ${articleType}`,
    `- 선택된 패턴: ${patternId} (${pattern.label})`,
    `- 섹션 순서: ${pattern.sections.join(' → ')}`,
    `- 도입 방식: ${pattern.intro}`,
    `- 필수 포함 요소: ${pattern.requiredElements.join(', ')}`,
    `- 피해야 할 표현: ${pattern.avoidPhrases.join(', ')} (그리고 모든 글에서 3줄 요약/동일 도입문/동일 FAQ 개수/동일 결론 문구를 기계적으로 반복하지 않는다)`,
    `- 섹션 제목(h2/h3)은 위 순서의 의미는 유지하되 주제에 맞게 자연스러운 문구로 새로 작성한다. 위 목록의 문구를 그대로 복사하지 않는다.`,
    `- 제목 스타일: ${titleStyle}. 위 topic title은 핵심 주제·키워드 참고용이며, 문구를 그대로 베끼지 말고 이 스타일에 맞게 새로 작성한다. 단 핵심 키워드(제도명, 대상, 숫자 등)는 유지한다.`,
  ].join('\n');
}

export function logSelection({ topic, typeResult, patternId, pattern, titleStyle }) {
  console.log(`\ntopic: ${topic.title}`);
  console.log(`existingArchetype: ${topic.archetype ?? '(없음)'}`);
  console.log(`articleType: ${typeResult.articleType}`);
  console.log(`reason: ${typeResult.reason}`);
  console.log(`patternId: ${patternId} (${pattern.label})`);
  console.log(`titleStyle: ${titleStyle}`);
}
