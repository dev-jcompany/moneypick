import type { Metadata } from 'next';

export const metadata: Metadata = { title: '연락처 · 광고문의' };

export default function ContactPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white mb-4">연락처 · 광고문의</h1>
      <p className="text-[#5B6168] dark:text-slate-400 mb-8">
        광고, 제휴, 기사 제보 등 문의 사항은 이메일로 연락해 주세요.
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-[#F6F8F9] dark:bg-slate-800 border border-[#E8ECEF] dark:border-slate-700 text-[#5B6168] dark:text-slate-400 text-sm">
        연락처 양식을 준비 중입니다. 🚧
      </div>
    </div>
  );
}
