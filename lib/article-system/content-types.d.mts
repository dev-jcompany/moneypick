export type CanonicalContentType =
  | 'GUIDE'
  | 'COMPARISON'
  | 'CASE_STUDY'
  | 'CHECKLIST'
  | 'CALCULATOR_FOCUSED'
  | 'POLICY_CHANGE'
  | 'HOW_TO'
  | 'TIPS_LIST';

export type ContentTypeDefinition = {
  label: string;
  description: string;
  allowedPatterns: string[];
};

export const CONTENT_TYPE_REGISTRY: Record<CanonicalContentType, ContentTypeDefinition>;
export const CANONICAL_CONTENT_TYPES: readonly CanonicalContentType[];
export const LEGACY_ARCHETYPE_TO_CONTENT_TYPE: Readonly<Record<string, CanonicalContentType>>;
export const LEGACY_ARTICLE_TYPE_TO_CONTENT_TYPE: Readonly<Record<string, CanonicalContentType>>;
export function isCanonicalContentType(value: unknown): value is CanonicalContentType;
export function mapLegacyArchetype(value: unknown): CanonicalContentType | null;
export function mapLegacyArticleType(value: unknown): CanonicalContentType | null;
export function allowedPatternsFor(contentType: unknown): string[];
