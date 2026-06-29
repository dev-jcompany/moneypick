'use client';

import Link from 'next/link';
import { useAdmin } from '@/components/admin/AdminStore';
import { adminPath } from '@/lib/admin-path';

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
        <section className="rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-extrabold">콘텐츠 작성 경로</h3>
            <Link href={adminPath('/articles')} className="text-sm font-bold text-[#21A05A]">글 목록 →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href={adminPath('/articles/new')} className="rounded-2xl bg-[#EFF7F2] p-5 font-bold text-[#17794A] hover:bg-[#E1F1E8]">새 글 작성</Link>
            <Link href={adminPath('/articles')} className="rounded-2xl bg-[#F6F8FA] p-5 font-bold text-[#17211D] hover:bg-[#EEF2F0]">글 목록 관리</Link>
            <Link href={adminPath('/categories')} className="rounded-2xl bg-[#F6F8FA] p-5 font-bold text-[#17211D] hover:bg-[#EEF2F0]">카테고리 관리</Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-500">글 작성은 아티클 관리 화면으로 통합되었습니다. 예전 콘텐츠 작성 화면으로 접근해도 새 글 작성 화면으로 이동합니다.</p>
        </section>
        <section className="rounded-3xl bg-[#10231B] p-6 text-white shadow-sm"><h3 className="mb-2 text-lg font-extrabold">빠른 작업</h3><p className="mb-6 text-sm text-slate-400">자주 쓰는 메뉴로 바로 이동하세요.</p><div className="space-y-3"><Link href={adminPath('/articles/new')} className="block rounded-2xl bg-[#21A05A] p-4 font-bold">✎ 새 글 작성</Link><Link href={adminPath('/subscribers')} className="block rounded-2xl bg-white/10 p-4 font-bold hover:bg-white/15">✉ 구독자 명단 확인</Link><Link href={adminPath('/notices/new')} className="block rounded-2xl bg-white/10 p-4 font-bold hover:bg-white/15">● 공지사항 등록</Link></div></section>
      </div>
    </div>
  );
}
