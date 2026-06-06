'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="bg-white dark:bg-navy-900 border-b border-[#E8ECEF] dark:border-navy-700 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="머니픽 홈">
          <MoneyPickLogo />
        </Link>

        {/* Center: Search */}
        <form onSubmit={handleSearch} className="hidden md:block w-full">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="찾고 싶은 금융정보를 검색하세요 (예: 전세대출, DSR, ISA)"
              aria-label="금융정보 검색"
              className="w-full pl-4 pr-11 py-2.5 rounded-full border border-[#E0E6EE] dark:border-navy-600 bg-[#F6F8FA] dark:bg-navy-800 text-sm text-[#1A1D1F] dark:text-slate-100 placeholder-[#8A949E] dark:placeholder-slate-500 focus:outline-none focus:border-[#21A05A] focus:ring-1 focus:ring-[#21A05A] transition"
            />
            <button
              type="submit"
              aria-label="검색"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A949E] hover:text-[#21A05A] transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        {/* Right: Navigation links + toggle */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Link
            href="/calculators"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A] dark:hover:text-[#21A05A] rounded-lg hover:bg-[#F6F8FA] dark:hover:bg-navy-800 transition whitespace-nowrap"
          >
            <CalcIcon />
            계산기
          </Link>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A] dark:hover:text-[#21A05A] rounded-lg hover:bg-[#F6F8FA] dark:hover:bg-navy-800 transition whitespace-nowrap"
          >
            <NewsIcon />
            금융뉴스
          </Link>
          <Link
            href="/contact"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A] dark:hover:text-[#21A05A] rounded-lg hover:bg-[#F6F8FA] dark:hover:bg-navy-800 transition whitespace-nowrap"
          >
            고객센터
          </Link>

          {/* Divider */}
          <span className="hidden sm:block w-px h-4 bg-[#E0E6EE] dark:bg-navy-600 mx-1" aria-hidden="true" />

          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-[#F6F8FA] dark:hover:bg-navy-800 transition-colors"
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-[#F6F8FA] dark:hover:bg-navy-800 transition-colors sm:hidden"
            aria-label="메뉴"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile expanded */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#E8ECEF] dark:border-navy-700 bg-white dark:bg-navy-900 px-4 py-3 flex flex-col gap-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="금융정보를 검색하세요"
                aria-label="검색"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#E0E6EE] dark:border-navy-600 bg-[#F6F8FA] dark:bg-navy-800 text-sm text-[#1A1D1F] dark:text-slate-100 focus:outline-none focus:border-[#21A05A]"
              />
              <button type="submit" aria-label="검색" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A949E]">
                <SearchIcon />
              </button>
            </div>
          </form>
          <nav className="flex gap-4" aria-label="모바일 메뉴">
            <Link href="/calculators" className="text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A]">계산기</Link>
            <Link href="/news" className="text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A]">금융뉴스</Link>
            <Link href="/contact" className="text-[13px] font-medium text-[#5B6168] dark:text-slate-300 hover:text-[#21A05A]">고객센터</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function MoneyPickLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#21A05A] flex items-center justify-center shrink-0">
        <span className="text-white text-[15px] font-extrabold leading-none">M</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[18px] font-extrabold text-[#1A1D1F] dark:text-white tracking-tight">
          머니픽
        </span>
        <span className="text-[10px] text-[#21A05A] font-semibold tracking-wider leading-none mt-0.5">
          MoneyPick
        </span>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}
function CalcIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h2M12 10h2M16 10h.01M8 14h2M12 14h2M16 14h.01M8 18h2M12 18h2M16 18h.01" />
    </svg>
  );
}
function NewsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
