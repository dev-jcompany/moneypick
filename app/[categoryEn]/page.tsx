import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';
import { getPostsByCategory } from '@/lib/db';
import { categories } from '@/src/data/categories';

interface Props { params: Promise<{ categoryEn: string }> }

function findCategory(enSlug: string) {
  return categories.find((c) => c.enSlug === decodeURIComponent(enSlug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = findCategory((await params).categoryEn);
  return cat ? { title: cat.name, description: cat.description } : {};
}

export function generateStaticParams() {
  return categories.map((c) => ({ categoryEn: c.enSlug }));
}

export default async function CategoryPage({ params }: Props) {
  const cat = findCategory((await params).categoryEn);
  if (!cat) notFound();
  const posts = await getPostsByCategory(cat.id);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14">
      <Breadcrumb items={[{ label: cat.name }]} />
      <header className="mb-9 rounded-3xl border border-[#E8ECEF] bg-white p-7 dark:border-navy-700 dark:bg-navy-800 md:p-9">
        <div className="mb-3 text-4xl" aria-hidden="true">{cat.icon}</div>
        <h1 className="mb-3 text-3xl font-extrabold text-[#1A1D1F] dark:text-white">{cat.name}</h1>
        <p className="max-w-2xl leading-7 text-[#5B6168] dark:text-slate-400">{cat.description}</p>
      </header>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold">최신 콘텐츠</h2>
        <span className="text-sm text-[#8A949E]">총 {posts.length}개</span>
      </div>
      {posts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
