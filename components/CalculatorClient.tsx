'use client';

import { useMemo, useState } from 'react';

type Values = Record<string, number | string | boolean>;
type Result = { label: string; value: number; suffix?: string; emphasize?: boolean };

const won = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
const fieldClass = 'w-full rounded-xl border border-[#DDE3EB] bg-white px-4 py-3 text-right outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 dark:border-navy-600 dark:bg-navy-900';

const configs: Record<string, { fields: { key: string; label: string; default: number | string; type?: 'select'; options?: [string, string][]; unit?: string }[]; note: string }> = {
  'jeonse-loan': {
    fields: [
      { key: 'deposit', label: '전세보증금', default: 300000000, unit: '원' },
      { key: 'cash', label: '보유 자기자금', default: 100000000, unit: '원' },
      { key: 'rate', label: '대출금리', default: 4.0, unit: '%' },
      { key: 'ltv', label: '보증금 대비 한도', default: 80, unit: '%' },
    ],
    note: '필요 대출금과 보증금 대비 한도 중 작은 금액을 적용하며, 월 이자는 만기일시상환 기준입니다.',
  },
  dsr: {
    fields: [
      { key: 'income', label: '연소득', default: 60000000, unit: '원' },
      { key: 'existing', label: '기존 연간 원리금', default: 12000000, unit: '원' },
      { key: 'newLoan', label: '신규 대출금', default: 100000000, unit: '원' },
      { key: 'rate', label: '신규 대출금리', default: 4.5, unit: '%' },
      { key: 'years', label: '상환기간', default: 30, unit: '년' },
      { key: 'limit', label: '목표 DSR', default: 40, unit: '%' },
    ],
    note: '신규 대출은 원리금균등상환 공식으로 연간 상환액을 계산합니다. 실제 심사는 스트레스 금리와 대출별 산정 만기를 적용할 수 있습니다.',
  },
  'brokerage-fee': {
    fields: [
      { key: 'tradeType', label: '거래 유형', default: 'sale', type: 'select', options: [['sale', '매매'], ['rent', '전세'], ['monthly', '월세']] },
      { key: 'price', label: '매매가 또는 보증금', default: 500000000, unit: '원' },
      { key: 'monthlyRent', label: '월세', default: 0, unit: '원' },
    ],
    note: '주택 중개보수 법정 상한요율을 적용한 최대 금액입니다. 실제 보수는 상한 이내에서 중개의뢰인과 개업공인중개사가 협의합니다.',
  },
  'unemployment-benefit': {
    fields: [
      { key: 'monthlySalary', label: '퇴직 전 월 평균임금', default: 3000000, unit: '원' },
      { key: 'insuredYears', label: '고용보험 가입기간', default: 5, unit: '년' },
      { key: 'age', label: '퇴직 당시 나이', default: 35, unit: '세' },
    ],
    note: '1일 구직급여는 평균임금의 60%를 기초로 계산합니다. 상·하한액과 소정급여일수는 퇴직일의 법령 및 개인 자격에 따라 달라집니다.',
  },
  salary: {
    fields: [
      { key: 'annualSalary', label: '세전 연봉', default: 50000000, unit: '원' },
      { key: 'dependents', label: '부양가족 수(본인 포함)', default: 1, unit: '명' },
      { key: 'nonTax', label: '월 비과세액', default: 200000, unit: '원' },
    ],
    note: '국민연금·건강보험·장기요양·고용보험과 누진 소득세를 단순 추정합니다. 회사 급여명세서의 간이세액표 및 공제 항목과 차이가 날 수 있습니다.',
  },
  'car-tax': {
    fields: [
      { key: 'vehicleType', label: '차량 유형', default: 'passenger', type: 'select', options: [['passenger', '비영업용 승용차'], ['electric', '비영업용 전기차']] },
      { key: 'cc', label: '배기량', default: 1998, unit: 'cc' },
      { key: 'age', label: '차령', default: 1, unit: '년' },
    ],
    note: '비영업용 승용차의 배기량별 세액과 지방교육세 30%를 계산합니다. 차령 3년차부터 매년 5%씩 최대 50% 경감합니다.',
  },
};

function annuityAnnual(principal: number, annualRate: number, years: number) {
  const monthlyRate = annualRate / 100 / 12;
  const months = Math.max(1, years * 12);
  if (!monthlyRate) return principal / years;
  return principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1) * 12;
}

function brokerageCap(type: string, amount: number) {
  if (type === 'sale') {
    if (amount < 50000000) return [0.006, 250000];
    if (amount < 200000000) return [0.005, 800000];
    if (amount < 900000000) return [0.004, Infinity];
    if (amount < 1200000000) return [0.005, Infinity];
    if (amount < 1500000000) return [0.006, Infinity];
    return [0.007, Infinity];
  }
  if (amount < 50000000) return [0.005, 200000];
  if (amount < 100000000) return [0.004, 300000];
  if (amount < 600000000) return [0.003, Infinity];
  if (amount < 1200000000) return [0.004, Infinity];
  if (amount < 1500000000) return [0.005, Infinity];
  return [0.006, Infinity];
}

