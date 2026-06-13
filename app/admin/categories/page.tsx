'use client';

import { useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';

export default function CategoriesPage() {
  const { categories, setCategories } = useAdmin();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📚');
  const add = () => {
    if (!name.trim()) return;
    setCategories((current) => [...current, { id: crypto.randomUUID(), name: name.trim(), slug: name.trim().replace(/\s+/g, '-'), enSlug: name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'), icon, description: `${name.trim()}의 실용 정보를 제공합니다.`, color: 'green' }]);
    setName('');
  };
  return (
    <div className="mx-auto max-w-[950px]">
      <div className="mb-6"><h2 className="text-2xl font-extrabold">카테고리 설정</h2><p className="mt-1 text-sm text-slate-500">연구소 이름과 설명을 바꾸거나 새 연구소를 추가하세요.</p></div>
      <section className="mb-6 rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm"><h3 className="mb-4 font-extrabold">새 연구소 추가</h3><div className="flex flex-col gap-3 sm:flex-row"><input value={icon} onChange={(event) => setIcon(event.target.value)} className="w-full rounded-xl border border-[#DDE5E1] px-4 py-3 text-center sm:w-20" aria-label="카테고리 아이콘" /><input value={name} onChange={(event) => setName(event.target.value)} placeholder="예: 보험연구소" className="flex-1 rounded-xl border border-[#DDE5E1] px-4 py-3" /><button type="button" onClick={add} className="rounded-xl bg-[#21A05A] px-5 py-3 font-bold text-white">추가</button></div></section>
      <section className="space-y-3">{categories.map((category) => <div key={category.id} className="grid gap-3 rounded-2xl border border-[#E0E7E3] bg-white p-4 shadow-sm md:grid-cols-[60px_220px_1fr_auto]"><input value={category.icon} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, icon: event.target.value } : item))} className="rounded-xl border border-[#DDE5E1] px-3 text-center" /><input value={category.name} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, name: event.target.value } : item))} className="rounded-xl border border-[#DDE5E1] px-3 py-2 font-bold" /><input value={category.description} onChange={(event) => setCategories((current) => current.map((item) => item.id === category.id ? { ...item, description: event.target.value } : item))} className="rounded-xl border border-[#DDE5E1] px-3 py-2 text-sm" /><button type="button" onClick={() => window.confirm('이 카테고리를 삭제할까요?') && setCategories((current) => current.filter((item) => item.id !== category.id))} className="rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600">삭제</button></div>)}</section>
    </div>
  );
}
