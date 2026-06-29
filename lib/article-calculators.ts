import type { CategoryKey } from '@/components/moneypick/types';

export type RelatedCalculator = { label: string; href: string };

export const ARTICLE_CALCULATOR_OPTIONS: RelatedCalculator[] = [
  { label: '전세대출 계산기', href: '/calculators/jeonse-loan' },
  { label: 'DSR 계산기', href: '/calculators/dsr' },
  { label: '주택담보대출 계산기', href: '/calculators/mortgage' },
  { label: '대환대출 절감액 계산기', href: '/calculators/loan-refinancing' },
  { label: '부동산 중개수수료 계산기', href: '/calculators/brokerage-fee' },
  { label: '취득세 계산기', href: '/calculators/acquisition-tax' },
  { label: '청약 가점 계산기', href: '/calculators/housing-subscription-score' },
  { label: '양도소득세 계산기', href: '/calculators/capital-gains-tax' },
  { label: '증여세 계산기', href: '/calculators/gift-tax' },
  { label: '종합소득세 계산기', href: '/calculators/comprehensive-income-tax' },
  { label: '연봉 실수령액 계산기', href: '/calculators/salary' },
  { label: '퇴직금 계산기', href: '/calculators/severance' },
  { label: '실업급여 계산기', href: '/calculators/unemployment-benefit' },
  { label: '예금 이자 계산기', href: '/calculators/deposit' },
  { label: '적금 이자 계산기', href: '/calculators/savings' },
  { label: '복리 계산기', href: '/calculators/compound-interest' },
];

const DEFAULT_CALCULATOR_HREFS: Record<CategoryKey, string[]> = {
  loan: ['/calculators/jeonse-loan', '/calculators/dsr', '/calculators/mortgage'],
  estate: ['/calculators/brokerage-fee', '/calculators/acquisition-tax', '/calculators/housing-subscription-score'],
  tax: ['/calculators/capital-gains-tax', '/calculators/gift-tax', '/calculators/comprehensive-income-tax'],
  work: ['/calculators/salary', '/calculators/severance', '/calculators/unemployment-benefit'],
  invest: ['/calculators/deposit', '/calculators/savings', '/calculators/compound-interest'],
};

export function getDefaultRelatedCalculators(categoryKey: CategoryKey | string): RelatedCalculator[] {
  const hrefs = DEFAULT_CALCULATOR_HREFS[categoryKey as CategoryKey] ?? DEFAULT_CALCULATOR_HREFS.loan;
  return ARTICLE_CALCULATOR_OPTIONS.filter((calculator) => hrefs.includes(calculator.href));
}

export function normalizeRelatedCalculators(
  relatedCalculators: RelatedCalculator[] | null | undefined,
  categoryKey: CategoryKey | string,
): RelatedCalculator[] {
  return relatedCalculators && relatedCalculators.length > 0
    ? relatedCalculators
    : getDefaultRelatedCalculators(categoryKey);
}
