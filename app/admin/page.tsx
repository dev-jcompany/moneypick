'use client';

import Link from 'next/link';
import { useAdmin } from '@/components/admin/AdminStore';

export default function AdminDashboard() {
  const { posts, subscribers, notices, users } = useAdmin();
  const cards = [
    { label: '발행 콘텐츠', value: posts.filter((post) => post.status === 'published').length, detail: `임시저장 ${posts.filter((post) => post.status === 'draft').length}개`, color: 'bg-emerald-500' },
    { label: '뉴스레터 구독자', value: subscribers.filter((item) => item.status === 'active').length, detail: '활성 구독자', color: 'bg-blue-500' },
    { label: '공개 공지', value: notices.filter((notice) => notice.visible).length, detail: `전체 ${notices.length}개`, color: 'bg-amber-500' },
    { label: '운영자 계정', value: users.length, detail: '관리 권한 보유', color: 'bg-violet-500' },
  ];
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8"><h2 className="text-2xl font-extrabold">안녕하세요, 관리자님.</h2><p className="mt-1 text-sm text-slate-500">머니픽의 오늘 운영 현황을 한눈에 확인하세요.</p></div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm"><span className={`mb-4 block h-2 w-10 rounded-full ${card.color}`} /><p className="text-sm font-bold text-slate-500">{card.label}</p><strong className="my-2 block text-3xl">{card.value.toLocaleString()}</strong><span className="text-xs text-slate-400">{card.detail}</span></div>)}</div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-extrabold">최근 수정 콘텐츠</h3><Link href="/admin/content" className="text-sm font-bold text-[#21A05A]">전체 보기 →</Link></div><div className="divide-y divide-[#EDF1EF]">{[...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map((post) => <Link key={post.id} href={`/admin/content/${post.id}`} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-bold">{post.title}</p><span className="text-xs text-slate-400">{new Date(post.updatedAt).toLocaleDateString('ko-KR')}</span></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{post.status === 'published' ? '발행' : '임시저장'}</span></Link>)}</div></section>
        <section className="rounded-3xl bg-[#10231B] p-6 text-white shadow-sm"><h3 className="mb-2 text-lg font-extrabold">빠른 작업</h3><p className="mb-6 text-sm text-slate-400">자주 쓰는 메뉴로 바로 이동하세요.</p><div className="space-y-3"><Link href="/admin/content/new" className="block rounded-2xl bg-[#21A05A] p-4 font-bold">✎ 새 콘텐츠 작성</Link><Link href="/admin/subscribers" className="block rounded-2xl bg-white/10 p-4 font-bold hover:bg-white/15">✉ 구독자 명단 확인</Link><Link href="/admin/notices/new" className="block rounded-2xl bg-white/10 p-4 font-bold hover:bg-white/15">● 공지사항 등록</Link></div></section>
      </div>
    </div>
  );
}
