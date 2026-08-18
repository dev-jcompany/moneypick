import { describe, expect, it } from 'vitest';
import {
  CANONICAL_CONTENT_TYPES,
  mapLegacyArchetype,
  mapLegacyArticleType,
} from '../../lib/article-system/content-types.mjs';
import { selectArticleType } from '../../mcp/pattern-selector.mjs';

describe('canonical content type registry', () => {
  it('defines the eight canonical content types', () => {
    expect(CANONICAL_CONTENT_TYPES).toHaveLength(8);
  });

  it.each([
    ['개념정리형', 'GUIDE'],
    ['완벽가이드형', 'GUIDE'],
    ['하우투·절차형', 'HOW_TO'],
    ['꿀팁·리스트형', 'TIPS_LIST'],
    ['비교형', 'COMPARISON'],
    ['함정주의형', 'CHECKLIST'],
    ['트렌드·정책형', 'POLICY_CHANGE'],
    ['케이스·대상별형', 'CASE_STUDY'],
  ])('maps legacy archetype %s', (legacy, canonical) => {
    expect(mapLegacyArchetype(legacy)).toBe(canonical);
  });

  it.each(['GUIDE', 'COMPARISON', 'CASE_STUDY', 'CHECKLIST', 'CALCULATOR_FOCUSED', 'POLICY_CHANGE'])(
    'maps legacy articleType %s without changing its persisted value',
    (legacy) => expect(mapLegacyArticleType(legacy)).toBe(legacy),
  );

  it('does not silently coerce unknown values', () => {
    expect(mapLegacyArchetype('UNKNOWN')).toBeNull();
    expect(mapLegacyArticleType('UNKNOWN')).toBeNull();
  });

  it.each([
    ['하우투·절차형', 'GUIDE', 'HOW_TO'],
    ['꿀팁·리스트형', 'GUIDE', 'TIPS_LIST'],
    ['비교형', 'COMPARISON', 'COMPARISON'],
  ])('adds canonical information without expanding legacy DB articleType', (archetype, articleType, contentType) => {
    expect(selectArticleType({ archetype })).toMatchObject({ articleType, contentType });
  });
});
