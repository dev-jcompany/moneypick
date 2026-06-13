import type { Category } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: '대출연구소',
    slug: '대출연구소',
    enSlug: 'loan',
    icon: '💰',
    description: '전세대출, 주택담보대출, DSR 계산법까지 대출의 모든 것을 알려드립니다.',
    color: 'green',
  },
  {
    id: '2',
    name: '부동산연구소',
    slug: '부동산연구소',
    enSlug: 'realestate',
    icon: '🏠',
    description: '취득세, 중개수수료, 청약 정보 등 부동산 필수 지식을 정리했습니다.',
    color: 'blue',
  },
  {
    id: '3',
    name: '세금연구소',
    slug: '세금연구소',
    enSlug: 'tax',
    icon: '📊',
    description: '연말정산, 종합소득세, 양도소득세 절세 전략을 안내합니다.',
    color: 'orange',
  },
  {
    id: '4',
    name: '직장인연구소',
    slug: '직장인연구소',
    enSlug: 'work',
    icon: '💼',
    description: '실업급여, 퇴직금, 4대보험 등 직장인이 꼭 알아야 할 정보입니다.',
    color: 'purple',
  },
  {
    id: '5',
    name: '투자연구소',
    slug: '투자연구소',
    enSlug: 'invest',
    icon: '📈',
    description: 'ISA, 연금저축, ETF 등 스마트한 자산 관리 방법을 알려드립니다.',
    color: 'emerald',
  },
];

/** categoryId → 숫자 prefix (1~5) */
export const CATEGORY_PREFIX: Record<string, number> = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
};
