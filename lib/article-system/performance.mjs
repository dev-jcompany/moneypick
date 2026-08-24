export function buildPerformanceRows(articles) {
  const groups = new Map();
  for (const article of articles) {
    const contentType = article.article_schema?.contentType ?? article.article_type ?? 'LEGACY';
    const pattern = article.article_schema?.pattern ?? article.pattern_id ?? 'LEGACY';
    const variant = article.article_schema?.variant ?? 'LEGACY';
    const key = `${contentType}|${pattern}|${variant}`;
    const current = groups.get(key) ?? { contentType, pattern, variant, articles: 0, views: 0 };
    current.articles += 1;
    current.views += Number(article.views ?? 0);
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => b.views - a.views || b.articles - a.articles);
}
