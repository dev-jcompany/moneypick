export type ArticleFaq = { q: string; a: string };
export type RelatedCalculator = { label: string; href: string };
export type GenerationInput = Record<string, unknown> & {
  title?: string;
  slug?: string;
  body_html?: string;
  lead?: string;
  meta_description?: string | null;
  summary?: unknown;
  faq?: unknown;
  tags?: string[];
  related_calculators?: unknown;
  article_type?: string | null;
  pattern_id?: string | null;
};
export const ARTICLE_TYPES: string[];
export function extractSummary(bodyHtml: unknown, fallbacks?: unknown[]): string[];
export function extractFaq(bodyHtml: unknown): ArticleFaq[];
export function matchArticleCalculators(input: GenerationInput): RelatedCalculator[];
export function calculatorScenarios(calculators: RelatedCalculator[]): unknown[];
export function matchOfficialSources(input: GenerationInput): Array<{ id: string; name: string; url: string }>;
export function validateNormalizedArticle(article: GenerationInput): string[];
export function normalizeArticle(input: GenerationInput, options?: { enrichBody?: boolean }): {
  article: GenerationInput & {
    body_html: string;
    summary: string[];
    faq: ArticleFaq[];
    related_calculators: RelatedCalculator[];
    article_type: string;
    pattern_id: string;
  };
  quality: { calculatorScenarios: unknown[]; officialSources: Array<{ id: string; name: string; url: string }> };
};
