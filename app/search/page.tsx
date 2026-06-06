import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import SearchClient from '@/components/SearchClient';
import { allPosts } from '@/src/data/posts';

export const metadata: Metadata = { title: '검색', description: '머니픽 금융 콘텐츠 검색' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const q = (await searchParams).q;
  const initialQuery = Array.isArray(q) ? q[0] : q ?? '';
  return <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14"><Breadcrumb items={[{ label: '검색' }]} /><h1 className="mb-2 text-3xl font-extrabold">콘텐츠 검색</h1><p className="mb-8 text-[#5B6168] dark:text-slate-400">제목과 핵심 내용을 함께 검색합니다.</p><SearchClient posts={allPosts.filter((post) => post.status === 'published')} initialQuery={initialQuery} /></div>;
}
