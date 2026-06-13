const ADS = [
  {
    id: 'ad-1',
    brand: '삼성증권',
    headline: '해외주식도\n삼성증권',
    sub: '최대 100달러 지급',
    bg: 'bg-[#1A237E]',
    text: 'text-white',
    height: 'h-[280px]',
  },
  {
    id: 'ad-2',
    brand: '토스뱅크',
    headline: '지금 이자 높은 통장\n최대 5만원 받기',
    sub: '',
    bg: 'bg-[#4FBEAF]',
    text: 'text-white',
    height: 'h-[160px]',
  },
  {
    id: 'ad-3',
    brand: 'KB국민카드',
    headline: '연말정산 특화카드\n최대 10% 캐시백',
    sub: '',
    bg: 'bg-[#FFCC00]',
    text: 'text-[#1A1D1F]',
    height: 'h-[160px]',
  },
];

function AdCard({ ad }: { ad: typeof ADS[number] }) {
  return (
    <div
      className={`${ad.height} ${ad.bg} ${ad.text} flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-5 transition-opacity hover:opacity-90`}
    >
      <div>
        <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide">
          {ad.brand}
        </span>
        <p className="mt-2 whitespace-pre-line text-[14px] font-extrabold leading-snug">{ad.headline}</p>
        {ad.sub && <p className="mt-1 text-[11px] opacity-80">{ad.sub}</p>}
      </div>
      <button type="button" className="self-start rounded-full bg-white/20 px-4 py-1.5 text-[11px] font-bold backdrop-blur-sm">
        자세히 보기 →
      </button>
    </div>
  );
}

/** widescreen(1440px+) 전용 독립 광고 컬럼 */
export default function AdColumn() {
  return (
    <aside className="hidden widescreen:block">
      <div className="sticky top-[100px] space-y-3">
        <p className="mb-1 text-center text-[10px] font-medium tracking-widest text-slate-400">광고</p>
        {ADS.map((ad) => <AdCard key={ad.id} ad={ad} />)}
      </div>
    </aside>
  );
}

/** xl(1280~1439px) 에서 우측 패널 상단에 1개만 컴팩트하게 표시 */
export function AdInline() {
  const ad = ADS[0];
  return (
    <div className="widescreen:hidden">
      <p className="mb-2 text-center text-[10px] font-medium tracking-widest text-slate-400">광고</p>
      <div
        className={`h-[140px] ${ad.bg} ${ad.text} flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-4 transition-opacity hover:opacity-90`}
      >
        <div>
          <span className="mb-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide">{ad.brand}</span>
          <p className="mt-1 whitespace-pre-line text-[13px] font-extrabold leading-snug">{ad.headline}</p>
        </div>
        <button type="button" className="self-start rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold backdrop-blur-sm">
          자세히 보기 →
        </button>
      </div>
    </div>
  );
}
