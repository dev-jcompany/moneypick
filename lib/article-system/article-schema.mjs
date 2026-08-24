import { allowedPatternsFor, isCanonicalContentType } from './content-types.mjs';

const TEXT_BLOCKS = new Set(['heading', 'paragraph', 'point', 'example']);

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function stringArray(value, minimum = 1) {
  return Array.isArray(value) && value.length >= minimum && value.every(nonEmptyString);
}

function safeCalculatorHref(value) {
  return typeof value === 'string' && /^\/calculators\/[a-z0-9-]+$/.test(value);
}

function validateBlock(block, index) {
  const prefix = `blocks[${index}]`;
  if (!block || typeof block !== 'object' || Array.isArray(block)) return [`${prefix} must be an object`];
  if (TEXT_BLOCKS.has(block.type)) return nonEmptyString(block.text) ? [] : [`${prefix}.text is required`];

  switch (block.type) {
    case 'checklist':
      return nonEmptyString(block.title) && stringArray(block.items) ? [] : [`${prefix} checklist is invalid`];
    case 'warning':
      return nonEmptyString(block.text) ? [] : [`${prefix}.text is required`];
    case 'calculator':
      return Array.isArray(block.items) && block.items.length > 0 && block.items.length <= 3 &&
        block.items.every((item) => item && nonEmptyString(item.label) && safeCalculatorHref(item.href))
        ? [] : [`${prefix} calculator items are invalid`];
    case 'faq':
      return Array.isArray(block.items) && block.items.length > 0 &&
        block.items.every((item) => item && nonEmptyString(item.q) && nonEmptyString(item.a))
        ? [] : [`${prefix} FAQ items are invalid`];
    case 'summary':
      return ['S1', 'S2'].includes(block.variant) && stringArray(block.items)
        ? [] : [`${prefix} summary is invalid`];
    case 'table': {
      const width = Array.isArray(block.headers) ? block.headers.length : 0;
      const rowsValid = Array.isArray(block.rows) && block.rows.length > 0 &&
        block.rows.every((row) => Array.isArray(row) && row.length === width && row.every(nonEmptyString));
      return block.variant === 'T1' && stringArray(block.headers) && rowsValid
        ? [] : [`${prefix} table is invalid`];
    }
    case 'officialSources':
      return block.variant === 'O1' && stringArray(block.agencyIds)
        ? [] : [`${prefix} officialSources is invalid`];
    default:
      return [`${prefix}.type is unsupported`];
  }
}

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
  if (!Array.isArray(value.blocks)) {
    errors.push('blocks must be an array');
  } else {
    value.blocks.forEach((block, index) => errors.push(...validateBlock(block, index)));
    if (value.blocks[0]?.type !== 'summary') errors.push('blocks must start with summary');
    if (!value.blocks.some((block) => block?.type === 'faq')) errors.push('blocks must contain FAQ');
  }
  return { valid: errors.length === 0, errors };
}

export function isArticleSchemaV2(value) {
  return validateArticleSchemaV2(value).valid;
}

export function articleRenderingMode(articleSchema) {
  return isArticleSchemaV2(articleSchema) ? 'v2' : 'legacy';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function articleSchemaToLegacyHtml(articleSchema) {
  if (!isArticleSchemaV2(articleSchema)) throw new Error('Cannot serialize an invalid ArticleSchemaV2');
  return articleSchema.blocks.map((block) => {
    switch (block.type) {
      case 'summary':
        return `<ul class="mp-summary">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      case 'heading':
        return `<h2>${escapeHtml(block.text)}</h2>`;
      case 'paragraph':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'checklist':
        return `<h3>${escapeHtml(block.title)}</h3><ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      case 'point':
        return `<p class="mp-point">${escapeHtml(block.text)}</p>`;
      case 'warning':
        return `<p class="mp-warning">${block.title ? `<strong>${escapeHtml(block.title)}</strong><br>` : ''}${escapeHtml(block.text)}</p>`;
      case 'example':
        return `<p>${escapeHtml(block.text)}</p>`;
      case 'calculator':
        return block.items.map((item) => `<a class="mp-calc-cta" href="${escapeHtml(item.href)}"><strong>${escapeHtml(item.label)}</strong>${item.caption ? `<span>${escapeHtml(item.caption)}</span>` : ''}</a>`).join('');
      case 'faq':
        return `<div class="mp-faq">${block.items.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p class="mp-faq-answer">${escapeHtml(item.a)}</p></details>`).join('')}</div>`;
      case 'table':
        return `${block.caption ? `<p><strong>${escapeHtml(block.caption)}</strong></p>` : ''}<table><thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      case 'officialSources':
        return '';
      default:
        return '';
    }
  }).filter(Boolean).join('\n');
}
