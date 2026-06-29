import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getMoneypickArticlesByCategory, getPostsByCategory, getVisibleCategories, getVisibleCategoryByPath } from '@/lib/db';
import { getArticleCategoryKeyFromPath, getArticleUrl, CATEGORY_HERO_COLOR } from '@/lib/article-url';
import { categories } from '@/src/data/categories';
import { getStaticArticlesByCategory } from '@/src/data/articles';
import type { CategoryKey } from '@/components/moneypick/types';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ categoryEn: string }> }
type CategoryArticleCard = {
  slug: string;
  categoryKey: CategoryKey;
  title: string;
  lead: string;
  thumbnailUrl?: string;
  date: string;
  readingTime?: string;
};

function findCategory(enSlug: string) {
  return categories.find((c) => c.enSlug === decodeURIComponent(enSlug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getVisibleCategoryByPath((await params).categoryEn);
  return cat ? { title: cat.name, description: cat.description } : {};
}

export async function generateStaticParams() {
  const visibleCategories = await getVisibleCategories();
  return visibleCategories.map((c) => ({ categoryEn: c.enSlug }));
}

export default async function CategoryPage({ params }: Props) {
  const { categoryEn } = await params;
  const cat = await getVisibleCategoryByPath(categoryEn);
  if (!cat) notFound();
  const fallbackCat = findCategory(categoryEn);
  const categoryKey = getArticleCategoryKeyFromPath(cat.enSlug) ?? cat.enSlug;
  const [posts, staticArticles, dbArticles] = await Promise.all([
    getPostsByCategory(fallbackCat?.id ?? cat.id),
    Promise.resolve(getStaticArticlesByCategory(cat.enSlug)),
    categoryKey ? getMoneypickArticlesByCategory(categoryKey, '', 50) : Promise.resolve([]),
  ]);
  const articles: CategoryArticleCard[] = [
    ...dbArticles.map((article) => ({
      slug: article.slug,
      categoryKey: article.category_key,
      title: article.title,
      lead: article.lead,
      thumbnailUrl: article.thumbnail_url ?? undefined,
      date: article.created_at.slice(0, 10).replace(/-/g, '.'),
      readingTime: article.reading_time ?? undefined,
    })),
    ...staticArticles.map((article) => ({
      slug: article.slug,
      categoryKey: article.categoryKey,
      title: article.title,
      lead: article.lead,
      thumbnailUrl: article.data.thumbnailUrl,
      date: article.date,
      readingTime: article.readingTime,
    })),
  ];
  const totalCount = posts.length + articles.length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:pb-14 md:pt-6">
      <header className="mb-9 rounded-3xl border border-[#E8ECEF] bg-white p-7 dark:border-navy-700 dark:bg-navy-800 md:p-9">
        <div className="mb-3 text-4xl" aria-hidden="true">{cat.icon}</div>
        <h1 className="mb-3 text-3xl font-extrabold text-[#1A1D1F] dark:text-white">{cat.name}</h1>
        <p className="max-w-2xl leading-7 text-[#5B6168] dark:text-slate-400">{cat.description}</p>
      </header>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold">최신 콘텐츠</h2>
        <span className="text-sm text-[#8A949E]">총 {totalCount}개</span>
      </div>
      {totalCount > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.slug} className="h-full overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
              <Link href={getArticleUrl(article.categoryKey, article.slug)} className="flex h-full flex-col p-5">
                {article.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.thumbnailUrl} alt="" className="-mx-5 -mt-5 mb-4 aspect-[16/9] w-[calc(100%+2.5rem)] max-w-none object-cover" loading="lazy" />
                ) : (
                  <div
                    className="-mx-5 -mt-5 mb-4 flex aspect-[16/9] items-center justify-center text-4xl"
                    style={{ backgroundColor: CATEGORY_HERO_COLOR[article.categoryKey] ?? '#27ab63' }}
                  >
                    💰
                  </div>
                )}
                <div className="mb-2 flex items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-green-50 px-2 py-1 font-semibold text-[#21A05A] dark:bg-green-900/20">{cat.name}</span>
                  <time className="text-[#8A949E]">{article.date}</time>
                  {article.readingTime && <span className="text-[#8A949E]">· {article.readingTime}</span>}
                </div>
                <h2 className="mb-2 text-[16px] font-bold leading-snug text-[#1A1D1F] dark:text-white">{article.title}</h2>
                <p className="line-clamp-2 text-[13px] leading-relaxed text-[#5B6168] dark:text-slate-400">
                  {article.lead.replace(/\*\*/g, '')}
                </p>
                <span className="mt-4 text-xs font-bold text-[#21A05A]">자세히 보기 →</span>
              </Link>
            </article>
          ))}
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DDE3EB] p-10 text-center text-sm text-[#8A949E] dark:border-navy-600">
          이 카테고리의 콘텐츠를 준비하고 있습니다.
        </div>
      )}
    </div>
  );
}
