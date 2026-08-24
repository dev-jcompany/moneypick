import { describe, expect, it } from 'vitest';
import {
  articleRenderingMode,
  articleSchemaToLegacyHtml,
  validateArticleSchemaV2,
} from '../../lib/article-system/article-schema.mjs';
import type { ArticleSchemaV2 } from '../../lib/article-system/article-schema.mjs';

const validSchema: ArticleSchemaV2 = {
  version: 2,
  contentType: 'CALCULATOR_FOCUSED',
  pattern: 'CALCULATOR_01',
  variant: 'A',
  blocks: [
    { type: 'summary', variant: 'S1', items: ['핵심 요약'] },
    { type: 'paragraph', text: '본문' },
    { type: 'faq', items: [{ q: '질문', a: '답변' }] },
  ],
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
    [{ ...validSchema, blocks: [{ type: 'paragraph', text: '본문' }] }, 'blocks must start with summary'],
    [{ ...validSchema, blocks: [{ type: 'summary', variant: 'S1', items: ['요약'] }] }, 'blocks must contain FAQ'],
    [{ ...validSchema, blocks: [{ type: 'summary', variant: 'S9', items: ['요약'] }, { type: 'faq', items: [{ q: '질문', a: '답변' }] }] }, 'blocks[0] summary is invalid'],
  ])('falls back to legacy for an invalid envelope', (schema, expectedError) => {
    expect(validateArticleSchemaV2(schema).errors).toContain(expectedError);
    expect(articleRenderingMode(schema)).toBe('legacy');
  });

  it('uses legacy rendering for null schemas', () => {
    expect(articleRenderingMode(null)).toBe('legacy');
  });

  it('creates escaped compatibility HTML for valid V2 blocks', () => {
    const html = articleSchemaToLegacyHtml({
      ...validSchema,
      blocks: [
        { type: 'summary', variant: 'S1', items: ['<script>alert(1)</script>'] },
        { type: 'paragraph', text: '안전한 본문' },
        { type: 'faq', items: [{ q: '질문', a: '답변' }] },
      ],
    });

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('안전한 본문');
    expect(html).toContain('mp-faq');
  });

  it('refuses to serialize an invalid schema', () => {
    expect(() => articleSchemaToLegacyHtml({ ...validSchema, blocks: [] })).toThrow(
      'Cannot serialize an invalid ArticleSchemaV2',
    );
  });

  it('rejects unsafe calculator links before rendering or compatibility serialization', () => {
    const schema = {
      ...validSchema,
      blocks: [
        { type: 'summary', variant: 'S1', items: ['요약'] },
        { type: 'calculator', items: [{ label: '위험 링크', href: 'javascript:alert(1)' }] },
        { type: 'faq', items: [{ q: '질문', a: '답변' }] },
      ],
    };

    expect(validateArticleSchemaV2(schema).errors).toContain('blocks[1] calculator items are invalid');
  });
});
