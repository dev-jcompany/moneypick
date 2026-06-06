import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import PostCard from '@/components/PostCard';
import { allPosts } from '@/src/data/posts';

export const metadata: Metadata = { title: '전체 콘텐츠', description: '머니픽의 금융·부동산·세금·직장·투자 콘텐츠를 모아보세요.' };

export default function PostsPage() {
  const posts = allPosts.filter((post) => post.status === 'published');
  return <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14"><Breadcrumb items={[{ label: '전체 콘텐츠' }]} /><h1 className="mb-2 text-3xl font-extrabold">전체 콘텐츠</h1><p className="mb-8 text-[#5B6168] dark:text-slate-400">생활에 바로 쓰는 금융 정보를 주제별로 확인하세요.</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div></div>;
}
