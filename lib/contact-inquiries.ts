export const CONTACT_INQUIRY_TYPES = {
  advertising_partnership: '광고·제휴 문의',
  article_tip: '기사 제보',
  correction: '오류 정정',
  general: '기타 문의',
} as const;

export type ContactInquiryType = keyof typeof CONTACT_INQUIRY_TYPES;

export function isContactInquiryType(value: string): value is ContactInquiryType {
  return Object.prototype.hasOwnProperty.call(CONTACT_INQUIRY_TYPES, value);
}
