import { describe, expect, it } from 'vitest';
import { cardVariantFor, performanceDimensions } from '../../lib/article-system/display.mjs';
import { buildPerformanceRows } from '../../lib/article-system/performance.mjs';

const schema = {
  version: 2 as const,
  contentType: 'GUIDE' as const,
  pattern: 'GUIDE_01',
  variant: 'B',
  blocks: [
    { type: 'summary' as const, variant: 'S1' as const, items: ['요약'] },
    { type: 'faq' as const, items: [{ q: '질문', a: '답변' }] },
  ],
};

describe('display and performance loop', () => {
  it('selects deterministic card variants', () => {
    expect(cardVariantFor({ id: '1', article_schema: schema }, 0)).toBe('featured');
    expect(cardVariantFor({ id: '2', article_type: 'POLICY_CHANGE' }, 1)).toBe('compact');
    expect(cardVariantFor({ id: '3', article_type: 'CHECKLIST' }, 2)).toBe('numbered');
  });

  it('emits stable analytics dimensions', () => {
    expect(performanceDimensions({ id: '1', article_schema: schema }, 'home', 'featured')).toEqual({
      article_id: '1', content_type: 'GUIDE', pattern_id: 'GUIDE_01', schema_variant: 'B', card_variant: 'featured', placement: 'home',
    });
  });

  it('aggregates internal views by V2 dimensions with legacy fallback', () => {
    expect(buildPerformanceRows([
      { article_schema: schema, views: 10 },
      { article_schema: schema, views: 5 },
      { article_type: 'GUIDE', pattern_id: 'GUIDE_02', views: 3 },
    ])).toEqual([
      { contentType: 'GUIDE', pattern: 'GUIDE_01', variant: 'B', articles: 2, views: 15 },
      { contentType: 'GUIDE', pattern: 'GUIDE_02', variant: 'LEGACY', articles: 1, views: 3 },
    ]);
  });
});
