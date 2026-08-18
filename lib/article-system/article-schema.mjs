import { allowedPatternsFor, isCanonicalContentType } from './content-types.mjs';

export function validateArticleSchemaV2(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { valid: false, errors: ['article_schema must be an object'] };
  }
  if (value.version !== 2) errors.push('version must be 2');
  if (!isCanonicalContentType(value.contentType)) errors.push('contentType is invalid');
  if (typeof value.pattern !== 'string' || !value.pattern.trim()) {
    errors.push('pattern is required');
  } else if (isCanonicalContentType(value.contentType) && !allowedPatternsFor(value.contentType).includes(value.pattern)) {
    errors.push('pattern is not allowed for contentType');
  }
  if (typeof value.variant !== 'string' || !value.variant.trim()) errors.push('variant is required');
  if (!Array.isArray(value.blocks)) errors.push('blocks must be an array');
  return { valid: errors.length === 0, errors };
}

export function isArticleSchemaV2(value) {
  return validateArticleSchemaV2(value).valid;
}

export function articleRenderingMode(articleSchema) {
  return isArticleSchemaV2(articleSchema) ? 'v2' : 'legacy';
}
