'use client';

import { useState } from 'react';
import Link from 'next/link';
import { tags } from '@/src/data/tags';
import { notices } from '@/src/data/notices';

function formatNoticeDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

export default function BottomSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    alert('구독 서비스는 준비 중입니다. 곧 찾아뵙겠습니다!');
  };

  return (
    <section className="py-10 bg-white dark:bg-navy-850 border-t border-[#E8ECEF] dark:border-navy-700">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Newsletter */}
          <div className="bg-[#F6F8FA] dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 p-5">
            <h2 className="text-[15px] font-bold text-[#1A1D1F] dark:text-white mb-1.5">
              📬 뉴스레터 구독
            </h2>
            <p className="text-[12px] text-[#5B6168] dark:text-slate-400 mb-4 leading-relaxed">
              매주 꼭 알아야 할 금융·부동산 소식을 이메일로 받아보세요.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                aria-label="이메일 주소"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#DDE3EB] dark:border-navy-600 bg-white dark:bg-navy-900 text-[13px] text-[#1A1D1F] dark:text-white placeholder-[#8A949E] dark:placeholder-slate-500 focus:outline-none focus:border-[#21A05A] transition"
              />
              <button
                type="button"
                onClick={handleSubscribe}
                className="w-full py-2.5 bg-[#21A05A] hover:bg-[#17794A] text-white text-[13px] font-bold rounded-lg transition-colors"
              >
                구독하기
              </button>
            </div>
            <p className="text-[11px] text-[#8A949E] dark:text-slate-600 mt-2">
              ※ 구독 서비스는 준비 중입니다.
            </p>
          </div>

          {/* Notices */}
          <div className="bg-[#F6F8FA] dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 p-5">
            <h2 className="text-[15px] font-bold text-[#1A1D1F] dark:text-white mb-4">공지사항</h2>
            <ul className="space-y-3">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <Link href={notice.href} className="flex items-center justify-between gap-3 group">
                    <span className="text-[13px] text-[#1A1D1F] dark:text-slate-200 group-hover:text-[#21A05A] line-clamp-1 flex-1 transition-colors">
                      {notice.title}
                    </span>
                    <span className="text-[11px] text-[#8A949E] dark:text-slate-600 shrink-0">
                      {formatNoticeDate(notice.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Tags */}
          <div className="bg-[#F6F8FA] dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 p-5">
            <h2 className="text-[15px] font-bold text-[#1A1D1F] dark:text-white mb-4">인기 태그</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/태그/${tag.slug}`}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-navy-900 border border-[#DDE3EB] dark:border-navy-600 text-[12px] font-medium text-[#5B6168] dark:text-slate-400 hover:border-[#21A05A] hover:text-[#21A05A] dark:hover:text-[#21A05A] transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
