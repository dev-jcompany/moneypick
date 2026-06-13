import Link from 'next/link';
import { AdInline } from '@/components/post/AdColumn';
import type { Post } from '@/src/types';
import { categories } from '@/src/data/categories';
import { getPostUrl } from '@/lib/url';

const rankColors = [
  'bg-[#21A05A] text-white',
  'bg-[#3B82F6] text-white',
  'bg-[#F59E0B] text-white',
  'bg-[#94A3B8] text-white',
  'bg-[#94A3B8] text-white',
];

function getCategoryName(categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name ?? '';
}

interface Props {
  popular: Post[];
  categoryPosts: Post[];
  currentPostId: string;
}

export default function PostSidebar({ popular, categoryPosts, currentPostId }: Props) {
  const filteredCategory = categoryPosts.filter((p) => p.id !== currentPostId).slice(0, 3);

  return (
    <aside className="hidden min-w-0 lg:block">
      <div className="sticky top-[100px] space-y-4">
        <AdInline />

        {/* 실시간 인기 글 */}
        <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-extrabold text-[#1A1D1F]">실시간 인기 글</h3>
            <Link href="/posts" className="text-[11px] text-[#8A949E] hover:text-[#21A05A]">더보기 →</Link>
          </div>
          <ol className="space-y-3">
            {popular.slice(0, 5).map((post, i) => (
              <li key={post.id}>
                <Link href={getPostUrl(post)} className="group flex items-start gap-2.5">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold ${rankColors[i]}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[12px] font-medium leading-snug text-[#1A1D1F] group-hover:text-[#21A05A]">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#94A3B8]">조회 {post.views.toLocaleString()}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        {/* 같은 카테고리 추천 글 */}
        {filteredCategory.length > 0 && (
          <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-[#1A1D1F]">같은 카테고리 추천 글</h3>
              <Link href="/posts" className="text-[11px] text-[#8A949E] hover:text-[#21A05A]">더보기 →</Link>
            </div>
            <ul className="space-y-3.5">
              {filteredCategory.map((post) => (
                <li key={post.id}>
                  <Link href={getPostUrl(post)} className="group flex gap-3">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="h-14 w-20 shrink-0 rounded-xl bg-[#F1F5F3]" />
                    )}
                    <div className="min-w-0">
                      <span className="mb-0.5 inline-block text-[10px] font-bold text-[#21A05A]">
                        {getCategoryName(post.categoryId)}
                      </span>
                      <p className="line-clamp-2 text-[12px] font-medium leading-snug text-[#1A1D1F] group-hover:text-[#21A05A]">
                        {post.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#94A3B8]">조회 {post.views.toLocaleString()}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
