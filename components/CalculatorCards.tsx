import Link from 'next/link';
import { calculators } from '@/src/data/calculators';

export default function CalculatorCards() {
  return (
    <section className="py-10 bg-white dark:bg-navy-850">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-[#1A1D1F] dark:text-white">인기 계산기</h2>
          <Link
            href="/calculators"
            className="text-[12px] font-medium text-[#8A949E] dark:text-slate-500 hover:text-[#21A05A] transition-colors"
          >
            전체 계산기 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {calculators.map((calc) => (
            <Link
              key={calc.id}
              href={`/calculators/${calc.slug}`}
              className="bg-[#F6F8FA] dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-[#21A05A] dark:hover:border-[#21A05A] transition-all group flex flex-col"
            >
              <span className="text-2xl mb-3" aria-hidden="true">{calc.icon}</span>
              <h3 className="font-bold text-[#1A1D1F] dark:text-white text-[14px] mb-1.5">
                {calc.name}
              </h3>
              <p className="text-[12px] text-[#5B6168] dark:text-slate-400 leading-relaxed flex-1 mb-4">
                {calc.description}
              </p>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#21A05A] group-hover:underline">
                계산하기 →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
