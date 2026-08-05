import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '면책조항',
  description: '머니픽 콘텐츠의 정보 제공 목적, 정확성 한계, 금융·세무·법률 판단 책임 안내입니다.',
};

const notices = [
  {
    title: '일반 정보 제공',
    body: '머니픽의 모든 콘텐츠는 일반적인 정보 제공을 목적으로 합니다. 특정 금융상품 가입, 투자, 세무 신고, 법률 행위를 권유하거나 보장하지 않습니다.',
  },
  {
    title: '최신성의 한계',
    body: '금리, 정책, 세법, 대출 조건, 지원 제도는 수시로 변경될 수 있습니다. 실제 신청 또는 의사결정 전에는 반드시 공식 기관과 금융회사 공지를 확인해야 합니다.',
  },
  {
    title: '개별 판단 책임',
    body: '콘텐츠를 참고해 내린 결정의 결과는 이용자 본인에게 있습니다. 개인 상황에 따른 중요한 결정은 금융기관, 세무사, 변호사 등 전문가 상담을 권장합니다.',
  },
  {
    title: '외부 링크',
    body: '사이트 내 외부 링크는 편의를 위해 제공될 수 있으며, 외부 사이트의 정보 정확성, 보안, 개인정보 처리에 대해 머니픽이 책임지지 않습니다.',
  },
];

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-14 md:py-18">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#21A05A]">Disclaimer</p>
      <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">
        면책조항
      </h1>
      <p className="max-w-3xl text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">
        머니픽은 독자가 금융 정보를 더 쉽게 이해하도록 돕기 위해 콘텐츠를 제공합니다.
        다만 콘텐츠는 개인별 상황을 모두 반영한 전문 자문이 아니므로 아래 내용을 확인해 주세요.
      </p>

      <div className="mt-10 space-y-5">
        {notices.map((notice) => (
          <section key={notice.title} className="border-t border-[#E8ECEF] pt-5 dark:border-navy-700">
            <h2 className="mb-2 text-lg font-extrabold text-[#1A1D1F] dark:text-white">{notice.title}</h2>
            <p className="text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">{notice.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-[13px] leading-7 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">
        대출, 세금, 투자와 관련된 최종 판단은 반드시 본인의 최신 자료와 공식 기준을 바탕으로 확인해 주세요.
      </section>
    </main>
  );
}
