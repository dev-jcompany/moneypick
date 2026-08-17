import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  createMoneypickArticle: createMock,
  updateMoneypickArticle: updateMock,
}));

import { createArticleThroughPipeline, updateArticleThroughPipeline } from '../../lib/articles/persistence';
import type { ArticleSavePayload } from '../../lib/db';

const payload: ArticleSavePayload = {
  slug: 'dsr-test',
  category_key: 'loan',
  category_label: '대출연구소',
  title: 'DSR 계산 테스트',
  lead: 'DSR 핵심 안내',
  meta_description: null,
  body_html: '<p>DSR 계산 전 소득과 원리금 상환액을 확인하세요.</p>',
  summary: [],
  faq: [],
  tags: ['DSR'],
  editor: '테스터',
  reading_time: null,
  hero_value: null,
  hero_label: null,
  related_calculators: [],
  disclaimer: null,
  thumbnail_url: null,
  status: 'draft',
};

describe('article persistence pipeline', () => {
  beforeEach(() => {
    createMock.mockReset().mockResolvedValue({ id: 'article-id' });
    updateMock.mockReset().mockResolvedValue({ ok: true });
  });

  it('persists a normalized article', async () => {
    await createArticleThroughPipeline(payload);
    expect(createMock).toHaveBeenCalledOnce();
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      article_type: expect.any(String),
      pattern_id: expect.any(String),
      summary: expect.arrayContaining(['DSR 핵심 안내']),
      related_calculators: expect.arrayContaining([
        expect.objectContaining({ href: '/calculators/dsr' }),
      ]),
    }));
  });

  it('preserves explicit manual summary and FAQ', async () => {
    await createArticleThroughPipeline({
      ...payload,
      summary: ['수동 요약'],
      faq: [{ q: '수동 질문', a: '수동 답변' }],
    });
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
      summary: ['수동 요약'],
      faq: [{ q: '수동 질문', a: '수동 답변' }],
    }));
  });

  it('passes a partial metadata update without inventing required fields', async () => {
    await updateArticleThroughPipeline('article-id', { thumbnail_url: 'https://example.com/image.png' });
    expect(updateMock).toHaveBeenCalledWith('article-id', { thumbnail_url: 'https://example.com/image.png' });
  });
});
