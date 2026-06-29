export type CategoryKey = string;

export type ArticleBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'point'; text: string }
  | { type: 'warning'; title?: string; text: string }
  | { type: 'example'; text: string }
  | { type: 'calculator'; label: string; caption?: string; href: string }
  | { type: 'faq'; items: { q: string; a: string }[] };

export interface MoneyPickArticleProps {
  categoryKey: CategoryKey;
  categoryLabel: string;
  title: string;
  date: string;
  updateDate?: string;
  readingTime?: string;
  views?: number;
  editor?: string;
  authorPostCount?: number;
  heroStat?: { value: string; label: string };
  lead: string;
  metaDescription?: string;
  thumbnailUrl?: string;
  blocks?: ArticleBlock[];
  bodyHtml?: string;
  summary?: string[];
  relatedCalculators?: { label: string; href: string }[];
  recommendedContent?: { title: string; category: string; href: string; emoji?: string; views?: number }[];
  tags?: string[];
  related?: { category: string; title: string; href: string; emoji?: string }[];
  disclaimer?: string;
}

export interface MoneypickArticleRow {
  id: string;
  slug: string;
  category_key: CategoryKey;
  category_label: string;
  title: string;
  seo_title?: string | null;
  lead: string;
  meta_description: string | null;
  body_html: string;
  summary: string[];
  faq: { q: string; a: string }[];
  tags: string[];
  editor: string;
  reading_time: string | null;
  hero_value: string | null;
  hero_label: string | null;
  related_calculators: { label: string; href: string }[];
  disclaimer: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published';
  source?: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}
