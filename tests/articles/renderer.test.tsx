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
});
