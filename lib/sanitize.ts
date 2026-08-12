import sanitizeHtml from 'sanitize-html';

const allowedTags = [
  'p', 'br', 'hr', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'small', 'sub', 'sup',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'figure', 'figcaption',
];

/** Sanitizes stored article HTML before it reaches dangerouslySetInnerHTML. */
export function sanitizePostHtml(html: string): string {
  if (!html) return '';

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      '*': ['class', 'style'],
      a: ['href', 'name', 'target', 'title', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      ol: ['start'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    allowedStyles: {
      '*': {
        'text-align': [/^(?:left|right|center|justify)$/],
        'font-weight': [/^(?:normal|bold|[1-9]00)$/],
        'font-style': [/^(?:normal|italic)$/],
        'text-decoration': [/^(?:none|underline|line-through)$/],
        'line-height': [/^(?:normal|[0-9.]+(?:px|em|rem|%)?)$/],
        'border-collapse': [/^(?:collapse|separate)$/],
      },
    },
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, rel: 'noopener noreferrer' },
      }),
      img: (tagName, attributes) => ({
        tagName,
        attribs: { ...attributes, loading: attributes.loading === 'eager' ? 'eager' : 'lazy' },
      }),
    },
  });
}
