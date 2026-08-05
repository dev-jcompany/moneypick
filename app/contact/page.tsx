import type { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: '연락처 및 광고·제휴문의',
  description: '머니픽 광고·제휴, 기사 제보, 오류 정정 요청 문의 안내입니다.',
};

const contactItems = [
  { label: '광고 및 제휴', body: '금융, 부동산, 생활경제와 관련된 캠페인 또는 제휴 제안을 검토합니다.' },
  { label: '기사 제보', body: '정책 변경, 서비스 출시, 독자에게 도움이 될 금융 정보를 보내주세요.' },
  { label: '오류 정정', body: '날짜, 조건, 수치, 링크 오류를 발견했다면 확인 후 수정하겠습니다.' },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-[900px] px-4 py-14 md:py-18">
      <p className="mb-3 text-[13px] font-bold uppercase tracking-widest text-[#21A05A]">Contact</p>
      <h1 className="mb-5 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">
        연락처 및 광고·제휴문의
      </h1>
      <p className="max-w-3xl text-[16px] leading-8 text-[#5B6168] dark:text-slate-300">
        광고, 제휴, 기사 제보, 콘텐츠 오류 정정 요청은 아래 문의폼으로 보내주세요.
        문의 내용과 연락 가능한 정보를 함께 남겨주시면 검토 후 필요한 경우 회신드립니다.
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {contactItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#E8ECEF] bg-white p-5 dark:border-navy-700 dark:bg-navy-900">
            <h2 className="mb-2 text-[16px] font-extrabold text-[#1A1D1F] dark:text-white">{item.label}</h2>
            <p className="text-[14px] leading-7 text-[#5B6168] dark:text-slate-300">{item.body}</p>
          </div>
        ))}
      </section>

      <p className="mt-8 text-[13px] leading-7 text-[#8A949E] dark:text-slate-500">
        머니픽은 전화 상담을 운영하지 않습니다. 개인별 대출 가능 여부, 세무 신고, 법률 판단은 금융기관,
        세무사, 변호사 등 자격 있는 전문가에게 문의해 주세요.
      </p>
    </main>
  );
}
