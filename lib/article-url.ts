import type { CategoryKey } from '@/components/moneypick/types';

/** 카테고리별 대표색 — 히어로·카드 썸네일 배경에 공통 적용 */
export const CATEGORY_HERO_COLOR: Record<CategoryKey, string> = {
  loan:   '#27ab63',
  estate: '#3b82f6',
  tax:    '#f59e0b',
  work:   '#8b5cf6',
  invest: '#14b8a6',
};

const CATEGORY_KEY_TO_PATH: Record<CategoryKey, string> = {
  loan: 'loan',
  estate: 'realestate',
  tax: 'tax',
  work: 'work',
  invest: 'invest',
};

const CATEGORY_PATH_TO_KEY: Record<string, CategoryKey> = {
  loan: 'loan',
  realestate: 'estate',
  tax: 'tax',
  work: 'work',
  invest: 'invest',
};

export function getArticleCategoryPath(categoryKey: CategoryKey | string) {
  return CATEGORY_KEY_TO_PATH[categoryKey as CategoryKey] ?? String(categoryKey);
}

export function getArticleCategoryKeyFromPath(categoryPath: string): CategoryKey | null {
  return CATEGORY_PATH_TO_KEY[categoryPath] ?? null;
}

export function getArticleUrl(categoryKey: CategoryKey | string, slug: string) {
  return `/${getArticleCategoryPath(categoryKey)}/${slug}`;
}
