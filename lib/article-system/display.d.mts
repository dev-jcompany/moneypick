import type { ArticleSchemaV2 } from './article-schema.mjs';

export type CardVariant = 'standard' | 'featured' | 'compact' | 'numbered';
export type DisplayArticle = {
  id: string;
  article_type?: string | null;
  pattern_id?: string | null;
  article_schema?: ArticleSchemaV2 | null;
};
export function cardVariantFor(article: DisplayArticle, index?: number): CardVariant;
export function performanceDimensions(
  article: DisplayArticle,
  placement: string,
  variant: CardVariant,
): Record<string, string>;
