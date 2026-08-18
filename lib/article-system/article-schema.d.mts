import type { CanonicalContentType } from './content-types.mjs';

export type ArticleSchemaBlock = Record<string, unknown> & { type: string };

export interface ArticleSchemaV2 {
  version: 2;
  contentType: CanonicalContentType;
  pattern: string;
  variant: string;
  blocks: ArticleSchemaBlock[];
  searchIntent?: string;
  thumbnailVariant?: string;
  displayMetadata?: Record<string, unknown>;
}

export type ArticleSchemaValidation = { valid: boolean; errors: string[] };
export function validateArticleSchemaV2(value: unknown): ArticleSchemaValidation;
export function isArticleSchemaV2(value: unknown): value is ArticleSchemaV2;
export function articleRenderingMode(articleSchema: unknown): 'legacy' | 'v2';
