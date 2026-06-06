import Link from 'next/link';
import { allPosts } from '@/src/data/posts';
import { categories } from '@/src/data/categories';

function getCategoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? '';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

// 조회수 기준 섞어서 추천 3개 선택 (실제로는 ML 기반 추천으로 교체 예정)
const recommended = allPosts
  .filter((p) => p.thumbnail)
  .sort(() => Math.random() - 0.5)
  .slice(0, 3);

export default function RecommendedPosts() {
  return (
    <section className="py-10 bg-[#F6F8FA] dark:bg-navy-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[#1A1D1F] dark:text-white">추천 콘텐츠</h2>
          <Link
            href="/posts"
            className="text-[12px] font-medium text-[#8A949E] dark:text-slate-500 hover:text-[#21A05A] transition-colors"
          >
            전체 글 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recommended.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="bg-white dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 hover:border-[#21A05A] dark:hover:border-[#21A05A] transition-all group"
            >
              {post.thumbnail && (
                <div className="w-full aspect-[16/9] overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/25 text-[#21A05A] font-medium">
                    {getCategoryName(post.categoryId)}
                  </span>
                  <span className="text-[11px] text-[#8A949E] dark:text-slate-500">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3 className="text-[13px] font-semibold text-[#1A1D1F] dark:text-slate-100 group-hover:text-[#21A05A] line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                {post.summary[0] && (
                  <p className="text-[12px] text-[#5B6168] dark:text-slate-500 mt-1.5 line-clamp-1">
                    {post.summary[0]}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
