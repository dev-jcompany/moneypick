// 공식 기관 레지스트리 & 주제 매칭
// 등록된 기관 URL만 사용. AI가 임의로 기관명·URL을 생성하지 않도록 프롬프트 제약과 함께 사용.

export const OFFICIAL_AGENCIES = [
  {
    id: 'fsc',
    name: '금융위원회',
    url: 'https://www.fsc.go.kr/',
    domain: 'fsc.go.kr',
    description: '금융정책과 대출 규제 관련 공식 안내',
    keywords: ['dsr', '대출 규제', '가계대출', '금융정책', 'ltv', 'dti', '여신', '금융위원회', '대출한도', '금융규제'],
    categories: ['대출연구소'],
  },
  {
    id: 'fss',
    name: '금융감독원',
    url: 'https://www.fss.or.kr/',
    domain: 'fss.or.kr',
    description: '금융상품과 금융소비자 보호 안내',
    keywords: ['금융감독원', '금융소비자', '금융분쟁', '투자 사기', '불법 대출', '보험 분쟁', '금융상품', '대출금리', '대출 규제', '금융정책'],
    categories: ['대출연구소', '투자연구소'],
  },
  {
    id: 'bok',
    name: '한국은행',
    url: 'https://www.bok.or.kr/',
    domain: 'bok.or.kr',
    description: '기준금리와 통화정책 공식 안내',
    keywords: ['기준금리', '금리 동향', '통화정책', '한국은행', '금리 인상', '금리 인하', '경제전망', '물가'],
    categories: ['투자연구소'],
  },
  {
    id: 'nts',
    name: '국세청',
    url: 'https://www.nts.go.kr/',
    domain: 'nts.go.kr',
    description: '세금 신고와 납부 관련 공식 안내',
    keywords: ['종합소득세', '연말정산', '양도소득세', '소득세', '근로소득', '사업소득', '세금 신고', '세금 환급', '홈택스', '세율', '세금 공제', '부가가치세'],
    categories: ['세금연구소'],
  },
  {
    id: 'mois',
    name: '행정안전부',
    url: 'https://www.mois.go.kr/',
    domain: 'mois.go.kr',
    description: '취득세·자동차세 등 지방세 공식 안내',
    keywords: ['취득세', '자동차세', '지방세', '재산세', '등록면허세', '지방세법', '위택스'],
    categories: ['세금연구소', '부동산연구소'],
  },
  {
    id: 'molit',
    name: '국토교통부',
    url: 'https://www.molit.go.kr/',
    domain: 'molit.go.kr',
    description: '주택 정책과 청약·임대차 제도 공식 안내',
    keywords: ['청약', '주택 정책', '전월세', '임대차', '전세 계약', '월세', '주택공급', '분양', '무주택', '주택담보'],
    categories: ['부동산연구소'],
  },
  {
    id: 'nhuf',
    name: '주택도시기금',
    url: 'https://nhuf.molit.go.kr/',
    domain: 'nhuf.molit.go.kr',
    description: '버팀목·디딤돌 등 정책 주택 대출 공식 안내',
    keywords: ['버팀목', '디딤돌', '전세자금', '주택도시기금', '정책 대출', '청약저축', '주거급여', '신혼부부 대출'],
    categories: ['부동산연구소', '대출연구소'],
  },
  {
    id: 'moel',
    name: '고용노동부',
    url: 'https://www.moel.go.kr/',
    domain: 'moel.go.kr',
    description: '실업급여·고용보험 등 고용 제도 공식 안내',
    keywords: ['실업급여', '고용보험', '육아휴직', '출산휴가', '퇴직금', '최저임금', '고용지원금', '근로기준'],
    categories: ['직장인연구소'],
  },
  {
    id: 'nps',
    name: '국민연금공단',
    url: 'https://www.nps.or.kr/',
    domain: 'nps.or.kr',
    description: '국민연금 수령액·납부 관련 공식 안내',
    keywords: ['국민연금', '연금 수령액', '연금보험료', '노령연금', '장애연금', '유족연금', '연금 예상'],
    categories: ['직장인연구소'],
  },
  {
    id: 'nhis',
    name: '국민건강보험공단',
    url: 'https://www.nhis.or.kr/',
    domain: 'nhis.or.kr',
    description: '건강보험료 산정과 납부 공식 안내',
    keywords: ['건강보험', '건강보험료', '피부양자', '지역가입자', '직장가입자', '건강보험공단', '보험료 계산'],
    categories: ['직장인연구소'],
  },
];

const ALLOWED_DOMAINS = new Set(OFFICIAL_AGENCIES.map(a => a.domain));

export function isAllowedDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return [...ALLOWED_DOMAINS].some(d => hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

/**
 * 주제 정보를 받아 관련 공식 기관 최대 3개를 반환.
 * 키워드 매칭이 없으면 카테고리 일치만으로는 포함하지 않음.
 * 키워드 일치 +3, 카테고리 보너스 +1.
 */
export function matchSources(topic) {
  const text = [
    topic.title ?? '',
    ...(topic.planTags ?? []),
    topic.archetype ?? '',
  ].join(' ').toLowerCase();

  const scored = OFFICIAL_AGENCIES.map(agency => {
    let keywordScore = 0;
    for (const kw of agency.keywords) {
      if (text.includes(kw.toLowerCase())) keywordScore += 3;
    }
    if (keywordScore === 0) return { agency, score: 0 };
    const categoryBonus = (agency.categories ?? []).includes(topic.category) ? 1 : 0;
    return { agency, score: keywordScore + categoryBonus };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ agency }) => agency);
}
