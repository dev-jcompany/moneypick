import { describe, expect, it, vi } from 'vitest';
import {
  buildMoneyPickImagePrompt,
  insertVisualBlocks,
  planArticleVisuals,
} from '../../lib/article-system/visual-system.mjs';
import {
  ImageGenerationError,
  generateArticleVisualAssets,
  safeArticleAssetPath,
} from '../../lib/article-system/image-pipeline.mjs';

describe('MoneyPick visual planning', () => {
  it('plans at most three visuals with a fixed style and varied compositions', () => {
    const visuals = planArticleVisuals({ contentType: 'CALCULATOR_FOCUSED', topic: 'DSR 계산 가이드', count: 9 });
    expect(visuals).toHaveLength(3);
    expect(new Set(visuals.map((visual) => visual.composition)).size).toBe(3);
    expect(visuals.every((visual) => visual.style === 'MONEYPICK_MINIMAL_FLAT')).toBe(true);
    expect(buildMoneyPickImagePrompt(visuals[0], 'DSR 계산 가이드')).toContain('No text, letters, numbers');
  });

  it('places visual blocks among content and keeps FAQ', () => {
    const blocks = [{ type: 'summary' }, { type: 'paragraph' }, { type: 'paragraph' }, { type: 'faq' }];
    const visuals = planArticleVisuals({ contentType: 'GUIDE', topic: '가이드', count: 2 });
    const result = insertVisualBlocks(blocks, visuals) as Array<{ type: string; visualId?: string }>;
    expect(result.filter((block) => block.type === 'visual')).toHaveLength(2);
    expect(result.at(-1)?.type).toBe('faq');
  });
});

describe('Visual image pipeline', () => {
  const visual = planArticleVisuals({ contentType: 'GUIDE', topic: 'DSR', count: 1 })[0];

  it('optimizes, uploads, and returns permanent asset metadata with mocks', async () => {
    const svg = Buffer.from('<svg width="32" height="18" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="18" fill="white"/></svg>');
    const provider = { generate: vi.fn().mockResolvedValue({ bytes: svg, mimeType: 'image/svg+xml' }) };
    const storage = { upload: vi.fn().mockResolvedValue('https://example.supabase.co/storage/v1/object/public/article-images/articles/dsr/visual.webp') };
    const result = await generateArticleVisualAssets({ articleId: 'DSR/위험', articleTopic: 'DSR', visuals: [visual], provider, storage, retry: 1 });
    expect(result.failures).toEqual([]);
    expect(result.visuals[0].asset?.mimeType).toBe('image/webp');
    expect(storage.upload).toHaveBeenCalledTimes(1);
    expect(safeArticleAssetPath('DSR/위험', 'visual-01', Buffer.from('x'))).toMatch(/^articles\/dsr\/visual-01-/);
  });

  it('allows partial failure and stops after authentication errors', async () => {
    const provider = { generate: vi.fn().mockRejectedValue(new ImageGenerationError('no key', 'authentication', false)) };
    const storage = { upload: vi.fn() };
    const visuals = planArticleVisuals({ contentType: 'GUIDE', topic: 'DSR', count: 3 });
    const result = await generateArticleVisualAssets({ articleId: 'dsr', articleTopic: 'DSR', visuals, provider, storage, retry: 1, logger: { warn: vi.fn() } });
    expect(provider.generate).toHaveBeenCalledTimes(1);
    expect(result.visuals).toEqual([]);
    expect(result.failures.map((failure) => failure.code)).toEqual(['authentication', 'provider_stopped', 'provider_stopped']);
  });
});
