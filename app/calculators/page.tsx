import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { calculators } from '@/src/data/calculators';

export const metadata: Metadata = { title: '금융 계산기', description: '대출, DSR, 중개수수료, 실업급여, 연봉, 자동차세를 무료로 계산하세요.' };

export default function CalculatorsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14">
      <Breadcrumb items={[{ label: '계산기' }]} />
      <h1 className="mb-2 text-3xl font-extrabold">금융 계산기</h1>
      <p className="mb-9 text-[#5B6168] dark:text-slate-400">복잡한 계산을 빠르게 비교해보세요. 결과는 참고용 예상치입니다.</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calculator) => (
          <Link key={calculator.id} href={`/calculators/${calculator.slug}`} className="rounded-2xl border border-[#E8ECEF] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
            <div className="mb-4 text-3xl">{calculator.icon}</div>
            <span className="mb-2 block text-xs font-bold text-[#21A05A]">{calculator.category}</span>
            <h2 className="mb-2 text-lg font-bold">{calculator.name}</h2>
            <p className="text-sm leading-6 text-[#5B6168] dark:text-slate-400">{calculator.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
