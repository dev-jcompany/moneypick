export const CONTENT_TYPE_REGISTRY = {
  GUIDE: {
    label: 'Guide',
    description: 'Explains concepts, requirements, and decisions.',
    allowedPatterns: ['GUIDE_01', 'GUIDE_02'],
  },
  COMPARISON: {
    label: 'Comparison',
    description: 'Compares alternatives and supports a decision.',
    allowedPatterns: ['COMPARISON_01', 'COMPARISON_02'],
  },
  CASE_STUDY: {
    label: 'Case study',
    description: 'Explains a concrete persona or scenario.',
    allowedPatterns: ['CASE_01', 'CASE_02'],
  },
  CHECKLIST: {
    label: 'Checklist',
    description: 'Provides a verification or preparation checklist.',
    allowedPatterns: ['CHECKLIST_01', 'CHECKLIST_02'],
  },
  CALCULATOR_FOCUSED: {
    label: 'Calculator focused',
    description: 'Centers the article on a calculation result.',
    allowedPatterns: ['CALCULATOR_01', 'CALCULATOR_02'],
  },
  POLICY_CHANGE: {
    label: 'Policy change',
    description: 'Explains a policy, rule, or timing change.',
    allowedPatterns: ['POLICY_01', 'POLICY_02'],
  },
  HOW_TO: {
    label: 'How to',
    description: 'Explains a process as actionable steps.',
    allowedPatterns: ['HOWTO_01', 'HOWTO_02'],
  },
  TIPS_LIST: {
    label: 'Tips list',
    description: 'Presents multiple practical tips as a list.',
    allowedPatterns: ['TIPS_01', 'TIPS_02'],
  },
};

export const CANONICAL_CONTENT_TYPES = Object.freeze(Object.keys(CONTENT_TYPE_REGISTRY));

export const LEGACY_ARCHETYPE_TO_CONTENT_TYPE = Object.freeze({
  '개념정리형': 'GUIDE',
  '완벽가이드형': 'GUIDE',
  '하우투·절차형': 'HOW_TO',
  '꿀팁·리스트형': 'TIPS_LIST',
  '비교형': 'COMPARISON',
  '함정주의형': 'CHECKLIST',
  '트렌드·정책형': 'POLICY_CHANGE',
  '케이스·대상별형': 'CASE_STUDY',
});

export const LEGACY_ARTICLE_TYPE_TO_CONTENT_TYPE = Object.freeze({
  GUIDE: 'GUIDE',
  COMPARISON: 'COMPARISON',
  CASE_STUDY: 'CASE_STUDY',
  CHECKLIST: 'CHECKLIST',
  CALCULATOR_FOCUSED: 'CALCULATOR_FOCUSED',
  POLICY_CHANGE: 'POLICY_CHANGE',
});

export function isCanonicalContentType(value) {
  return typeof value === 'string' && Object.hasOwn(CONTENT_TYPE_REGISTRY, value);
}

export function mapLegacyArchetype(value) {
  return typeof value === 'string' ? LEGACY_ARCHETYPE_TO_CONTENT_TYPE[value] ?? null : null;
}

export function mapLegacyArticleType(value) {
  return typeof value === 'string' ? LEGACY_ARTICLE_TYPE_TO_CONTENT_TYPE[value] ?? null : null;
}

export function allowedPatternsFor(contentType) {
  return isCanonicalContentType(contentType) ? CONTENT_TYPE_REGISTRY[contentType].allowedPatterns : [];
}
