import type { ArticleSchemaV2 } from './article-schema.mjs';
export type PerformanceSource = {
  article_type?: string | null;
  pattern_id?: string | null;
  article_schema?: ArticleSchemaV2 | null;
  views?: number;
};
export type PerformanceRow = { contentType: string; pattern: string; variant: string; articles: number; views: number };
export function buildPerformanceRows(articles: PerformanceSource[]): PerformanceRow[];
