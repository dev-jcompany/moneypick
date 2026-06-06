'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { tags } from '@/src/data/tags';

export default function Hero() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="bg-white dark:bg-navy-850 py-14 md:py-20 border-b border-[#E8ECEF] dark:border-navy-700">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Left */}
          <div className="flex-1 min-w-0">
            {/* Eyebrow */}
            <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#21A05A] bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#21A05A] animate-pulse" aria-hidden="true" />
              금융정보 플랫폼
            </p>

            <h1 className="text-[32px] md:text-[42px] font-extrabold leading-tight tracking-tight mb-4">
              <span className="text-[#1A1D1F] dark:text-white">돈이 모이는 선택,</span>
              <br />
              <span className="text-[#21A05A]">머니픽</span>
            </h1>

            <p className="text-[15px] md:text-[16px] text-[#5B6168] dark:text-slate-400 leading-relaxed mb-7 max-w-md">
              대출, 부동산, 세금, 투자까지<br />
              꼭 필요한 금융정보를 쉽고 정확하게 제공합니다.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-5">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="찾고 싶은 금융정보를 검색하세요&#10;예) 전세대출, ISA, DSR, 실업급여"
                aria-label="금융정보 검색"
                className="flex-1 min-w-0 px-4 py-3.5 rounded-xl border border-[#E0E6EE] dark:border-navy-600 bg-[#F6F8FA] dark:bg-navy-800 text-sm text-[#1A1D1F] dark:text-slate-100 placeholder-[#8A949E] dark:placeholder-slate-500 focus:outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 transition"
              />
              <button
                type="submit"
                className="shrink-0 px-6 py-3.5 bg-[#21A05A] hover:bg-[#17794A] text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                검색
              </button>
            </form>

            {/* Tag chips */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/태그/${tag.slug}`}
                  className="px-3 py-1.5 rounded-full bg-[#F0F4F8] dark:bg-navy-800 border border-[#DDE3EB] dark:border-navy-600 text-[12px] font-medium text-[#5B6168] dark:text-slate-400 hover:border-[#21A05A] hover:text-[#21A05A] dark:hover:text-[#21A05A] transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="shrink-0 w-60 h-60 md:w-72 md:h-72 hidden md:flex items-center justify-center">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* BG */}
      <circle cx="140" cy="140" r="130" fill="#F0FDF4" className="dark:hidden" />
      <circle cx="140" cy="140" r="130" fill="#081020" className="hidden dark:block" />

      {/* Grid lines */}
      <line x1="50" y1="220" x2="230" y2="220" stroke="#21A05A" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="50" y1="180" x2="230" y2="180" stroke="#21A05A" strokeOpacity="0.1" strokeWidth="1" />
      <line x1="50" y1="140" x2="230" y2="140" stroke="#21A05A" strokeOpacity="0.1" strokeWidth="1" />
      <line x1="50" y1="100" x2="230" y2="100" stroke="#21A05A" strokeOpacity="0.1" strokeWidth="1" />

      {/* Bars */}
      <rect x="62" y="160" width="26" height="60" rx="5" fill="#21A05A" opacity="0.25" />
      <rect x="96" y="130" width="26" height="90" rx="5" fill="#21A05A" opacity="0.5" />
      <rect x="130" y="100" width="26" height="120" rx="5" fill="#21A05A" opacity="0.75" />
      <rect x="164" y="78" width="26" height="142" rx="5" fill="#21A05A" />

      {/* Trend line */}
      <polyline
        points="75,155 109,125 143,95 177,73"
        stroke="#34C973"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="75" cy="155" r="4" fill="#34C973" />
      <circle cx="109" cy="125" r="4" fill="#34C973" />
      <circle cx="143" cy="95" r="4" fill="#34C973" />
      <circle cx="177" cy="73" r="4" fill="#34C973" />

      {/* Coin badge */}
      <circle cx="215" cy="96" r="24" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <text x="215" y="104" textAnchor="middle" fontSize="20" fill="#CA8A04" fontWeight="bold">₩</text>

      {/* House */}
      <polygon points="52,98 79,70 106,98" fill="#BFDBFE" opacity="0.8" />
      <rect x="61" y="98" width="36" height="27" rx="2" fill="#93C5FD" opacity="0.8" />
      <rect x="72" y="109" width="14" height="16" rx="2" fill="#1D4ED8" opacity="0.9" />

      {/* DSR badge */}
      <rect x="182" y="174" width="56" height="28" rx="10" fill="#DCFCE7" />
      <text x="210" y="193" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#16A34A">DSR</text>

      {/* Up arrow */}
      <circle cx="80" cy="68" r="14" fill="#21A05A" opacity="0.15" />
      <path d="M75 72 L80 64 L85 72" stroke="#21A05A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
