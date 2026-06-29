import type { MoneyPickArticleProps, CategoryKey } from '@/components/moneypick/types';
import { mortgageTransfer } from './mortgage-transfer';
import { interestCutRequest } from './interest-cut-request';

export interface StaticArticle {
  slug: string;
  categoryKey: CategoryKey;
  categoryEnSlug: string;
  title: string;
  lead: string;
  date: string;
  readingTime?: string;
  data: MoneyPickArticleProps;
}

export const staticArticles: StaticArticle[] = [
  {
    slug: 'mortgage-transfer',
    categoryKey: 'loan',
    categoryEnSlug: 'loan',
    title: mortgageTransfer.title,
    lead: mortgageTransfer.lead,
    date: mortgageTransfer.date,
    readingTime: mortgageTransfer.readingTime,
    data: mortgageTransfer,
  },
  {
    slug: 'interest-cut-request',
    categoryKey: 'loan',
    categoryEnSlug: 'loan',
    title: interestCutRequest.title,
    lead: interestCutRequest.lead,
    date: interestCutRequest.date,
    readingTime: interestCutRequest.readingTime,
    data: interestCutRequest,
  },
];

export function getStaticArticlesByCategory(categoryEnSlug: string): StaticArticle[] {
  return staticArticles.filter((a) => a.categoryEnSlug === categoryEnSlug);
}
