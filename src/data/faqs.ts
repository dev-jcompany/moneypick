import type { Faq } from '../types';

export const faqs: Faq[] = [
  { id: '1', postId: '1', question: 'DSR에는 전세대출 이자도 포함되나요?', answer: '대출 유형과 보증 방식, 시행 시점의 규정에 따라 반영 방식이 다릅니다. 금융기관의 실제 심사 결과를 최종 기준으로 확인해야 합니다.', sortOrder: 1 },
  { id: '2', postId: '1', question: 'DSR이 40%를 넘으면 대출을 받을 수 없나요?', answer: '일반적으로 은행권 규제 기준을 넘으면 신규 대출이 제한되지만, 정책금융상품이나 적용 제외 대상은 별도 기준을 사용할 수 있습니다.', sortOrder: 2 },
  { id: '3', postId: '2', question: '생애최초 주택 구입자는 취득세를 감면받을 수 있나요?', answer: '주택가액, 소득, 취득 시점 등 법정 요건을 충족하면 감면받을 수 있습니다. 적용 기한과 한도는 관할 지방자치단체에 확인하세요.', sortOrder: 1 },
  { id: '4', postId: '9', question: '자발적 퇴사도 실업급여를 받을 수 있나요?', answer: '원칙적으로 어렵지만 임금 체불, 직장 내 괴롭힘, 통근 곤란 등 정당한 이직 사유가 인정되면 수급할 수 있습니다.', sortOrder: 1 },
];
