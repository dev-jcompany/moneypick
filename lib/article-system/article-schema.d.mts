import type { CanonicalContentType } from './content-types.mjs';

export type ArticleSchemaBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'point'; text: string }
  | { type: 'warning'; title?: string; text: string }
  | { type: 'example'; text: string }
  | { type: 'calculator'; items: { label: string; href: string; caption?: string }[] }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'summary'; variant: 'S1' | 'S2'; items: string[] }
  | { type: 'table'; variant: 'T1'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'officialSources'; variant: 'O1'; agencyIds: string[] };

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
export function articleSchemaToLegacyHtml(articleSchema: ArticleSchemaV2): string;
