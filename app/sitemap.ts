import type { MetadataRoute } from 'next';
import { getVisibleCategories } from '@/lib/db';
import { calculators } from '@/src/data/calculators';
import { allPosts } from '@/src/data/posts';
import { siteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getVisibleCategories();
  const staticRoutes = ['', '/posts', '/calculators', '/news', '/about', '/contact', '/privacy', '/terms', '/disclaimer'];
  return [
    ...staticRoutes.map((path, index) => ({ url: `${siteUrl}${path}`, lastModified: new Date(), changeFrequency: index === 0 ? 'daily' as const : 'monthly' as const, priority: index === 0 ? 1 : 0.6 })),
    ...categories.map((category) => ({ url: `${siteUrl}/${encodeURIComponent(category.slug)}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...allPosts.filter((post) => post.status === 'published').map((post) => ({ url: `${siteUrl}/posts/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...calculators.map((calculator) => ({ url: `${siteUrl}/calculators/${calculator.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
