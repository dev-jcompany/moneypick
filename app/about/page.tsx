import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '머니픽 소개',
  description: '머니픽은 대출, 부동산, 세금, 직장인 금융, 투자 기초 정보를 쉽게 정리하는 금융정보 플랫폼입니다.',
};

const principles = [
  '어려운 금융 용어를 생활 언어로 풀어 설명합니다.',
  '신청 전 확인해야 할 조건, 서류, 절차를 먼저 정리합니다.',
  '정책과 제도는 변경될 수 있음을 전제로 최신 확인 경로를 함께 안내합니다.',
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-14 md:py-18">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#21A05A]">About MoneyPick</p>
      <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">
        금융정보를 읽기 쉽게 정리하는 머니픽입니다
      </h1>
      <p className="max-w-3xl text-[16px] leading-8 text-[#5B6168] dark:text-slate-300">
        머니픽(MoneyPick)은 대출, 부동산, 세금, 직장인 금융, 투자 기초처럼 일상에서 자주 마주치는
        금융 정보를 이해하기 쉬운 문장과 단계별 체크리스트로 정리하는 정보 플랫폼입니다.
      </p>

      <section className="mt-10 border-t border-[#E8ECEF] pt-8 dark:border-navy-700">
        <h2 className="mb-4 text-xl font-extrabold text-[#1A1D1F] dark:text-white">우리가 집중하는 것</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <div key={item} className="rounded-2xl border border-[#E8ECEF] bg-white p-5 dark:border-navy-700 dark:bg-navy-900">
              <p className="text-[14px] leading-7 text-[#4A5560] dark:text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-4 border-t border-[#E8ECEF] pt-8 text-[15px] leading-8 text-[#5B6168] dark:border-navy-700 dark:text-slate-300">
        <h2 className="text-xl font-extrabold text-[#1A1D1F] dark:text-white">운영 방향</h2>
        <p>
          머니픽은 특정 금융상품 가입을 강요하거나 개별 상황에 대한 확정적인 판단을 제공하지 않습니다.
          대신 사용자가 스스로 조건을 비교하고, 필요한 질문을 정리한 뒤, 공식 기관 또는 전문가 상담으로
          이어갈 수 있도록 돕는 것을 목표로 합니다.
        </p>
        <p>
          모든 콘텐츠는 일반 정보 제공을 목적으로 하며, 실제 대출 가능 여부, 세금 부담, 투자 판단은 개인의
          소득, 자산, 신용, 계약 조건, 법령 변경에 따라 달라질 수 있습니다.
        </p>
      </section>
    </main>
  );
}
