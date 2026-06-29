import NewsletterForm from '@/components/post/NewsletterForm';

export default function DetailPromoSection() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <div className="flex min-h-[150px] flex-col justify-between rounded-[20px] border border-[#CFEBDD] bg-[#F0FAF5] p-5 shadow-sm md:p-6">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-extrabold text-[#21A05A]">
            머니픽 뉴스레터
          </span>
          <h3 className="text-[19px] font-extrabold leading-snug text-[#1A1D1F] md:text-[20px]">
            금융·재테크 정보를 이메일로 받아보세요!
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[#6F7D75]">
            주 1회, 꼭 필요한 금융 정보만 골라 보내드립니다.
          </p>
        </div>
        <NewsletterForm />
      </div>

      <div className="flex min-h-[150px] flex-col items-start justify-between gap-4 rounded-[20px] bg-[#1A1D1F] p-5 text-white shadow-sm sm:flex-row sm:items-center md:p-6">
        <div>
          <span className="mb-3 inline-flex rounded-full bg-[#FEE500]/20 px-3 py-1.5 text-[12px] font-extrabold text-[#FEE500]">
            카카오톡 채널
          </span>
          <h3 className="text-[19px] font-extrabold leading-snug md:text-[20px]">
            카카오톡 채널 추가하고
            <br />
            실시간 금융 정보를 받아보세요!
          </h3>
        </div>
        <a
          href="#"
          className="shrink-0 rounded-[18px] bg-[#FEE500] px-6 py-4 text-[14px] font-extrabold text-[#3C1E1E] transition hover:bg-yellow-300"
        >
          채널 추가
        </a>
      </div>
    </section>
  );
}
