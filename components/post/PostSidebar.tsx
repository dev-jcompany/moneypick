import Link from 'next/link';
import { SidebarAdBanners, SidebarTopBanner } from '@/components/post/AdColumn';
import type { Post } from '@/src/types';
import { categories } from '@/src/data/categories';
import { getPostUrl } from '@/lib/url';

const DAILY_TIPS = [
  { title: 'DSR이란?', body: '총부채원리금상환비율. 연소득 대비 모든 대출의 원리금 합산 비율로, 기본 한도는 40%입니다.' },
  { title: '중도상환수수료', body: '대출을 만기 전에 갚을 때 내는 비용. 대부분 대출 후 3년이 지나면 0원이 됩니다.' },
  { title: '전월세 전환율', body: '전세를 월세로 전환할 때 적용하는 비율. 법정 기준은 한국은행 기준금리 + 2%입니다.' },
  { title: '비과세 한도', body: 'ISA·청년 우대형 적금 등 특정 금융상품에 적용되는 이자소득세 면제 한도입니다.' },
  { title: '증여세 공제', body: '부모→자녀는 10년간 5,000만 원, 배우자 간은 6억 원까지 증여세 없이 이전 가능합니다.' },
  { title: 'LTV란?', body: '담보인정비율. 담보 가치 대비 대출 가능 금액의 비율로, 주택 구매 시 대출 한도를 결정합니다.' },
  { title: '청약 가점', body: '무주택기간(32점) + 부양가족(35점) + 청약통장 가입기간(17점) = 최대 84점.' },
];

const rankColors = [
  'bg-[#21A05A] text-white',
  'bg-[#3B82F6] text-white',
  'bg-[#F59E0B] text-white',
  'bg-[#94A3B8] text-white',
  'bg-[#94A3B8] text-white',
];

interface Props {
  popular: Post[];
  categoryPosts: Post[];
  currentPostId: string;
}

export default function PostSidebar({ popular, categoryPosts, currentPostId }: Props) {
  const tip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];
  const filteredCategory = categoryPosts.filter((p) => p.id !== currentPostId).slice(0, 5);

  return (
    <aside className="hidden min-w-0 lg:block">
      <div className="sticky top-[100px] space-y-4">

        {/* 1. 상단 광고 (삼성증권) */}
        <SidebarTopBanner />

        {/* 2. 실시간 인기글 */}
        {popular.length > 0 && (
          <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-[#1A1D1F] dark:text-white">🔥 실시간 인기글</h3>
              <Link href="/posts" className="text-[11px] text-[#8A949E] hover:text-[#21A05A]">더보기 →</Link>
            </div>
            <ol className="space-y-3">
              {popular.slice(0, 5).map((post, i) => (
                <li key={post.id}>
                  <Link href={getPostUrl(post)} className="group flex items-start gap-2.5">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold ${rankColors[i]}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[12px] font-medium leading-snug text-[#1A1D1F] group-hover:text-[#21A05A] dark:text-slate-300">
                        {post.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#94A3B8]">조회 {post.views.toLocaleString()}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 3. 같은 카테고리 추천글 */}
        {filteredCategory.length > 0 && (
          <div className="rounded-2xl border border-[#E8ECEF] bg-white p-5 dark:border-navy-700 dark:bg-navy-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-[#1A1D1F] dark:text-white">📌 같은 카테고리 추천</h3>
              <Link href="/posts" className="text-[11px] text-[#8A949E] hover:text-[#21A05A]">더보기 →</Link>
            </div>
            <ul className="space-y-3.5">
              {filteredCategory.map((post) => {
                const cat = categories.find((c) => c.id === post.categoryId);
                return (
                  <li key={post.id}>
                    <Link href={getPostUrl(post)} className="group flex gap-3">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="h-14 w-20 shrink-0 rounded-xl bg-[#F1F5F3] dark:bg-navy-700" />
                      )}
                      <div className="min-w-0">
                        <span className="mb-0.5 inline-block text-[10px] font-bold text-[#21A05A]">
                          {cat?.name ?? ''}
                        </span>
                        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-[#1A1D1F] group-hover:text-[#21A05A] dark:text-slate-300">
                          {post.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#94A3B8]">조회 {post.views.toLocaleString()}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 4. 오늘의 금융상식 */}
        <div className="rounded-2xl border border-[#c8e8d4] bg-[#f0faf5] p-5 dark:border-navy-700 dark:bg-navy-800/60">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#21A05A]">오늘의 금융상식</p>
          <p className="mb-1.5 text-[14px] font-extrabold text-[#1a1d1b] dark:text-white">{tip.title}</p>
          <p className="text-[13px] leading-[1.65] text-[#4a5952] dark:text-slate-400">{tip.body}</p>
        </div>

        {/* 5. 하단 광고 */}
        <SidebarAdBanners />
      </div>
    </aside>
  );
}
