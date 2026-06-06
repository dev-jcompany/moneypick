import type { Metadata } from 'next';

export const metadata: Metadata = { title: '개인정보처리방침' };

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white mb-8">개인정보처리방침</h1>
      <div className="inline-block px-6 py-3 rounded-xl bg-[#F6F8F9] dark:bg-slate-800 border border-[#E8ECEF] dark:border-slate-700 text-[#5B6168] dark:text-slate-400 text-sm">
        개인정보처리방침을 준비 중입니다. 🚧
      </div>
    </div>
  );
}
