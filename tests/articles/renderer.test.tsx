import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import MoneyPickArticle from '../../components/moneypick/MoneyPickArticle';

const baseProps = {
  categoryKey: 'loan',
  categoryLabel: '대출연구소',
  title: 'Legacy article',
  date: '2026.08.18',
  editor: '머니픽 에디터',
  lead: 'Legacy lead',
  bodyHtml: '<p>기존 HTML 본문</p>',
  tags: [],
};

describe('MoneyPickArticle legacy compatibility', () => {
  it('renders a legacy HTML article with empty structured fields', () => {
    const html = renderToStaticMarkup(<MoneyPickArticle {...baseProps} summary={[]} blocks={[]} />);
    expect(html).toContain('기존 HTML 본문');
  });

  it('renders structured summary and FAQ without replacing body HTML', () => {
    const html = renderToStaticMarkup(
      <MoneyPickArticle
        {...baseProps}
        summary={['구조화 요약']}
        blocks={[{ type: 'faq', items: [{ q: '구조화 질문', a: '구조화 답변' }] }]}
      />,
    );
    expect(html).toContain('구조화 요약');
    expect(html).toContain('구조화 질문');
    expect(html).toContain('구조화 답변');
    expect(html).toContain('기존 HTML 본문');
  });

  it('renders no more than three valid calculator CTAs', () => {
    const html = renderToStaticMarkup(
      <MoneyPickArticle
        {...baseProps}
        relatedCalculators={[
          { label: 'DSR', href: '/calculators/dsr' },
          { label: 'Mortgage', href: '/calculators/mortgage' },
          { label: 'Jeonse', href: '/calculators/jeonse-loan' },
          { label: 'Tax', href: '/calculators/acquisition-tax' },
          { label: 'Invalid', href: '/calculators/not-real' },
        ]}
      />,
    );
    expect(html).toContain('/calculators/dsr');
    expect(html).toContain('/calculators/mortgage');
    expect(html).toContain('/calculators/jeonse-loan');
    expect(html).not.toContain('/calculators/acquisition-tax');
    expect(html).not.toContain('/calculators/not-real');
  });

  it('renders a valid V2 schema instead of legacy body HTML', () => {
    const html = renderToStaticMarkup(
      <MoneyPickArticle
        {...baseProps}
        articleSchema={{
          version: 2,
          contentType: 'GUIDE',
          pattern: 'GUIDE_01',
          variant: 'A',
          blocks: [
            { type: 'summary', variant: 'S2', items: ['V2 요약 1', 'V2 요약 2'] },
            { type: 'heading', text: 'V2 제목' },
            { type: 'paragraph', text: 'V2 본문' },
            { type: 'table', variant: 'T1', caption: '비교표', headers: ['항목', '값'], rows: [['금리', '3%']] },
            { type: 'calculator', items: [{ label: 'DSR 계산기', href: '/calculators/dsr' }] },
            { type: 'officialSources', variant: 'O1', agencyIds: ['fsc'] },
            { type: 'faq', items: [{ q: 'V2 질문', a: 'V2 답변' }] },
          ],
        }}
      />,
    );

    expect(html).toContain('V2 본문');
    expect(html).toContain('비교표');
    expect(html).toContain('/calculators/dsr');
    expect(html).toContain('금융위원회');
    expect(html).toContain('V2 질문');
    expect(html).not.toContain('기존 HTML 본문');
  });

  it('falls back to legacy HTML when the V2 schema is invalid', () => {
    const html = renderToStaticMarkup(
      <MoneyPickArticle
        {...baseProps}
        articleSchema={{
          version: 2,
          contentType: 'GUIDE',
          pattern: 'GUIDE_01',
          variant: 'A',
          blocks: [],
        }}
      />,
    );
    expect(html).toContain('기존 HTML 본문');
  });
});
