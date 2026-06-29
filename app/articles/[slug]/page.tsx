import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import MoneyPickArticle from '@/components/moneypick/MoneyPickArticle';
import AdColumn from '@/components/post/AdColumn';
import DetailPromoSection from '@/components/post/DetailPromoSection';
import PostSidebar from '@/components/post/PostSidebar';
import { mortgageTransfer } from '@/src/data/articles/mortgage-transfer';
import { interestCutRequest } from '@/src/data/articles/interest-cut-request';
import { getMoneypickArticleBySlug, getMoneypickArticlesByCategory, getPopularPosts, getPostsByCategory } from '@/lib/db';
import { getArticleUrl } from '@/lib/article-url';
import { popularPosts, allPosts } from '@/src/data/posts';
import type { MoneyPickArticleProps } from '@/components/moneypick/types';

export const dynamic = 'force-dynamic';

// 정적 아티클 폴백 (기존 TS 파일)
const STATIC_ARTICLES: Record<string, MoneyPickArticleProps> = {
  'mortgage-transfer': mortgageTransfer,
  'interest-cut-request': interestCutRequest,
};

const ARTICLE_CATEGORY_ID: Record<string, string> = {
  'mortgage-transfer': '1',
  'interest-cut-request': '1',
};

const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T) =>
  Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);

interface Props { params: Promise<{ slug: string }> }

function getMetaDescription(article: MoneyPickArticleProps) {
  return (article.metaDescription || article.lead).replace(/\*\*/g, '').slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // DB 우선, 없으면 정적 파일
  const dbArticle = await withTimeout(getMoneypickArticleBySlug(slug), 5000, null);
  const article = dbArticle ?? STATIC_ARTICLES[slug];
  if (!article) return {};
  const description = getMetaDescription(article);
  const images = article.thumbnailUrl ? [article.thumbnailUrl] : undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: getArticleUrl(article.categoryKey, slug) },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.date,
      images,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // DB에서 먼저 조회, 없으면 정적 파일 폴백
  const dbArticle = await withTimeout(getMoneypickArticleBySlug(slug), 5000, null);
  const article = dbArticle ?? STATIC_ARTICLES[slug];
  if (!article) notFound();
  redirect(getArticleUrl(article.categoryKey, slug));

  const categoryId = ARTICLE_CATEGORY_ID[slug] ?? '1';
  const articleCategoryKey = (article as { categoryKey?: string }).categoryKey ?? '';
  const [popular, categoryPosts, relatedArticles] = await Promise.all([
    withTimeout(getPopularPosts(5), 3000, popularPosts.slice(0, 5)),
    withTimeout(getPostsByCategory(categoryId), 3000, allPosts.filter((p) => p.categoryId === categoryId && p.status === 'published')),
    withTimeout(getMoneypickArticlesByCategory(articleCategoryKey, slug, 4), 3000, []),
  ]);

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-navy-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 lg:px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,800px)_280px] lg:justify-center xl:grid-cols-[minmax(760px,800px)_minmax(340px,360px)] xl:gap-8 widescreen:grid-cols-[760px_300px_minmax(280px,300px)]">

          {/* ── 본문 ── */}
          <main className="min-w-0">
            <MoneyPickArticle {...article} />
          </main>

          {/* ── 광고 컬럼 (widescreen) ── */}
          <AdColumn />

          {/* ── 사이드바 ── */}
          <PostSidebar popular={popular} categoryPosts={categoryPosts} currentPostId="" />
        </div>

        {/* ── 관련 아티클 ── */}
        {relatedArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-[18px] font-extrabold text-[#1a1d1f] dark:text-white">
              이 글과 함께 보면 좋은 콘텐츠
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArticles.map((r) => (
                <a
                  key={r.id}
                  href={getArticleUrl(r.category_key, r.slug)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e2e8e5] bg-white transition hover:border-[#21A05A] hover:shadow-md dark:border-white/10 dark:bg-navy-900"
                >
                  {r.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnail_url} alt={r.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-[#e8f5ee] to-[#d0edd9] dark:from-navy-800 dark:to-navy-700">
                      <span className="text-3xl">💰</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-1.5 text-[11px] font-bold text-[#21A05A]">{r.category_label}</span>
                    <p className="flex-1 text-[14px] font-extrabold leading-snug text-[#1a1d1f] group-hover:text-[#21A05A] dark:text-white">
                      {r.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#b0bab4]">
                      {r.reading_time && <span>{r.reading_time} 읽기</span>}
                      <span>{r.created_at.slice(0, 10).replace(/-/g, '.')}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── 하단 섹션 ── */}
        <div className="mt-8 space-y-6">
          <DetailPromoSection />
        </div>
      </div>
    </div>
  );
}