function progressiveTax(taxBase: number) {
  const brackets = [[14000000, 0.06], [50000000, 0.15], [88000000, 0.24], [150000000, 0.35], [300000000, 0.38], [500000000, 0.4], [1000000000, 0.42], [Infinity, 0.45]];
  let tax = 0, previous = 0;
  for (const [limit, rate] of brackets) {
    const taxable = Math.max(0, Math.min(taxBase, limit) - previous);
    tax += taxable * rate;
    if (taxBase <= limit) break;
    previous = limit;
  }
  return tax;
}

function calculate(slug: string, v: Values): Result[] {
  const n = (key: string) => Number(v[key]) || 0;
  if (slug === 'jeonse-loan') {
    const needed = Math.max(0, n('deposit') - n('cash'));
    const loan = Math.min(needed, n('deposit') * n('ltv') / 100);
    return [{ label: '예상 대출금', value: loan, emphasize: true }, { label: '월 이자', value: loan * n('rate') / 100 / 12 }, { label: '연간 이자', value: loan * n('rate') / 100 }];
  }
  if (slug === 'dsr') {
    const annual = annuityAnnual(n('newLoan'), n('rate'), n('years'));
    const dsr = n('income') ? (n('existing') + annual) / n('income') * 100 : 0;
    const room = Math.max(0, n('income') * n('limit') / 100 - n('existing'));
    const unitPayment = annuityAnnual(1, n('rate'), n('years'));
    return [{ label: '예상 DSR', value: dsr, suffix: '%', emphasize: true }, { label: '신규 연간 원리금', value: annual }, { label: '목표 DSR 내 추가 한도', value: unitPayment ? room / unitPayment : 0 }];
  }
  if (slug === 'brokerage-fee') {
    const type = String(v.tradeType);
    let amount = n('price');
    if (type === 'monthly') {
      amount = n('price') + n('monthlyRent') * 100;
      if (amount < 50000000) amount = n('price') + n('monthlyRent') * 70;
    }
    const [rate, cap] = brokerageCap(type, amount);
    const fee = Math.min(amount * rate, cap);
    return [{ label: '거래금액 환산', value: amount }, { label: '상한요율', value: rate * 100, suffix: '%' }, { label: '최대 중개보수', value: fee, emphasize: true }, { label: '부가세 포함 시', value: fee * 1.1 }];
  }
  if (slug === 'unemployment-benefit') {
    const dailyAverage = n('monthlySalary') / 30;
    const daily = Math.min(66000, Math.max(64192, dailyAverage * 0.6));
    const years = n('insuredYears'), age = n('age');
    const older = age >= 50;
    const days = years < 1 ? 120 : years < 3 ? (older ? 180 : 150) : years < 5 ? (older ? 210 : 180) : years < 10 ? (older ? 240 : 210) : (older ? 270 : 240);
    return [{ label: '예상 1일 지급액', value: daily }, { label: '예상 소정급여일수', value: days, suffix: '일' }, { label: '예상 총 지급액', value: daily * days, emphasize: true }];
  }
  if (slug === 'salary') {
    const annual = n('annualSalary'), monthly = annual / 12, taxableMonthly = Math.max(0, monthly - n('nonTax'));
    const pension = Math.min(taxableMonthly, 6170000) * 0.045;
    const health = taxableMonthly * 0.03545;
    const care = health * 0.1295;
    const employment = taxableMonthly * 0.009;
    const earnedDeduction = Math.min(20000000, annual * 0.25);
    const personal = n('dependents') * 1500000;
    const incomeTax = progressiveTax(Math.max(0, annual - earnedDeduction - personal)) / 12;
    const localTax = incomeTax * 0.1;
    const deductions = pension + health + care + employment + incomeTax + localTax;
    return [{ label: '월 세전 급여', value: monthly }, { label: '월 공제 예상액', value: deductions }, { label: '월 예상 실수령액', value: monthly - deductions, emphasize: true }, { label: '연 예상 실수령액', value: (monthly - deductions) * 12 }];
  }
  const base = String(v.vehicleType) === 'electric' ? 100000 : n('cc') * (n('cc') <= 1000 ? 80 : n('cc') <= 1600 ? 140 : 200);
  const discount = n('age') >= 3 ? Math.min(0.5, (n('age') - 2) * 0.05) : 0;
  const discounted = base * (1 - discount);
  return [{ label: '자동차세', value: discounted }, { label: '지방교육세', value: discounted * 0.3 }, { label: '연간 납부 예상액', value: discounted * 1.3, emphasize: true }, { label: '차령 경감률', value: discount * 100, suffix: '%' }];
}

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
