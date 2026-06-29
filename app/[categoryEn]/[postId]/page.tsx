import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import MoneyPickArticle from '@/components/moneypick/MoneyPickArticle';
import type { MoneyPickArticleProps, CategoryKey } from '@/components/moneypick/types';
import AdColumn from '@/components/post/AdColumn';
import DetailPromoSection from '@/components/post/DetailPromoSection';
import PostDetailView from '@/components/post/PostDetailView';
import PostSidebar from '@/components/post/PostSidebar';
import {
  getMoneypickArticleBySlug,
  getMoneypickArticlesByCategory,
  getPopularPosts,
  getPostByNumberSlug,
  getPostsByCategory,
  getVisibleCategories,
  getVisibleCategoryByPath,
} from '@/lib/db';
import { getArticleCategoryPath, getArticleUrl, CATEGORY_HERO_COLOR } from '@/lib/article-url';
import { categories } from '@/src/data/categories';
import { staticArticles } from '@/src/data/articles';
import { allPosts, popularPosts } from '@/src/data/posts';

interface Props {
  params: Promise<{ categoryEn: string; postId: string }>;
}

const STATIC_ARTICLES: Record<string, MoneyPickArticleProps> = Object.fromEntries(
  staticArticles.map((article) => [article.slug, article.data]),
);

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T) =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

function parsePostId(postId: string): { postNumber: number; englishSlug: string } | null {
  const match = postId.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  const postNumber = parseInt(match[1], 10);
  if (Number.isNaN(postNumber)) return null;
  return { postNumber, englishSlug: match[2] };
}

function getMetaDescription(article: MoneyPickArticleProps) {
  return (article.metaDescription || article.lead).replace(/\*\*/g, '').slice(0, 160);
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryEn, postId } = await params;
  const cat = await getVisibleCategoryByPath(categoryEn);
  if (!cat) return {};

  const parsed = parsePostId(postId);
  if (parsed) {
    const post = await getPostByNumberSlug(parsed.postNumber, parsed.englishSlug);
    if (!post) return {};
    const postCategory = categories.find((category) => category.id === post.categoryId);
    return {
      title: post.title,
      description: post.metaDescription,
      alternates: { canonical: `/${postCategory?.enSlug ?? categoryEn}/${postId}` },
      openGraph: { title: post.title, description: post.metaDescription, type: 'article' },
    };
  }

  const dbArticle = await withTimeout(getMoneypickArticleBySlug(postId), 5000, null);
  const article = dbArticle ?? STATIC_ARTICLES[postId];
  if (!article) return {};

  const description = getMetaDescription(article);
  const images = article.thumbnailUrl ? [article.thumbnailUrl] : undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: getArticleUrl(article.categoryKey, postId) },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.date,
      images,
    },
  };
}

export default async function CategoryContentPage({ params }: Props) {
  const { categoryEn, postId } = await params;
  const cat = await getVisibleCategoryByPath(categoryEn);
  if (!cat) notFound();

  const parsed = parsePostId(postId);
  if (parsed) {
    const post = await getPostByNumberSlug(parsed.postNumber, parsed.englishSlug);
    if (!post) notFound();

    const correctCat = categories.find((category) => category.id === post.categoryId);
    if (correctCat && correctCat.enSlug !== categoryEn) {
      redirect(`/${correctCat.enSlug}/${postId}`);
    }

    const [popular, categoryPosts] = await Promise.all([
      getPopularPosts(5),
      getPostsByCategory(post.categoryId),
    ]);

    return <PostDetailView post={post} popular={popular} categoryPosts={categoryPosts} />;
  }

  const dbArticle = await withTimeout(getMoneypickArticleBySlug(postId), 5000, null);
  const article = dbArticle ?? STATIC_ARTICLES[postId];
  if (!article) notFound();

  const correctUrl = getArticleUrl(article.categoryKey, postId);
  if (correctUrl !== `/${categoryEn}/${postId}`) redirect(correctUrl);

  const visibleCategories = await getVisibleCategories();
  const articleCategory = visibleCategories.find((category) => category.enSlug === getArticleCategoryPath(article.categoryKey));
  const fallbackArticleCategory = categories.find((category) => category.enSlug === getArticleCategoryPath(article.categoryKey));
  const [popular, categoryPosts, relatedArticles] = await Promise.all([
    withTimeout(getPopularPosts(5), 3000, popularPosts.slice(0, 5)),
    withTimeout(
      getPostsByCategory(fallbackArticleCategory?.id ?? articleCategory?.id ?? cat.id),
      3000,
      allPosts.filter((post) => post.categoryId === (fallbackArticleCategory?.id ?? articleCategory?.id ?? cat.id) && post.status === 'published'),
    ),
    withTimeout(getMoneypickArticlesByCategory(article.categoryKey, postId, 4), 3000, []),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:pb-14 md:pt-6">
      <Breadcrumb items={[{ label: article.categoryLabel, href: `/${getArticleCategoryPath(article.categoryKey)}` }, { label: article.title }]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,760px)_280px] xl:gap-8">
        <main className="min-w-0">
          <MoneyPickArticle {...article} />
        </main>

        <AdColumn />

        <PostSidebar popular={popular} categoryPosts={categoryPosts} currentPostId="" />
      </div>

      {relatedArticles.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-[18px] font-extrabold text-[#1a1d1f] dark:text-white">
            함께 보면 좋은 콘텐츠
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedArticles.map((related) => (
              <a
                key={related.id}
                href={getArticleUrl(related.category_key, related.slug)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2e8e5] bg-white transition hover:border-[#21A05A] hover:shadow-md dark:border-white/10 dark:bg-navy-900"
              >
                {related.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={related.thumbnail_url} alt={related.title} className="h-36 w-full object-cover" />
                ) : (
                  <div
                    className="flex h-36 w-full items-center justify-center text-3xl"
                    style={{ backgroundColor: CATEGORY_HERO_COLOR[related.category_key as CategoryKey] ?? '#27ab63' }}
                  >
                    💡
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-1.5 text-[11px] font-bold text-[#21A05A]">{related.category_label}</span>
                  <p className="flex-1 text-[14px] font-extrabold leading-snug text-[#1a1d1f] group-hover:text-[#21A05A] dark:text-white">
                    {related.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-[#b0bab4]">
                    {related.reading_time && <span>{related.reading_time} 읽기</span>}
                    <span>{related.created_at.slice(0, 10).replace(/-/g, '.')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <DetailPromoSection />
      </div>
    </div>
  );
}
