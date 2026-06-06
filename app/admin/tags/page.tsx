'use client';

import { useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';

export default function TagsPage() {
  const { tags, setTags, posts } = useAdmin();
  const [name, setName] = useState('');

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.name === trimmed)) return window.alert('이미 존재하는 태그입니다.');
    setTags((current) => [...current, { id: crypto.randomUUID(), name: trimmed, slug: trimmed.replace(/\s+/g, '-').toLowerCase(), postCount: 0 }]);
    setName('');
  };

  const remove = (id: string) => {
    if (window.confirm('이 태그를 삭제할까요?')) setTags((current) => current.filter((t) => t.id !== id));
  };

  const totalUsed = posts.filter((p) => p.tagIds && p.tagIds.length > 0).length;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">태그 관리</h2>
        <p className="mt-1 text-sm text-slate-500">콘텐츠 분류와 검색에 사용되는 태그를 관리합니다.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">전체 태그</p><strong className="mt-2 block text-3xl">{tags.length}</strong></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">태그 사용 콘텐츠</p><strong className="mt-2 block text-3xl">{totalUsed}</strong></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">미사용 태그</p><strong className="mt-2 block text-3xl text-slate-400">{tags.filter((t) => t.postCount === 0).length}</strong></div>
      </div>

      <section className="mb-6 rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-extrabold">새 태그 추가</h3>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="예: 청약, 금리인상, ETF"
            className="flex-1 rounded-xl border border-[#DDE5E1] px-4 py-3 outline-none focus:border-[#21A05A]"
          />
          <button type="button" onClick={add} className="rounded-xl bg-[#21A05A] px-6 py-3 font-bold text-white hover:bg-[#17794A]">추가</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F7F9F8] text-xs text-slate-500">
            <tr>
              <th className="px-5 py-4">태그명</th>
              <th className="px-5 py-4">슬러그</th>
              <th className="px-5 py-4 text-right">사용 콘텐츠</th>
              <th className="px-5 py-4 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDF1EF]">
            {tags.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">등록된 태그가 없습니다.</td></tr>
            )}
            {tags.map((tag) => (
              <tr key={tag.id} className="hover:bg-[#FAFBFA]">
                <td className="px-5 py-4">
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold text-[#17794A]"># {tag.name}</span>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{tag.slug}</td>
                <td className="px-5 py-4 text-right font-semibold">{tag.postCount}개</td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => remove(tag.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
