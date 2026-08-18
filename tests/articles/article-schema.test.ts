import { describe, expect, it } from 'vitest';
import { articleRenderingMode, validateArticleSchemaV2 } from '../../lib/article-system/article-schema.mjs';

const validSchema = {
  version: 2,
  contentType: 'CALCULATOR_FOCUSED',
  pattern: 'CALCULATOR_01',
  variant: 'A',
  blocks: [],
};

describe('ArticleSchemaV2 envelope', () => {
  it('accepts the valid V2 envelope', () => {
    expect(validateArticleSchemaV2(validSchema)).toEqual({ valid: true, errors: [] });
    expect(articleRenderingMode(validSchema)).toBe('v2');
  });

  it.each([
    [{ ...validSchema, version: 3 }, 'version must be 2'],
    [{ ...validSchema, contentType: 'UNKNOWN' }, 'contentType is invalid'],
    [{ ...validSchema, pattern: 'GUIDE_01' }, 'pattern is not allowed for contentType'],
    [{ ...validSchema, blocks: null }, 'blocks must be an array'],
  ])('falls back to legacy for an invalid envelope', (schema, expectedError) => {
    expect(validateArticleSchemaV2(schema).errors).toContain(expectedError);
    expect(articleRenderingMode(schema)).toBe('legacy');
  });

  it('uses legacy rendering for null schemas', () => {
    expect(articleRenderingMode(null)).toBe('legacy');
  });
});
