import React from 'react';
import type { MoneyPickArticleProps, ArticleBlock, CategoryKey } from './types';
import { sanitizePostHtml } from '@/lib/sanitize';

const CATEGORY_THEME: Record<
  CategoryKey,
  { badge: string; soft: string; darkSoft: string; accent: string; accentDark: string; heroFrom: string; heroTo: string }
> = {
  loan:   { badge: 'bg-[#eaf7ef] text-[#147a42]', soft: 'bg-[#eaf7ef]', darkSoft: 'dark:bg-green-900/30',   accent: '#1f9d57', accentDark: '#147a42', heroFrom: '#27ab63', heroTo: '#15803f' },
  estate: { badge: 'bg-[#e8f0fb] text-[#2563c9]', soft: 'bg-[#e8f0fb]', darkSoft: 'dark:bg-blue-900/30',    accent: '#2563c9', accentDark: '#1d4ed8', heroFrom: '#3b82f6', heroTo: '#1d4ed8' },
  tax:    { badge: 'bg-[#fdeee3] text-[#c2691f]', soft: 'bg-[#fdeee3]', darkSoft: 'dark:bg-orange-900/30',  accent: '#c2691f', accentDark: '#b45309', heroFrom: '#f59e0b', heroTo: '#c2410c' },
  work:   { badge: 'bg-[#f0ebfa] text-[#6d3fc2]', soft: 'bg-[#f0ebfa]', darkSoft: 'dark:bg-purple-900/30', accent: '#6d3fc2', accentDark: '#5b21b6', heroFrom: '#8b5cf6', heroTo: '#6d28d9' },
  invest: { badge: 'bg-[#e6f5f2] text-[#0d9488]', soft: 'bg-[#e6f5f2]', darkSoft: 'dark:bg-teal-900/30',   accent: '#0d9488', accentDark: '#0f766e', heroFrom: '#14b8a6', heroTo: '#0f766e' },
};

