'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';
import { supabase } from '@/lib/supabase';

export default function ContentListPage() {
  const { posts, setPosts, categories } = useAdmin();
  const [sort, setSort] = useState<'latest' | 'views'>('latest');
  const [query, setQuery] = useState('');
  const list = useMemo(() => [...posts].filter((post) => post.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => sort === 'views' ? b.views - a.views : b.updatedAt.localeCompare(a.updatedAt)), [posts, query, sort]);
  const remove = async (id: string) => {
    if (!window.confirm('이 콘텐츠를 삭제할까요?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) { window.alert(`삭제 실패: ${error.message}`); return; }
    setPosts((current) => current.filter((post) => post.id !== id));
  };
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold">콘텐츠 목록</h2><p className="mt-1 text-sm text-slate-500">발행 글과 임시저장 글을 관리합니다.</p></div><Link href="/admin/content/new" className="rounded-xl bg-[#21A05A] px-5 py-3 text-sm font-bold text-white">+ 새 콘텐츠</Link></div>
      <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-[#E7ECE9] p-4"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목 검색" className="min-w-[220px] flex-1 rounded-xl border border-[#DDE5E1] px-4 py-2.5 text-sm" /><select value={sort} onChange={(event) => setSort(event.target.value as 'latest' | 'views')} className="rounded-xl border border-[#DDE5E1] px-4 py-2.5 text-sm"><option value="latest">최신 수정순</option><option value="views">조회수순</option></select></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#F7F9F8] text-xs text-slate-500"><tr><th className="px-5 py-4">제목</th><th className="px-5 py-4">카테고리</th><th className="px-5 py-4">상태</th><th className="px-5 py-4 text-right">조회수</th><th className="px-5 py-4">수정일</th><th className="px-5 py-4 text-right">관리</th></tr></thead><tbody className="divide-y divide-[#EDF1EF]">{list.map((post) => <tr key={post.id} className="hover:bg-[#FAFBFA]"><td className="max-w-[380px] px-5 py-4 font-bold"><span className="line-clamp-1">{post.title}</span></td><td className="px-5 py-4 text-slate-500">{categories.find((category) => category.id === post.categoryId)?.name}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{post.status === 'published' ? '발행' : '임시저장'}</span></td><td className="px-5 py-4 text-right">{post.views.toLocaleString()}</td><td className="px-5 py-4 text-slate-500">{new Date(post.updatedAt).toLocaleDateString('ko-KR')}</td><td className="px-5 py-4 text-right"><Link href={`/admin/content/${post.id}`} className="mr-2 rounded-lg bg-[#EFF7F2] px-3 py-2 text-xs font-bold text-[#17794A]">수정</Link><button type="button" onClick={() => remove(post.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">삭제</button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
