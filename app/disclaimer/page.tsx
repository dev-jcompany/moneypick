import type { Metadata } from 'next';

export const metadata: Metadata = { title: '면책조항' };

export default function DisclaimerPage() {
  return (
    <div className="max-w-[720px] mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1A1D1F] dark:text-white mb-4">면책조항</h1>
      <p className="text-[#5B6168] dark:text-slate-400 leading-relaxed mb-8">
        본 사이트의 모든 정보는 일반적인 참고 목적으로만 제공됩니다.
        금융·세금·법률 관련 중요한 결정은 반드시 자격을 갖춘 전문가와 상담하시기 바랍니다.
        돈연구소는 본 사이트 정보를 바탕으로 한 결정에 대해 어떠한 책임도 지지 않습니다.
      </p>
      <div className="inline-block px-6 py-3 rounded-xl bg-[#F6F8F9] dark:bg-slate-800 border border-[#E8ECEF] dark:border-slate-700 text-[#5B6168] dark:text-slate-400 text-sm">
        상세 면책조항을 준비 중입니다. 🚧
      </div>
    </div>
  );
}
