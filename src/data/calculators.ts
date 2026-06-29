import type { Calculator } from '../types';

export const calculators: Calculator[] = [
  { id: '1', slug: 'jeonse-loan', name: '전세대출 계산기', description: '보증금과 금리를 기준으로 필요 자금과 월 이자를 계산합니다.', icon: '🏦', category: '대출' },
  { id: '2', slug: 'dsr', name: 'DSR 계산기', description: '연소득 대비 연간 원리금 상환 비율과 여유 한도를 확인합니다.', icon: '📊', category: '대출' },
  { id: '3', slug: 'brokerage-fee', name: '부동산 중개수수료 계산기', description: '매매·전세·월세 거래의 법정 상한 수수료를 계산합니다.', icon: '🏠', category: '부동산' },
  { id: '4', slug: 'unemployment-benefit', name: '실업급여 계산기', description: '퇴직 전 평균임금과 가입기간으로 예상 구직급여를 계산합니다.', icon: '💼', category: '직장' },
  { id: '5', slug: 'salary', name: '연봉 실수령액 계산기', description: '4대보험과 간이 소득세를 반영한 월 예상 실수령액을 계산합니다.', icon: '💵', category: '직장' },
  { id: '6', slug: 'car-tax', name: '자동차세 계산기', description: '차종·배기량별 자동차세와 지방교육세를 계산합니다.', icon: '🚗', category: '세금' },
  { id: '7', slug: 'mortgage', name: '주택담보대출 계산기', description: '대출금·금리·기간으로 원리금균등 또는 원금균등 월 상환액을 계산합니다.', icon: '🏡', category: '대출' },
  { id: '8', slug: 'savings', name: '적금 이자 계산기', description: '월 납입액·금리·기간으로 만기 수령액과 세후 이자를 계산합니다.', icon: '💰', category: '투자' },
  { id: '9', slug: 'severance', name: '퇴직금 계산기', description: '평균임금과 근속기간으로 법정 퇴직금 예상액을 계산합니다.', icon: '📋', category: '직장' },
  { id: '10', slug: 'gift-tax', name: '증여세 계산기', description: '증여 재산가액과 공제 한도를 적용한 예상 증여세를 계산합니다.', icon: '🎁', category: '세금' },
  { id: '11', slug: 'deposit', name: '예금 이자 계산기', description: '예치금·금리·기간으로 만기 수령액과 세후 이자를 계산합니다.', icon: '🏦', category: '투자' },
  { id: '12', slug: 'jeonse-monthly-conversion', name: '전월세 전환율 계산기', description: '전세 보증금과 월세를 상호 전환하거나 실질 전환율을 확인합니다.', icon: '🔄', category: '부동산' },
  { id: '13', slug: 'acquisition-tax', name: '취득세 계산기', description: '주택 구매 시 보유 주택 수와 가격에 따른 취득세를 계산합니다.', icon: '🏠', category: '부동산' },
  { id: '14', slug: 'capital-gains-tax', name: '양도소득세 계산기', description: '부동산 매도 시 양도차익과 장기보유공제를 적용한 세금을 계산합니다.', icon: '📈', category: '세금' },
  { id: '15', slug: 'comprehensive-income-tax', name: '종합소득세 계산기', description: '사업소득·프리랜서 수입에 대한 종합소득세 예상액을 계산합니다.', icon: '📑', category: '세금' },
  { id: '16', slug: 'health-insurance', name: '건강보험료 계산기', description: '직장·지역 가입자 유형별 월 건강보험료와 장기요양보험료를 계산합니다.', icon: '🏥', category: '직장' },
  { id: '17', slug: 'national-pension', name: '국민연금 수령액 계산기', description: '가입기간과 평균소득으로 예상 국민연금 월 수령액을 추정합니다.', icon: '👴', category: '투자' },
  { id: '18', slug: 'housing-subscription-score', name: '청약 가점 계산기', description: '무주택기간·부양가족 수·청약통장 가입기간으로 청약 가점을 계산합니다.', icon: '🏗️', category: '부동산' },
  { id: '19', slug: 'loan-refinancing', name: '대환대출 절감액 계산기', description: '현재 대출과 신규 금리를 비교해 대환 시 월 절감액과 총 절감 이자를 계산합니다.', icon: '💳', category: '대출' },
  { id: '20', slug: 'compound-interest', name: '복리 계산기', description: '초기 투자금과 월 적립액, 연 수익률로 복리 수익과 최종 자산을 계산합니다.', icon: '📊', category: '투자' },
];
