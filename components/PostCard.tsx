import Link from 'next/link';
import type { Post } from '@/src/types';
import { categories } from '@/src/data/categories';

export default function PostCard({ post }: { post: Post }) {
  const category = categories.find((item) => item.id === post.categoryId);
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col">
        {post.thumbnail && <img src={post.thumbnail} alt="" className="aspect-[16/9] w-full object-cover" loading="lazy" />}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2 text-[11px]">
            <span className="rounded-full bg-green-50 px-2 py-1 font-semibold text-[#21A05A] dark:bg-green-900/20">{category?.name}</span>
            <time className="text-[#8A949E]">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</time>
          </div>
          <h2 className="mb-2 text-[16px] font-bold leading-snug text-[#1A1D1F] dark:text-white">{post.title}</h2>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#5B6168] dark:text-slate-400">{post.metaDescription}</p>
          <span className="mt-4 text-xs font-bold text-[#21A05A]">자세히 보기 →</span>
        </div>
      </Link>
    </article>
  );
}
