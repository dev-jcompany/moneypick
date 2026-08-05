import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: '머니픽 서비스 이용 조건, 콘텐츠 이용 범위, 이용자 책임 및 제한 사항 안내입니다.',
};

const terms = [
  {
    title: '서비스의 성격',
    body: '머니픽은 금융, 부동산, 세금, 생활경제 관련 정보를 정리해 제공하는 콘텐츠 서비스입니다. 개별 이용자에게 맞춘 금융상품 추천, 세무·법률 자문, 투자 권유를 제공하지 않습니다.',
  },
  {
    title: '콘텐츠 이용',
    body: '사이트의 콘텐츠는 개인적인 참고 목적으로 이용할 수 있습니다. 무단 복제, 재배포, 크롤링, 상업적 재가공은 사전 허락 없이 제한됩니다.',
  },
  {
    title: '이용자의 책임',
    body: '이용자는 콘텐츠를 참고한 뒤 실제 신청, 계약, 신고, 투자 판단을 하기 전에 공식 기관, 금융회사, 전문가를 통해 본인 상황에 맞는 최신 정보를 확인해야 합니다.',
  },
  {
    title: '서비스 변경',
    body: '머니픽은 콘텐츠, 기능, 운영 정책을 필요에 따라 변경하거나 중단할 수 있습니다. 중요한 변경 사항은 사이트 내 공지 또는 관련 페이지를 통해 안내합니다.',
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-14 md:py-18">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#21A05A]">Terms of Use</p>
      <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">
        이용약관
      </h1>
      <p className="max-w-3xl text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">
        본 약관은 머니픽 웹사이트 이용과 관련해 사이트와 이용자 사이의 기본적인 권리, 의무, 책임 사항을 정합니다.
      </p>

      <div className="mt-10 space-y-5">
        {terms.map((term) => (
          <section key={term.title} className="border-t border-[#E8ECEF] pt-5 dark:border-navy-700">
            <h2 className="mb-2 text-lg font-extrabold text-[#1A1D1F] dark:text-white">{term.title}</h2>
            <p className="text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">{term.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-[13px] leading-7 text-[#8A949E] dark:text-slate-500">
        본 약관은 2026년 7월 20일부터 적용됩니다. 문의는 문의 페이지의 접수폼으로 보내주세요.
      </p>
    </main>
  );
}
