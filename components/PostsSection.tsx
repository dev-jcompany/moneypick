import Link from 'next/link';
import { getPopularPosts, getLatestPosts } from '@/lib/db';
import { categories } from '@/src/data/categories';

function getCategoryName(categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name ?? '';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

const rankBg = ['bg-[#21A05A]', 'bg-[#3B82F6]', 'bg-[#F59E0B]', 'bg-[#6B7280]', 'bg-[#6B7280]'];

export default async function PostsSection() {
  const [popular, latest] = await Promise.all([getPopularPosts(5), getLatestPosts(5)]);

  return (
    <section className="py-10 bg-[#F6F8FA] dark:bg-navy-900">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="md:col-span-3 bg-white dark:bg-navy-800 rounded-2xl border border-[#E8ECEF] dark:border-navy-700 p-6">
            <h2 className="text-[17px] font-bold text-[#1A1D1F] dark:text-white mb-5">인기 콘텐츠 TOP 5</h2>
            <ol className="space-y-4">
              {popular.map((post, idx) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.slug}`} className="flex items-start gap-3 group">
                    <span className={`w-7 h-7 rounded-lg ${rankBg[idx]} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/25 text-[#21A05A] font-medium">{getCategoryName(post.categoryId)}</span>
                        <span className="text-[11px] text-[#8A949E] dark:text-slate-500">조회 {post.views.toLocaleString()}</span>
                      </div>
                      <h3 className="text-[13px] font-medium text-[#1A1D1F] dark:text-slate-100 group-hover:text-[#21A05A] line-clamp-2 leading-snug">{post.title}</h3>
                    </div>
                    {post.thumbnail && (
                      <div className="w-[58px] h-[58px] rounded-lg overflow-hidden shrink-0 hidden sm:block">
                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-navy-800 rounded-2xl border border-[#E8ECEF] dark:border-navy-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[17px] font-bold text-[#1A1D1F] dark:text-white">최신 콘텐츠</h2>
              <Link href="/posts" className="text-[12px] text-[#8A949E] dark:text-slate-500 hover:text-[#21A05A] transition-colors">전체보기 →</Link>
            </div>
            <ul className="space-y-4">
              {latest.map((post) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.slug}`} className="block group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 font-medium">{getCategoryName(post.categoryId)}</span>
                      <span className="text-[11px] text-[#8A949E] dark:text-slate-500">{formatDate(post.createdAt)}</span>
                    </div>
                    <h3 className="text-[13px] font-medium text-[#1A1D1F] dark:text-slate-100 group-hover:text-[#21A05A] line-clamp-2 leading-snug">{post.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