type Theme = (typeof CATEGORY_THEME)[CategoryKey];

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-bold text-[#1a1d1b] dark:text-white">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function Block({ block, theme }: { block: ArticleBlock; theme: Theme }): React.ReactElement | null {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="mt-12 mb-4 border-l-[5px] pl-4 text-[21px] font-extrabold leading-snug tracking-tight text-[#1a1d1b] dark:text-white md:text-2xl"
            style={{ borderColor: theme.accent }}>
          {block.text}
        </h2>
      );
    case 'paragraph':
      return (
        <p className="mb-6 text-[17px] leading-[1.85] tracking-tight text-[#2b322e] dark:text-slate-300 md:text-[18px]">
          {renderInline(block.text)}
        </p>
      );
    case 'checklist':
      return (
        <div className="my-6 rounded-2xl bg-[#f4f6f4] p-6 dark:bg-navy-900">
          <p className="mb-4 text-[17px] font-extrabold text-[#1a1d1b] dark:text-white">✓ {block.title}</p>
          <ul className="space-y-2.5">
            {block.items.map((it, i) => (
              <li key={i} className="relative pl-4 text-[16px] leading-[1.7] text-[#3a423d] before:absolute before:left-0 before:text-[#9aa39c] before:content-['•'] dark:text-slate-300">
                {renderInline(it)}
              </li>
            ))}
          </ul>
        </div>
      );
    case 'point':
      return (
        <div className={`my-6 rounded-2xl border-l-[5px] ${theme.soft} ${theme.darkSoft} p-5 text-[16.5px] font-semibold leading-[1.75] text-[#1c3b29] dark:text-slate-200`}
             style={{ borderColor: theme.accent }}>
          {renderInline(block.text)}
        </div>
      );
    case 'warning':
      return (
        <div className="my-6 rounded-2xl bg-[#fff4e6] p-5 text-[16.5px] leading-[1.75] text-[#6a4a1c] dark:bg-amber-900/20 dark:text-amber-200">
          {block.title && <p className="mb-1 font-bold text-[#b9791b] dark:text-amber-400">⚠ {block.title}</p>}
          {renderInline(block.text)}
        </div>
      );
    case 'example':
      return (
        <div className={`my-6 whitespace-pre-line rounded-2xl ${theme.soft} ${theme.darkSoft} p-5 text-[16.5px] leading-[1.75] text-[#1c3b29] dark:text-slate-200`}>
          {renderInline(block.text)}
        </div>
      );
    case 'calculator':
      return (
        <a href={block.href}
           className="my-7 flex items-center gap-4 rounded-2xl border-2 bg-white p-5 no-underline transition hover:bg-black/[0.02] dark:bg-navy-800 dark:hover:bg-navy-700"
           style={{ borderColor: theme.accent }}>
          <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${theme.soft} ${theme.darkSoft} text-2xl`}>🧮</span>
          <span className="flex-1">
            <span className="block text-[16.5px] font-extrabold text-[#1a1d1b] dark:text-white">{block.label}</span>
            {block.caption && <span className="block text-[14px] text-[#6b756e] dark:text-slate-400">{block.caption}</span>}
          </span>
          <span className="flex-none" style={{ color: theme.accentDark }}>→</span>
        </a>
      );
    case 'faq':
      return null;
    default:
      return null;
  }
}

function won(n: number) {
  return n.toLocaleString('ko-KR');
}

export default function MoneyPickArticle(props: MoneyPickArticleProps) {
  const {
    categoryKey, categoryLabel, title, date, updateDate, readingTime, views,
    editor = '머니픽 에디터', authorPostCount = 142,
    heroStat, lead, thumbnailUrl, blocks, bodyHtml,
    summary, relatedCalculators, recommendedContent,
    tags, related, disclaimer,
  } = props;

  const theme = CATEGORY_THEME[categoryKey] ?? CATEGORY_THEME.loan;
  const heroStyle: React.CSSProperties = { backgroundColor: theme.heroFrom };

  const bodyBlocks = (blocks ?? []).filter((b) => b.type !== 'faq');
  const faqItems = (blocks ?? [])
    .filter((b): b is Extract<ArticleBlock, { type: 'faq' }> => b.type === 'faq')
    .flatMap((b) => b.items);

  return (
    <article
      className="mp-article w-full bg-white dark:bg-navy-900 md:overflow-hidden md:rounded-3xl md:shadow-[0_10px_40px_rgba(20,60,35,0.08)]"
      style={{ '--mp-accent': theme.accent, '--mp-accent-dark': theme.accentDark } as React.CSSProperties}
    >

      {/* ── 히어로 ── */}
      <header className="relative overflow-hidden px-6 py-8 text-white md:px-12 md:py-11"
              style={heroStyle}>
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="pointer-events-none absolute right-0 top-0 h-[160px] w-auto rounded-bl-2xl object-cover"
          />
        )}
        <div className="relative w-full">
          <span className="inline-block rounded-lg bg-white/20 px-3 py-1.5 text-[13px] font-bold">{categoryLabel}</span>

          {heroStat && (
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-extrabold leading-none tracking-tight md:text-6xl">{heroStat.value}</span>
              <span className="whitespace-pre-line pb-1 text-[15px] font-medium leading-snug text-white/85 md:text-base">{heroStat.label}</span>
            </div>
          )}

          <h1 className="mt-5 text-[26px] font-extrabold leading-[1.4] tracking-tight md:text-[32px]">{title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-5 w-5 rounded-full bg-white/30" />
              {editor}
            </span>
            <span className="text-white/50">|</span>
            <span>{date}</span>
            {readingTime && (<><span className="text-white/50">|</span><span>읽는 시간 {readingTime}</span></>)}
            {views !== undefined && (<><span className="text-white/50">|</span><span>조회수 {won(views)}</span></>)}
            {updateDate && (<><span className="text-white/50">|</span><span>업데이트 {updateDate}</span></>)}
          </div>
        </div>
      </header>

      {/* ── 핵심 요약 박스 ── */}
      {summary && summary.length > 0 && (
        <section className="border-b border-[#d4eddf] bg-[#f0faf5] px-6 py-5 dark:border-green-900/30 dark:bg-green-900/20 md:px-12">
          <p className="mb-3 text-[15px] font-extrabold" style={{ color: theme.accentDark }}>핵심 요약</p>
          <ul className="space-y-2">
            {summary.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[15px] leading-[1.7] text-[#1c3b29] dark:text-slate-200">
                <span className="mt-0.5 flex-none text-[16px] font-extrabold" style={{ color: theme.accent }}>✓</span>
                {renderInline(s)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── 본문 ── */}
      <div className="px-6 py-8 md:px-12">
        <p className="mb-7 text-[18.5px] font-medium leading-[1.8] tracking-tight text-[#33403a] dark:text-slate-200 md:text-[19px]">
          {renderInline(lead)}
        </p>

        {bodyHtml ? (
          <div
            className="mp-body-html prose prose-lg max-w-none text-[#2b322e] dark:text-slate-300"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(bodyHtml) }}
          />
        ) : (
          bodyBlocks.map((block, i) => <Block key={i} block={block} theme={theme} />)
        )}

        {/* ── 관련 계산기 CTA ── */}
        {relatedCalculators && relatedCalculators.length > 0 && (
          <section className="mt-10 rounded-2xl border border-[#c8e8d4] bg-[#f0faf5] p-6 dark:border-green-900/30 dark:bg-green-900/15">
            <p className="mb-4 text-[17px] font-extrabold text-[#1a1d1b] dark:text-white">이 글과 관련된 계산기</p>
            <div className="flex flex-wrap gap-3">
              {relatedCalculators.map((calc, i) => (
                <a key={i} href={calc.href}
                   className="inline-flex items-center gap-2 rounded-xl border border-[#1f9d57] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#1f9d57] transition hover:bg-[#1f9d57] hover:text-white dark:bg-navy-800 dark:hover:bg-[#1f9d57]">
                  🧮 {calc.label}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {faqItems.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-[20px] font-extrabold text-[#1a1d1b] dark:text-white">자주 묻는 질문</h2>
            <div className="overflow-hidden rounded-xl bg-[#0f1a2e]">
              {faqItems.map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-white/[0.07] last:border-b-0"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden">
                    <span className="shrink-0 text-[15px] font-extrabold" style={{ color: theme.accent }}>Q.</span>
                    <span className="flex-1 text-[15px] font-bold text-white">{f.q}</span>
                    <span className="ml-2 shrink-0 text-[22px] font-light leading-none group-open:hidden" style={{ color: theme.accent }}>+</span>
                    <span className="ml-2 hidden shrink-0 text-[22px] font-light leading-none group-open:inline" style={{ color: theme.accent }}>−</span>
                  </summary>
                  <p className="px-5 pb-5 pl-[2.625rem] text-[14px] leading-[1.75] text-slate-400">
                    {renderInline(f.a)}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ── 작성자 소개 ── */}
        <section className="mt-10 rounded-2xl border border-[#e5e7eb] bg-[#fafafa] p-5 dark:border-navy-700 dark:bg-navy-800/60">
          <div className="flex items-center gap-4">
            <div className={`grid h-12 w-12 flex-none place-items-center rounded-full text-2xl ${theme.soft} ${theme.darkSoft}`}>
              ✍️
            </div>
            <div>
              <p className="text-[16px] font-extrabold text-[#1a1d1b] dark:text-white">{editor}</p>
              <p className="text-[13.5px] text-[#6b756e] dark:text-slate-400">
                대출, 부동산, 세금 정보를 쉽고 정확하게 정리합니다.
              </p>
            </div>
          </div>
          <div className="mt-3 border-t border-[#e5e7eb] pt-3 text-[13px] text-[#9aa39c] dark:border-navy-600">
            작성글 {authorPostCount}개
          </div>
        </section>
      </div>

      {/* ── 액션 바 ── */}
      <div className="flex items-center justify-between border-t border-[#eceeec] px-6 py-4 dark:border-navy-700 md:px-12">
        <button type="button" className="rounded-lg border border-[#d7dbd8] bg-white px-4 py-2.5 text-[15px] font-semibold text-[#333] transition hover:bg-[#f4f6f4] dark:border-navy-600 dark:bg-navy-800 dark:text-white dark:hover:bg-navy-700">
          의견 보내기
        </button>
        <div className="flex items-center gap-2">
          {/* 카카오톡 */}
          <button type="button" aria-label="카카오톡 공유"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#fee500] text-[#3c1e1e] transition hover:-translate-y-px hover:opacity-80">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <path d="M9 1.5C4.858 1.5 1.5 4.31 1.5 7.75c0 2.17 1.26 4.08 3.18 5.22l-.78 2.9 2.78-1.39A9.5 9.5 0 009 14.75c4.142 0 7.5-3.04 7.5-6.78C16.5 4.23 13.142 1.5 9 1.5z" />
            </svg>
          </button>
          {/* 페이스북 */}
          <button type="button" aria-label="Facebook 공유"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:-translate-y-px hover:opacity-80">
            <svg width="9" height="17" viewBox="0 0 9 18" fill="currentColor" aria-hidden="true">
              <path d="M6 6V4.5c0-.83.67-1.5 1.5-1.5H9V1H7C5.07 1 3.5 2.57 3.5 4.5V6H1.5v2.5H3.5V17H6V8.5h2L8.5 6H6z" />
            </svg>
          </button>
          {/* X (Twitter) */}
          <button type="button" aria-label="X 공유"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black text-white transition hover:-translate-y-px hover:opacity-80">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M12.6.75h2.454L9.974 6.62 16 15.25h-4.937l-3.653-4.776-4.18 4.776H.775l5.437-6.215L0 .75h5.063l3.3 4.363L12.6.75zm-.86 13.028h1.36L4.323 2.145H2.865L11.74 13.778z" />
            </svg>
          </button>
          {/* 링크 복사 */}
          <button type="button" aria-label="링크 복사"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#e5e7eb] bg-transparent text-[#6b7280] transition hover:-translate-y-px hover:opacity-80 dark:border-[#1a3050] dark:text-slate-400">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6.5 9.5a3.5 3.5 0 004.95 0l1.5-1.5a3.5 3.5 0 00-4.95-4.95l-.75.75" />
              <path d="M9.5 6.5a3.5 3.5 0 00-4.95 0l-1.5 1.5a3.5 3.5 0 004.95 4.95l.75-.75" />
            </svg>
          </button>
          {/* 저장 */}
          <button type="button" aria-label="저장"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#e5e7eb] bg-transparent text-[#6b7280] transition hover:-translate-y-px hover:opacity-80 dark:border-[#1a3050] dark:text-slate-400">
            <svg width="13" height="16" viewBox="0 0 13 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1.5 2.5h10a1 1 0 011 1v12l-5.5-2.75L1.5 15.5v-12a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── 추천 콘텐츠 4카드 ── */}
      {recommendedContent && recommendedContent.length > 0 && (
        <section className="border-t-8 border-[#f1f3f1] px-6 py-8 dark:border-navy-800 md:px-12">
          <h3 className="mb-5 text-[20px] font-extrabold text-[#1a1d1b] dark:text-white">이 글과 함께 보면 좋은 콘텐츠</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recommendedContent.map((item, i) => (
              <a key={i} href={item.href}
                 className="group overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
                <div className="flex aspect-[4/3] items-center justify-center bg-[#f4f6f4] text-4xl dark:bg-navy-900">
                  {item.emoji ?? '📄'}
                </div>
                <div className="p-3">
                  <span className="text-[11px] font-bold" style={{ color: theme.accent }}>{item.category}</span>
                  <p className="mt-1 text-[13px] font-bold leading-snug text-[#1a1d1b] dark:text-white">{item.title}</p>
                  {item.views !== undefined && (
                    <p className="mt-1.5 text-[11px] text-[#9aa39c]">조회 {won(item.views)}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 관련 태그 ── */}
      {tags && tags.length > 0 && (
        <section className="border-t-8 border-[#f1f3f1] px-6 py-7 dark:border-navy-800 md:px-12">
          <h3 className="mb-4 text-[20px] font-extrabold text-[#1a1d1b] dark:text-white">관련 태그</h3>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((t, i) => (
              <a key={i} href={`/search?q=${encodeURIComponent(t)}`}
                 className="rounded-[10px] bg-[#f1f3f1] px-4 py-2.5 text-[15px] font-medium text-[#3c443f] transition hover:bg-[#e1e9e4] dark:bg-navy-700 dark:text-slate-300 dark:hover:bg-navy-600">
                {t}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 추천 이야기 (recommendedContent 없을 때 폴백) ── */}
      {related && related.length > 0 && !recommendedContent && (
        <section className="border-t-8 border-[#f1f3f1] px-6 py-7 dark:border-navy-800 md:px-12">
          <h3 className="mb-4 text-[20px] font-extrabold text-[#1a1d1b] dark:text-white">추천 이야기</h3>
          <div className="rounded-2xl border border-[#eceeec] p-5 dark:border-navy-700">
            <p className="mb-4 text-[16px] font-extrabold" style={{ color: theme.accentDark }}>
              {categoryLabel} <span className="text-[#1a1d1b] dark:text-white">관련글</span>
            </p>
            {related.map((r, i) => (
              <a key={i} href={r.href}
                 className="flex items-center gap-4 py-3 text-inherit no-underline [&+&]:border-t [&+&]:border-[#f1f3f1] dark:[&+&]:border-navy-700">
                <span className={`grid h-16 w-16 flex-none place-items-center rounded-xl text-3xl ${theme.soft} ${theme.darkSoft}`}>{r.emoji ?? '📄'}</span>
                <span className="text-[16.5px] font-semibold leading-snug text-[#1a1d1b] dark:text-slate-200">{r.title}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 투자 유의 안내 (invest 카테고리 전용) ── */}
      {categoryKey === 'invest' && (
        <div className="px-6 md:px-12">
          <p className="mp-invest-notice">
            ※ 본 콘텐츠는 정보 제공을 목적으로 하며 투자 권유가 아닙니다. 모든 투자의 최종 판단과 책임은 본인에게 있으며, 원금 손실이 발생할 수 있습니다.
          </p>
        </div>
      )}

      {/* ── 꼭 알아두세요 ── */}
      {disclaimer && (
        <section className="border-t-8 border-[#f1f3f1] px-6 py-7 pb-16 dark:border-navy-800 md:px-12">
          <h3 className="mb-3 text-[18px] font-extrabold text-[#1a1d1b] dark:text-white">꼭 알아두세요</h3>
          <p className="text-[13.5px] leading-[1.7] text-[#6b756e] dark:text-slate-400">{disclaimer}</p>
        </section>
      )}
    </article>
  );
}
