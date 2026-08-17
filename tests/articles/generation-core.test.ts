import { describe, expect, it } from 'vitest';
import {
  calculatorScenarios,
  extractFaq,
  extractSummary,
  matchArticleCalculators,
  matchOfficialSources,
  normalizeArticle,
  validateNormalizedArticle,
} from '../../lib/articles/generation-core.mjs';

const base = {
  title: 'DSR 계산 방법과 대출 한도',
  slug: 'dsr-guide',
  category: '대출연구소',
  category_label: '대출연구소',
  lead: 'DSR은 소득 대비 원리금 상환액을 확인하는 지표입니다.',
  meta_description: 'DSR 계산 기준과 대출 한도를 확인합니다.',
  tags: ['DSR', '대출 규제'],
  body_html: `<div class="mp-summary"><ul><li>소득과 원리금 상환액을 함께 봅니다.</li><li>대출 전 한도를 확인해야 합니다.</li></ul></div>
    <p>DSR은 대출 심사의 핵심 지표입니다.</p>
    <div class="mp-faq"><details><summary>DSR은 무엇인가요?</summary><p class="mp-faq-answer">연 소득 대비 원리금 상환 비율입니다.</p></details></div>`,
  summary: [],
  faq: [],
};

describe('Article Generation Core', () => {
  it('extracts structured summary and FAQ from legacy HTML', () => {
    expect(extractSummary(base.body_html)).toEqual([
      '소득과 원리금 상환액을 함께 봅니다.',
      '대출 전 한도를 확인해야 합니다.',
    ]);
    expect(extractFaq(base.body_html)).toEqual([
      { q: 'DSR은 무엇인가요?', a: '연 소득 대비 원리금 상환 비율입니다.' },
    ]);
  });

  it('preserves valid manual summary and FAQ', () => {
    const result = normalizeArticle({
      ...base,
      summary: ['관리자가 작성한 요약'],
      faq: [{ q: '관리자 질문', a: '관리자 답변' }],
    });
    expect(result.article.summary).toEqual(['관리자가 작성한 요약']);
    expect(result.article.faq).toEqual([{ q: '관리자 질문', a: '관리자 답변' }]);
  });

  it('normalizes invalid manual schema from the body instead', () => {
    const result = normalizeArticle({ ...base, summary: [null, ''], faq: [{ q: '', a: 3 }] });
    expect(result.article.summary.length).toBeGreaterThan(0);
    expect(result.article.faq).toHaveLength(1);
  });

  it('selects a valid article type and fallback pattern', () => {
    const result = normalizeArticle({ ...base, article_type: 'unknown' });
    expect(result.article.article_type).toBe('POLICY_CHANGE');
    expect(result.article.pattern_id).toBe('POLICY_CHANGE_01');
  });

  it('matches calculator scenarios deterministically and allows no match', () => {
    const calculators = matchArticleCalculators(base);
    expect(calculators[0]?.href).toBe('/calculators/dsr');
    expect(calculatorScenarios(calculators).length).toBeGreaterThan(0);
    expect(matchArticleCalculators({ title: '일상 기록', tags: [] })).toEqual([]);
  });

  it('matches and deduplicates official sources', () => {
    const sources = matchOfficialSources(base);
    expect(sources.length).toBeGreaterThan(0);
    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
  });

  it('reports invalid required fields and unsafe HTML', () => {
    const errors = validateNormalizedArticle({
      title: '', slug: '', body_html: '<script>alert(1)</script>', article_type: 'BAD', summary: 'bad', faq: 'bad',
    });
    expect(errors).toEqual(expect.arrayContaining(['title is required', 'article_type is invalid', 'body_html contains unsafe markup']));
  });
});
