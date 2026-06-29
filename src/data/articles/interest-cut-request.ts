import type { MoneyPickArticleProps } from '@/components/moneypick/types';

export const interestCutRequest: MoneyPickArticleProps = {
  categoryKey: 'loan',
  categoryLabel: '대출연구소',
  title: '대출 받은 다음엔 이자 줄이는 법, 금리인하요구권',
  date: '2026.06.12',
  updateDate: '2026.06.14',
  readingTime: '5분',
  views: 9321,
  editor: '머니픽 에디터',
  authorPostCount: 142,
  heroStat: { value: '0원', label: '신청이 공짜인데\n이자는 줄어요' },
  lead:
    '대출을 한 번 받으면 끝이라고 생각하기 쉬워요. 그런데 받은 다음에도 이자를 낮출 수 있는 방법이 있어요. 바로 **금리인하요구권**이에요. 취직하거나, 소득이 높아지거나, 신용점수가 올랐다면 금융사에 \'금리를 내려주세요\'라고 정식으로 요구할 수 있답니다. 신청은 무료니까 안 할 이유가 없어요.',
  blocks: [
    { type: 'heading', text: '금리인하요구권이 뭔가요?' },
    {
      type: 'paragraph',
      text: '돈을 빌린 사람의 신용 상태가 좋아졌을 때, 금융기관에 금리를 낮춰달라고 요구할 수 있는 **법으로 보장된 권리**예요. 은행은 물론 저축은행·카드사·보험사 등 대부분의 금융기관에서 쓸 수 있어요. 신용이 좋아졌다는 건 \'나한테 돈 빌려줄 위험이 줄었다\'는 뜻이므로, 그만큼 금리도 낮춰달라고 요청할 수 있는 거예요.',
    },
    { type: 'heading', text: '이럴 때 신청하세요' },
    {
      type: 'paragraph',
      text: '아무 때나 효과가 있는 건 아니에요. \'예전보다 신용이 좋아졌다\'는 변화가 있을 때 신청해야 인정받기 쉬워요.',
    },
    {
      type: 'checklist',
      title: '금리인하 신청하기 좋은 시기',
      items: [
        '취직하거나 직장이 바뀌었을 때',
        '연봉·사업소득이 늘었을 때',
        '신용점수가 올랐을 때',
        '대출을 많이 갚아 잔액이 줄었을 때',
      ],
    },
    { type: 'heading', text: '얼마나 줄일 수 있어요?' },
    {
      type: 'paragraph',
      text: '신청한다고 무조건 깎이는 건 아니에요. 금융사가 \'신용 개선이 금리에 실질적으로 영향을 주는지\' 심사하거든요. 하지만 조건이 맞으면 적게는 0.1%p부터 인하되고, 대출 금액이 크면 그 효과가 꽤 커요.',
    },
    {
      type: 'example',
      text: '예를 들어 **3억 원** 대출에서 금리가 **0.3%p**만 내려가도, 1년에 약 **90만 원**의 이자를 아낄 수 있어요.',
    },
    {
      type: 'calculator',
      label: '내 대출, 금리 내리면 얼마 아낄까?',
      caption: '금리 변화에 따른 이자를 바로 계산해보세요',
      href: '/calculators/jeonse-loan',
    },
    { type: 'heading', text: '어떻게 신청하나요?' },
    {
      type: 'checklist',
      title: '금리인하요구권 신청 방법',
      items: [
        '거래 은행 앱 또는 영업점에서 \'금리인하 요구\' 선택하기',
        '소득·재직·신용 개선 정보를 보여주는 증빙 서류 제출하기',
        '보통 10영업일 이내에 수용 여부와 결과를 통지받기',
      ],
    },
    {
      type: 'point',
      text: '신청만으로는 신용점수가 떨어지지 않아요. 부담 없이 시도해도 되고, 한 번 거절돼도 신용이 더 좋아지면 다시 신청할 수 있어요.',
    },
    {
      type: 'faq',
      items: [
        {
          q: '모든 대출에 다 되나요?',
          a: '대부분의 가계·기업 대출에 가능하지만, 이미 최저 수준의 금리이거나 일부 정책금융 상품의 대상에서는 제외될 수 있어요.',
        },
        {
          q: '갈아타기랑 뭐가 다른가요?',
          a: '금리인하요구권은 \'지금 거래하는 은행\'의 금리를 내려달라고 요청하는 거고, 갈아타기는 \'더 좋은 다른 은행\'으로 옮기는 거예요. 먼저 금리인하를 요청해 보고, 부족하면 갈아타기를 검토하는 순서가 좋아요.',
        },
      ],
    },
  ],
  summary: [
    '취직·이직·소득 증가·신용점수 상승이 있다면 금리인하요구권을 신청하세요.',
    '신청은 무료이고, 신청만으로 신용점수가 떨어지지 않아요.',
    '보통 10영업일 안에 결과를 알려주고, 거절돼도 다시 신청할 수 있어요.',
  ],
  relatedCalculators: [
    { label: '전세대출 계산기', href: '/calculators/jeonse-loan' },
    { label: '주택담보대출 계산기', href: '/calculators/mortgage' },
  ],
  recommendedContent: [
    { title: '주택담보대출 갈아타기 완벽 가이드', category: '대출연구소', href: '/articles/mortgage-transfer', emoji: '🏠', views: 12480 },
    { title: '대환대출 절감액, 바로 계산해보기', category: '대출연구소', href: '/calculators/loan-refinancing', emoji: '💳', views: 6120 },
    { title: 'DSR이란? 내 한도 계산법', category: '대출연구소', href: '/calculators/dsr', emoji: '📊', views: 7654 },
    { title: '전세대출 금리 비교 가이드', category: '대출연구소', href: '/calculators/jeonse-loan', emoji: '🏦', views: 4830 },
  ],
  tags: ['대출연구소', '금리인하요구권', '대출이자', '재테크', '신용점수'],
  related: [
    { category: '대출', title: '주택담보대출 갈아타기, 앱으로 5분이면 이자 수백만 원 아껴요', href: '/articles/mortgage-transfer', emoji: '🏠' },
    { category: '대출', title: '신용점수 빠르게 올리는 7가지 방법', href: '/articles/credit-score-up', emoji: '📈' },
  ],
  disclaimer:
    '본 콘텐츠는 일반적인 정보 제공을 목적으로 하며 특정 개인을 위한 금융 자문이 아닙니다. 금리인하요구권의 적용 대상·심사 기준·인하 폭은 금융기관과 개인의 신용 상태에 따라 다르며, 관련 제도는 변경될 수 있습니다. 실제 신청 전 거래 금융기관과 금융감독원 소비자포털의 최신 안내를 확인하시기 바랍니다.',
};
