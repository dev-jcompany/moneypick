import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '금융뉴스',
  description: '머니픽이 엄선한 금융·부동산·경제 뉴스를 확인하세요.',
};

export default function NewsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white mb-3">금융뉴스</h1>
      <p className="text-[#5B6168] dark:text-slate-400 mb-8">
        금융·부동산·경제 관련 최신 뉴스를 머니픽이 엄선해 제공합니다.
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-[#F6F8FA] dark:bg-navy-800 border border-[#E8ECEF] dark:border-navy-700 text-[#5B6168] dark:text-slate-400 text-sm">
        금융뉴스 서비스를 준비 중입니다. 곧 찾아뵙겠습니다! 🚧
      </div>
    </div>
  );
}
