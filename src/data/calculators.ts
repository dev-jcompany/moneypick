import type { Calculator } from '../types';

export const calculators: Calculator[] = [
  { id: '1', slug: 'jeonse-loan', name: '전세대출 계산기', description: '보증금과 금리를 기준으로 필요 자금과 월 이자를 계산합니다.', icon: '🏦', category: '대출' },
  { id: '2', slug: 'dsr', name: 'DSR 계산기', description: '연소득 대비 연간 원리금 상환 비율과 여유 한도를 확인합니다.', icon: '📊', category: '대출' },
  { id: '3', slug: 'brokerage-fee', name: '부동산 중개수수료 계산기', description: '매매·전세·월세 거래의 법정 상한 수수료를 계산합니다.', icon: '🏠', category: '부동산' },
  { id: '4', slug: 'unemployment-benefit', name: '실업급여 계산기', description: '퇴직 전 평균임금과 가입기간으로 예상 구직급여를 계산합니다.', icon: '💼', category: '직장' },
  { id: '5', slug: 'salary', name: '연봉 실수령액 계산기', description: '4대보험과 간이 소득세를 반영한 월 예상 실수령액을 계산합니다.', icon: '💵', category: '직장' },
  { id: '6', slug: 'car-tax', name: '자동차세 계산기', description: '차종·배기량별 자동차세와 지방교육세를 계산합니다.', icon: '🚗', category: '세금' },
];
