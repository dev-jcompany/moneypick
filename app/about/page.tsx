import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소개',
  description: '머니픽 소개 — 금융정보 플랫폼 머니픽을 만든 이유',
};

export default function AboutPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white mb-4">머니픽 소개</h1>
      <p className="text-[#5B6168] dark:text-slate-400 leading-relaxed mb-8">
        머니픽(MoneyPick)은 복잡한 금융·부동산 정보를 누구나 쉽게 이해할 수 있도록 도와주는
        금융정보 플랫폼입니다. 대출, 세금, 부동산, 투자 등 실생활에 꼭 필요한 정보를
        정확하고 쉬운 언어로 제공합니다.
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-[#F6F8FA] dark:bg-navy-800 border border-[#E8ECEF] dark:border-navy-700 text-[#5B6168] dark:text-slate-400 text-sm">
        상세 내용을 준비 중입니다. 곧 찾아뵙겠습니다! 🚧
      </div>
    </div>
  );
}
