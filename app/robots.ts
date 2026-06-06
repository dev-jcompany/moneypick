import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moneypick.kr';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/search'] }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
