import type { Post } from '@/src/types';
import { categories, CATEGORY_PREFIX } from '@/src/data/categories';

/**
 * postNumber 생성 규칙:
 *   categoryPrefix(1~5) × 1000  +  타임스탬프 하위 3자리
 *   → 1000~1999 / 2000~2999 / ... / 5000~5999
 */
export function generatePostNumber(categoryId: string): number {
  const prefix = CATEGORY_PREFIX[categoryId] ?? 9;
  const tail = Date.now() % 1000;
  return prefix * 1000 + tail;
}

/**
 * 포스트의 표준 URL 반환
 *   - postNumber + englishSlug 가 있으면 → /{categoryEn}/{postNumber}-{englishSlug}
 *   - 없으면 레거시 → /posts/{slug}
 */
export function getPostUrl(post: Pick<Post, 'slug' | 'postNumber' | 'englishSlug' | 'categoryId'>): string {
  if (post.postNumber && post.englishSlug) {
    const cat = categories.find((c) => c.id === post.categoryId);
    const catEn = cat?.enSlug ?? 'post';
    return `/${catEn}/${post.postNumber}-${post.englishSlug}`;
  }
  return `/posts/${post.slug}`;
}
