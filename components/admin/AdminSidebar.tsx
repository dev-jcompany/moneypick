'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { adminPath, toPublicAdminPath } from '@/lib/admin-path';

const groups = [
  {
    label: '콘텐츠 관리',
    icon: '✍️',
    items: [
      { href: adminPath('/articles/new'), label: '새 글 작성' },
      { href: adminPath('/articles'), label: '글 목록', matchPrefix: true },
      { href: adminPath('/categories'), label: '카테고리 관리' },
      { href: adminPath('/tags'), label: '태그 관리' },
    ],
  },
  {
    label: '계산기 관리',
    icon: '🧮',
    items: [
      { href: adminPath('/calculators'), label: '계산기 순서/변수 설정' },
    ],
  },
  {
    label: '공지사항',
    icon: '📢',
    items: [
      { href: adminPath('/notices/new'), label: '새 공지 등록' },
      { href: adminPath('/notices'), label: '공지 목록', matchPrefix: true },
    ],
  },
  {
    label: '뉴스레터',
    icon: '✉️',
    items: [
      { href: adminPath('/subscribers'), label: '구독자 목록' },
      { href: adminPath('/newsletter'), label: '발송 관리' },
    ],
  },
  {
    label: '미디어',
    icon: '🖼️',
    items: [
      { href: adminPath('/media'), label: '이미지 라이브러리' },
    ],
  },
  {
    label: '설정',
    icon: '⚙️',
    items: [
      { href: adminPath('/settings'), label: '사이트 기본정보' },
      { href: adminPath('/users'), label: '운영자 계정' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = toPublicAdminPath(usePathname());
  const [open, setOpen] = useState(false);

  const isActive = (href: string, matchPrefix?: boolean) => {
    if (pathname === href) return true;
    if (matchPrefix && pathname.startsWith(href + '/') && pathname !== adminPath('/notices/new') && pathname !== adminPath('/articles/new')) return true;
    return false;
  };

  const sidebar = (
    <aside className="flex h-full w-[260px] flex-col bg-[#10231B] text-white">
      <Link href={adminPath()} className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#21A05A] font-black text-lg">M</span>
        <span>
          <strong className="block text-lg">머니픽</strong>
          <small className="text-green-300/70">ADMIN CONSOLE</small>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link href={adminPath()} onClick={() => setOpen(false)} className={`mb-4 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition ${pathname === adminPath() ? 'bg-[#21A05A] text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
          <span>📊</span> 대시보드
        </Link>

        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>{group.icon}</span>{group.label}
            </p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`mb-0.5 block rounded-xl px-4 py-2.5 text-sm transition ${ isActive(item.href, (item as { matchPrefix?: boolean }).matchPrefix) ? 'bg-[#21A05A] font-bold text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link href="/" className="block rounded-xl border border-white/10 px-4 py-3 text-center text-xs text-slate-300 hover:bg-white/10">
          사이트로 돌아가기 ↗
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl bg-[#10231B] p-3 text-white shadow-lg lg:hidden" aria-label="관리자 메뉴 열기">☰</button>
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button type="button" aria-label="메뉴 닫기" className="flex-1 bg-black/45" onClick={() => setOpen(false)} />
          <div className="h-full">{sidebar}</div>
        </div>
      )}
    </>
  );
}
