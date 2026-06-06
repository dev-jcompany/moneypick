import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import CalculatorClient from '@/components/CalculatorClient';
import JsonLd from '@/components/JsonLd';
import { calculators } from '@/src/data/calculators';

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return calculators.map((calculator) => ({ slug: calculator.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const calculator = calculators.find((item) => item.slug === slug);
  return calculator ? { title: calculator.name, description: calculator.description } : {};
}

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const calculator = calculators.find((item) => item.slug === slug);
  if (!calculator) notFound();
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: calculator.name, description: calculator.description, applicationCategory: 'FinanceApplication', operatingSystem: 'Web' }} />
      <Breadcrumb items={[{ label: '계산기', href: '/calculators' }, { label: calculator.name }]} />
      <header className="mb-8"><div className="mb-3 text-4xl">{calculator.icon}</div><h1 className="mb-3 text-3xl font-extrabold">{calculator.name}</h1><p className="text-[#5B6168] dark:text-slate-400">{calculator.description}</p></header>
      <CalculatorClient slug={calculator.slug} />
      <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-200">계산 결과는 입력값에 따른 참고용 추정치입니다. 실제 세금, 보험료, 대출 한도와 급여는 적용 시점의 법령 및 기관 심사 기준을 확인하세요.</p>
    </div>
  );
}
