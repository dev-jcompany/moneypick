'use client';

import { useMemo, useState } from 'react';
import { calculatorConfigs, calculate as calculateResult } from '@/lib/calculators/engine.mjs';

type Values = Record<string, number | string | boolean>;
type Result = { label: string; value: number; suffix?: string; emphasize?: boolean };
type CalculatorConfig = { fields: { key: string; label: string; default: number | string; type?: 'select'; options?: [string, string][]; unit?: string }[]; note: string };

const won = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
const fieldClass = 'w-full rounded-xl border border-[#DDE3EB] bg-white px-4 py-3 text-right outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 dark:border-navy-600 dark:bg-navy-900';

// 계산 로직/필드 설정은 lib/calculators/engine.mjs 로 이동했다(머니픽 스케줄 생성기와 공유).
const configs = calculatorConfigs as Record<string, CalculatorConfig>;
const calculate = calculateResult as (slug: string, values: Values) => Result[];

export default function CalculatorClient({ slug }: { slug: string }) {
  const config = configs[slug];
  const [values, setValues] = useState<Values>(() => Object.fromEntries(config.fields.map((field) => [field.key, field.default])));
  const results = useMemo(() => calculate(slug, values), [slug, values]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-3xl border border-[#E8ECEF] bg-white p-6 dark:border-navy-700 dark:bg-navy-800 md:p-8">
        <h2 className="mb-6 text-xl font-bold">조건 입력</h2>
        <div className="space-y-5">
          {config.fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-2 block text-sm font-semibold">{field.label}</span>
              <div className="relative">
                {field.type === 'select' ? (
                  <select value={String(values[field.key])} onChange={(event) => setValues({ ...values, [field.key]: event.target.value })} className={`${fieldClass} text-left`}>
                    {field.options?.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                ) : (
                  <>
                    <input type="number" min="0" value={Number(values[field.key])} onChange={(event) => setValues({ ...values, [field.key]: Number(event.target.value) })} className={`${fieldClass} ${field.unit ? 'pr-14' : ''}`} />
                    {field.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8A949E]">{field.unit}</span>}
                  </>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-3xl bg-[#0D1928] p-6 text-white md:p-8">
        <h2 className="mb-6 text-xl font-bold">계산 결과</h2>
        <dl className="space-y-4">
          {results.map((result) => (
            <div key={result.label} className={`rounded-2xl p-4 ${result.emphasize ? 'bg-[#21A05A]' : 'bg-white/5'}`}>
              <dt className="mb-1 text-xs text-white/70">{result.label}</dt>
              <dd className="text-2xl font-extrabold">{won.format(Math.round(result.value))}{result.suffix ?? (result.label.includes('요율') || result.label.includes('DSR') || result.label.includes('경감률') ? '' : '원')}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs leading-6 text-slate-400">{config.note}</p>
      </section>
    </div>
  );
}
