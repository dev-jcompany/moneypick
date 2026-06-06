import Link from 'next/link';

const values = [
  { icon: '✅', title: '정확한 정보', desc: '공신력 있는 출처 기반' },
  { icon: '⚡', title: '쉽고 간편한 계산', desc: '무료 계산기 제공' },
  { icon: '💡', title: '절세 팁', desc: '합법적인 세금 절약' },
  { icon: '🎯', title: '맞춤 정보', desc: '상황별 가이드' },
];

export default function CtaBanner() {
  return (
    <section className="py-16 bg-gradient-to-br from-[#17794A] to-[#21A05A]">
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        <h2 className="text-[26px] md:text-[32px] font-extrabold text-white mb-3">
          더 똑똑한 돈 관리의 시작
        </h2>
        <p className="text-green-100 mb-10 text-[15px]">
          돈연구소와 함께 복잡한 금융 정보를 쉽게 이해하고, 현명한 결정을 내리세요.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
          {values.map((v) => (
            <div key={v.title} className="bg-white/10 rounded-2xl p-4 text-white">
              <div className="text-3xl mb-2" aria-hidden="true">{v.icon}</div>
              <div className="font-bold text-[15px] mb-1">{v.title}</div>
              <div className="text-[12px] text-green-100">{v.desc}</div>
            </div>
          ))}
        </div>

        <Link
          href="/calculators"
          className="inline-block px-8 py-3.5 bg-white text-[#21A05A] font-bold text-[15px] rounded-xl hover:bg-green-50 transition-colors shadow-lg"
        >
          계산기 모음 바로가기 →
        </Link>
      </div>
    </section>
  );
}
