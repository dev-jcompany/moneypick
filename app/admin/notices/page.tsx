'use client';

import Link from 'next/link';
import { useAdmin } from '@/components/admin/AdminStore';
import { adminPath } from '@/lib/admin-path';

export default function NoticesPage() {
  const { notices, setNotices } = useAdmin();
  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold">공지사항 목록</h2><p className="mt-1 text-sm text-slate-500">공지를 수정하거나 공개 여부를 변경하세요.</p></div><Link href={adminPath('/notices/new')} className="rounded-xl bg-[#21A05A] px-5 py-3 text-sm font-bold text-white">+ 공지 등록</Link></div>
      <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm"><div className="divide-y divide-[#EDF1EF]">{[...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((notice) => <div key={notice.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><div className="flex-1"><div className="mb-2 flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${notice.visible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{notice.visible ? '공개' : '숨김'}</span><time className="text-xs text-slate-400">{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</time></div><h3 className="font-bold">{notice.title}</h3></div><div className="flex gap-2"><button type="button" onClick={() => setNotices((current) => current.map((item) => item.id === notice.id ? { ...item, visible: !item.visible } : item))} className="rounded-lg bg-[#F1F5F3] px-3 py-2 text-xs font-bold">{notice.visible ? '숨기기' : '공개하기'}</button><Link href={adminPath(`/notices/${notice.id}`)} className="rounded-lg bg-[#EFF7F2] px-3 py-2 text-xs font-bold text-[#17794A]">수정</Link><button type="button" onClick={() => window.confirm('공지를 삭제할까요?') && setNotices((current) => current.filter((item) => item.id !== notice.id))} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">삭제</button></div></div>)}</div></section>
    </div>
  );
}
