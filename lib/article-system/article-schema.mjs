import { allowedPatternsFor, isCanonicalContentType } from './content-types.mjs';
import { VISUAL_COMPOSITIONS, VISUAL_PURPOSES, VISUAL_STYLE, VISUAL_TYPES } from './visual-system.mjs';

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

function safeImageSrc(value) {
  if (typeof value !== 'string') return false;
  if (/^\/images\/[a-z0-9/_-]+\.(?:png|jpe?g|webp)$/i.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co') &&
      url.pathname.startsWith('/storage/v1/object/public/') && /\.(?:png|jpe?g|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function positiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function validateVisual(visual, index) {
  const prefix = `visuals[${index}]`;
  if (!visual || typeof visual !== 'object' || Array.isArray(visual)) return [`${prefix} must be an object`];
  const errors = [];
  if (!/^visual-[a-z0-9-]+$/.test(visual.id ?? '')) errors.push(`${prefix}.id is invalid`);
  if (visual.style !== VISUAL_STYLE) errors.push(`${prefix}.style is invalid`);
  if (!VISUAL_TYPES.includes(visual.type)) errors.push(`${prefix}.type is invalid`);
  if (!VISUAL_PURPOSES.includes(visual.purpose)) errors.push(`${prefix}.purpose is invalid`);
  if (!VISUAL_COMPOSITIONS.includes(visual.composition)) errors.push(`${prefix}.composition is invalid`);
  if (!nonEmptyString(visual.alt)) errors.push(`${prefix}.alt is required`);
  if (!visual.asset || !safeImageSrc(visual.asset.url) || !positiveInteger(visual.asset.width) || !positiveInteger(visual.asset.height) || visual.asset.mimeType !== 'image/webp') {
    errors.push(`${prefix}.asset is invalid`);
  }
  return errors;
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
    case 'image':
      return ['wide', 'split', 'diagram'].includes(block.variant) && safeImageSrc(block.src) && nonEmptyString(block.alt)
        ? [] : [`${prefix} image is invalid`];
    case 'visual':
      return /^visual-[a-z0-9-]+$/.test(block.visualId ?? '') ? [] : [`${prefix}.visualId is invalid`];
    case 'numberResult':
      return ['DEFAULT', 'HIGHLIGHT'].includes(block.variant) && nonEmptyString(block.label) && nonEmptyString(block.value)
        ? [] : [`${prefix} numberResult is invalid`];
    case 'comparison': {
      const width = Array.isArray(block.headers) ? block.headers.length : 0;
      return ['TABLE', 'CARDS'].includes(block.variant) && width >= 2 && stringArray(block.headers, 2) &&
        Array.isArray(block.rows) && block.rows.length > 0 && block.rows.every((row) => Array.isArray(row) && row.length === width && row.every(nonEmptyString))
        ? [] : [`${prefix} comparison is invalid`];
    }
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
  if (value.visuals != null) {
    if (!Array.isArray(value.visuals) || value.visuals.length > 3) {
      errors.push('visuals must be an array with at most 3 items');
    } else {
      value.visuals.forEach((visual, index) => errors.push(...validateVisual(visual, index)));
      const ids = value.visuals.map((visual) => visual?.id);
      if (new Set(ids).size !== ids.length) errors.push('visual ids must be unique');
      for (const block of value.blocks ?? []) {
        if (block?.type === 'visual' && !ids.includes(block.visualId)) errors.push(`visual block references missing asset: ${block.visualId}`);
      }
    }
  } else if (value.blocks?.some((block) => block?.type === 'visual')) {
    errors.push('visual blocks require visuals');
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
      case 'image':
        return `<figure class="mp-image mp-image-${block.variant}"><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" loading="lazy">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`;
      case 'visual': {
        const visual = articleSchema.visuals?.find((item) => item.id === block.visualId);
        return visual ? `<figure class="mp-image mp-image-wide"><img src="${escapeHtml(visual.asset.url)}" alt="${escapeHtml(visual.alt)}" width="${visual.asset.width}" height="${visual.asset.height}" loading="lazy"></figure>` : '';
      }
      case 'numberResult':
        return `<div class="mp-number-result"><span>${escapeHtml(block.label)}</span><strong>${escapeHtml(block.value)}</strong>${block.caption ? `<small>${escapeHtml(block.caption)}</small>` : ''}</div>`;
      case 'comparison':
        return `<table><thead><tr>${block.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      default:
        return '';
    }
  }).filter(Boolean).join('\n');
}
