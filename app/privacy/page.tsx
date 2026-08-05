import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '머니픽 개인정보 수집, 이용, 보관, 파기 및 이용자 권리 안내입니다.',
};

const sections = [
  {
    title: '수집하는 개인정보',
    body: '머니픽은 회원가입 없이 콘텐츠를 열람할 수 있습니다. 문의 또는 구독 신청처럼 이용자가 직접 입력하는 경우 이메일 주소, 문의 내용, 회신을 위한 연락 정보를 수집할 수 있습니다.',
  },
  {
    title: '이용 목적',
    body: '수집한 정보는 문의 응대, 오류 정정, 광고 및 제휴 제안 검토, 서비스 품질 개선, 법령상 의무 이행을 위해 사용합니다.',
  },
  {
    title: '보관 및 파기',
    body: '개인정보는 수집 목적이 달성되면 지체 없이 파기합니다. 다만 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 안전하게 보관합니다.',
  },
  {
    title: '제3자 제공',
    body: '머니픽은 이용자의 동의 없이 개인정보를 외부에 판매하거나 제공하지 않습니다. 법령에 따른 요청이 있는 경우에는 예외가 있을 수 있습니다.',
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-14 md:py-18">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#21A05A]">Privacy Policy</p>
      <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">
        개인정보처리방침
      </h1>
      <p className="max-w-3xl text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">
        머니픽은 이용자의 개인정보를 필요한 범위에서만 수집하고, 수집 목적에 맞게 안전하게 관리합니다.
        본 방침은 머니픽 웹사이트 이용 과정에서 처리되는 개인정보 기준을 설명합니다.
      </p>

      <div className="mt-10 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-[#E8ECEF] pt-5 dark:border-navy-700">
            <h2 className="mb-2 text-lg font-extrabold text-[#1A1D1F] dark:text-white">{section.title}</h2>
            <p className="text-[15px] leading-8 text-[#5B6168] dark:text-slate-300">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl bg-[#F6F8FA] p-5 text-[13px] leading-7 text-[#6B7280] dark:bg-navy-900 dark:text-slate-400">
        개인정보 열람, 정정, 삭제 요청은 문의 페이지의 접수폼으로 보내주세요. 본 방침은 2026년 7월 20일부터 적용됩니다.
      </section>
    </main>
  );
}
