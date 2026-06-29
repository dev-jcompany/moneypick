'use client';

import { usePathname } from 'next/navigation';
import { adminPath, toPublicAdminPath } from '@/lib/admin-path';

const titleMap: Record<string, string> = {
  [adminPath()]: '운영 대시보드',
  [adminPath('/articles')]: '글 목록',
  [adminPath('/articles/new')]: '새 글 작성',
  [adminPath('/categories')]: '카테고리 설정',
  [adminPath('/subscribers')]: '뉴스레터 신청자 관리',
  [adminPath('/notices')]: '공지사항 목록',
  [adminPath('/notices/new')]: '공지사항 등록',
  [adminPath('/calculators')]: '계산기 변수 설정',
  [adminPath('/users')]: '운영자 계정 관리',
};

export default function AdminHeader() {
  const pathname = toPublicAdminPath(usePathname());
  const title = pathname.startsWith(adminPath('/articles/')) && pathname !== adminPath('/articles/new') ? '글 수정' : pathname.startsWith(adminPath('/notices/')) && pathname !== adminPath('/notices/new') ? '공지사항 수정' : titleMap[pathname] ?? '머니픽 관리자';
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#E4EAE7] bg-white/95 px-5 pl-20 backdrop-blur lg:px-8">
      <div><p className="text-xs font-bold text-[#21A05A]">MONEYPICK ADMIN</p><h1 className="text-xl font-extrabold text-[#17211D]">{title}</h1></div>
      <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><strong className="block text-sm">머니픽 관리자</strong><span className="text-xs text-slate-500">최고 관리자</span></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-bold text-[#17794A]">관</span></div>
    </header>
  );
}
