const VARIANTS = Object.freeze(['standard', 'featured', 'compact', 'numbered']);

export function cardVariantFor(article, index = 0) {
  const explicit = article?.article_schema?.displayMetadata?.cardVariant;
  if (VARIANTS.includes(explicit)) return explicit;
  if (index === 0) return 'featured';
  if (article?.article_type === 'CHECKLIST' || article?.article_type === 'TIPS_LIST') return 'numbered';
  if (article?.article_type === 'POLICY_CHANGE') return 'compact';
  return 'standard';
}

export function performanceDimensions(article, placement, variant) {
  return {
    article_id: article.id,
    content_type: article.article_schema?.contentType ?? article.article_type ?? 'LEGACY',
    pattern_id: article.article_schema?.pattern ?? article.pattern_id ?? 'LEGACY',
    schema_variant: article.article_schema?.variant ?? 'LEGACY',
    card_variant: variant,
    placement,
  };
}
