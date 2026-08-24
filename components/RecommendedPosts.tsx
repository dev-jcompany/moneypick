import Link from 'next/link';
import { getHomepageMoneypickArticles } from '@/lib/db';
import ArticleCardV2 from '@/components/moneypick/ArticleCardV2';

export default async function RecommendedPosts() {
  const recommended = await getHomepageMoneypickArticles(5);
  if (!recommended.length) return null;

  return (
    <section className="bg-[#F6F8FA] py-10 dark:bg-navy-900">
      <div className="mx-auto max-w-[1500px] px-4">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#1A1D1F] dark:text-white">추천 콘텐츠</h2>
          <Link href="/posts" className="text-[12px] font-medium text-[#8A949E] transition-colors hover:text-[#21A05A] dark:text-slate-500">
            전체 글 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((article, index) => (
            <ArticleCardV2 key={article.id} article={article} index={index} placement="home_recommended" />
          ))}
        </div>
      </div>
    </section>
  );
}
