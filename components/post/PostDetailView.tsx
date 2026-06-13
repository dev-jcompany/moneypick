import Link from 'next/link';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import AdColumn from '@/components/post/AdColumn';
import NewsletterForm from '@/components/post/NewsletterForm';
import PostSidebar from '@/components/post/PostSidebar';
import { categories } from '@/src/data/categories';
import { calculators } from '@/src/data/calculators';
import { faqs } from '@/src/data/faqs';
import { getPostUrl } from '@/lib/url';
import { sanitizePostHtml } from '@/lib/sanitize';
import type { Post } from '@/src/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moneypick.kr';

const SHARE_ICONS = [
  {
    label: '카카오',
    bg: 'bg-[#FEE500] text-[#3C1E1E]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.74 1.63 5.14 4.08 6.55l-.94 3.45a.3.3 0 0 0 .45.34L9.6 18.9A11.6 11.6 0 0 0 12 19.2c5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
      </svg>
    ),
  },
  {
    label: '페이스북',
    bg: 'bg-[#1877F2] text-white',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'X(트위터)',
    bg: 'bg-[#1A1D1F] text-white',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

interface Props {
  post: Post;
  popular: Post[];
  categoryPosts: Post[];
  canonicalUrl?: string;
}

export default function PostDetailView({ post, popular, categoryPosts, canonicalUrl }: Props) {
  const category = categories.find((c) => c.id === post.categoryId);
  const postFaqs = faqs
    .filter((f) => f.postId === post.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const relatedFiltered = categoryPosts.filter((p) => p.id !== post.id).slice(0, 4);
  const summaryArr = Array.isArray(post.summary) ? post.summary : [];

  const catMap: Record<string, string[]> = {
    '1': ['jeonse-loan', 'dsr'],
    '2': ['brokerage-fee'],
    '3': ['car-tax'],
    '4': ['unemployment-benefit', 'salary'],
    '5': ['salary'],
  };
  const relatedCalcs = calculators.filter((c) =>
    catMap[post.categoryId]?.includes(c.slug) ?? false
  ).slice(0, 5);
  const displayCalcs = relatedCalcs.length >= 3 ? relatedCalcs : calculators.slice(0, 5);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: canonicalUrl ?? `${siteUrl}${getPostUrl(post)}`,
    author: { '@type': 'Organization', name: '머니픽' },
    publisher: { '@type': 'Organization', name: '머니픽' },
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <JsonLd data={articleJsonLd} />
      {postFaqs.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: postFaqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }}
        />
      )}

      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6 lg:px-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,800px)_280px] lg:justify-center xl:grid-cols-[minmax(760px,800px)_minmax(340px,360px)] xl:gap-8 widescreen:grid-cols-[760px_300px_minmax(280px,300px)]">

          {/* ── LEFT: 기사 본문 ── */}
          <article className="min-w-0">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-[#8A949E]">
              <Link href="/" className="hover:text-[#21A05A]">홈</Link>
              <span>/</span>
              {category && (
                <>
                  <Link href={`/${category.enSlug}`} className="hover:text-[#21A05A]">{category.name}</Link>
                  <span>/</span>
                </>
              )}
              <span className="line-clamp-1 text-[#5B6168]">{post.title}</span>
            </nav>

            {/* Card */}
            <div className="rounded-2xl border border-[#E8ECEF] bg-white shadow-sm">
              {/* Header */}
              <div className="border-b border-[#F0F4F2] p-6 pb-5 md:p-8 md:pb-6">
                {category && (
                  <span className="mb-3 inline-block rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-[#21A05A]">
                    {category.icon} {category.name}
                  </span>
                )}
                <h1 className="mb-4 text-[22px] font-extrabold leading-tight text-[#1A1D1F] md:text-[28px]">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[12px] text-[#8A949E]">
                    <span className="font-medium text-[#5B6168]">머니픽 에디터</span>
                    <span>|</span>
                    <time>{new Date(post.updatedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</time>
                    <span>|</span>
                    <span>조회수 {post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {SHARE_ICONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        title={s.label}
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${s.bg} transition-opacity hover:opacity-80`}
                      >
                        {s.icon}
                      </button>
                    ))}
                    <button type="button" title="링크 복사" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DDE3EB] bg-white text-[#5B6168] hover:bg-[#F1F5F3]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                    <button type="button" title="북마크" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DDE3EB] bg-white text-[#5B6168] hover:bg-[#F1F5F3]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero image */}
              {post.thumbnail && (
                <div className="overflow-hidden">
                  <img src={post.thumbnail} alt={post.title} className="aspect-[16/7] w-full object-cover" />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* 핵심 요약 */}
                {summaryArr.length > 0 && (
                  <section className="mb-8 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-[#F0FDF4] p-5 md:p-6">
                    <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-[#17794A]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#21A05A] text-[10px] font-black text-white">✓</span>
                      핵심 요약
                    </h2>
                    <ul className="space-y-2">
                      {summaryArr.map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#2D4A3E]">
                          <span className="mt-0.5 font-bold text-[#21A05A]">✓</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* 본문 */}
                {post.content ? (
                  <div
                    className="post-content prose prose-slate max-w-none
                      prose-headings:font-extrabold prose-headings:text-[#1A1D1F]
                      prose-h2:text-[20px] prose-h2:mt-8 prose-h2:mb-3
                      prose-h3:text-[17px] prose-h3:mt-6 prose-h3:mb-2
                      prose-p:text-[15px] prose-p:leading-[1.9] prose-p:text-[#343A40]
                      prose-li:text-[15px] prose-li:leading-[1.8] prose-li:text-[#343A40]
                      prose-a:text-[#21A05A] prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-2xl prose-img:shadow-sm
                      prose-blockquote:border-[#21A05A] prose-blockquote:bg-[#F3F8F5] prose-blockquote:rounded-xl prose-blockquote:not-italic"
                    dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }}
                  />
                ) : (
                  <div className="space-y-7 text-[15px] leading-[1.9] text-[#343A40]">
                    <p className="text-[16px] leading-[1.9] text-[#5B6168]">{post.metaDescription}</p>
                    {summaryArr.map((line, i) => (
                      <section key={i}>
                        <h2 className="mb-3 text-[20px] font-extrabold text-[#1A1D1F]">{i + 1}. {line}</h2>
                        <p>조건과 계산 기준은 소득, 보유 자산, 계약 형태와 적용 시점에 따라 달라질 수 있습니다. 최신 정보는 관계 기관 공식 안내를 통해 확인하시기 바랍니다.</p>
                      </section>
                    ))}
                    {summaryArr.length === 0 && <p>곧 자세한 콘텐츠가 업데이트됩니다.</p>}
                  </div>
                )}

                {/* 모바일에서는 사이드바 대신 본문 흐름 안에 광고 표시 */}
                <div className="my-8 flex items-center justify-center rounded-2xl border border-dashed border-[#DDE3EB] bg-[#F9FAFB] p-4 text-[12px] text-[#8A949E] lg:hidden">
                  광고 영역 300×250
                </div>

                {/* 관련 계산기 CTA */}
                {displayCalcs.length > 0 && (
                  <section className="mt-10 rounded-2xl border border-[#DDE5E1] bg-[#F6FBF8] p-5 md:p-6">
                    <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#21A05A]">관련 계산기</p>
                    <h3 className="mb-4 text-[16px] font-extrabold text-[#1A1D1F]">직접 계산해보세요</h3>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {displayCalcs.slice(0, 3).map((calc) => (
                        <Link
                          key={calc.id}
                          href={`/calculators/${calc.slug}`}
                          className="flex items-center gap-2.5 rounded-xl border border-[#DDE5E1] bg-white px-3.5 py-3 text-[13px] font-bold text-[#1A1D1F] transition-all hover:border-[#21A05A] hover:text-[#21A05A] hover:shadow-sm"
                        >
                          <span className="text-lg leading-none">{calc.icon}</span>
                          <span className="leading-tight">{calc.name}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* FAQ */}
                {postFaqs.length > 0 && (
                  <section className="mt-10">
                    <h2 className="mb-5 text-[20px] font-extrabold text-[#1A1D1F]">자주 묻는 질문</h2>
                    <FaqAccordion items={postFaqs} />
                  </section>
                )}

                {/* 출처 안내 */}
                <aside className="mt-10 rounded-2xl bg-[#F6F8FA] p-4 text-[12px] leading-6 text-[#8A949E]">
                  본 콘텐츠는 일반 정보 제공을 목적으로 하며 금융·세무·법률 자문이 아닙니다. 개인 상황에 맞는 전문가 상담을 권장합니다.
                </aside>
              </div>
            </div>
          </article>

          {/* ── CENTER: 광고 ── */}
          <AdColumn />

          {/* ── RIGHT: 사이드바 ── */}
          <PostSidebar popular={popular} categoryPosts={categoryPosts} currentPostId={post.id} />
        </div>

        {/* ── BOTTOM SECTIONS ── */}
        <div className="mt-8 space-y-6">

          {/* 이 글과 함께 보면 좋은 콘텐츠 */}
          {relatedFiltered.length > 0 && (
            <section className="rounded-2xl border border-[#E8ECEF] bg-white p-6 md:p-8">
              <h2 className="mb-5 text-[18px] font-extrabold text-[#1A1D1F]">이 글과 함께 보면 좋은 콘텐츠</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {relatedFiltered.map((item) => {
                  const cat = categories.find((c) => c.id === item.categoryId);
                  return (
                    <Link key={item.id} href={getPostUrl(item)} className="group block">
                      <div className="mb-3 overflow-hidden rounded-xl">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#E8F5EE] to-[#F1F5F3]" />
                        )}
                      </div>
                      {cat && <span className="mb-1.5 inline-block text-[10px] font-bold text-[#21A05A]">{cat.name}</span>}
                      <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[#1A1D1F] group-hover:text-[#21A05A]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-[#94A3B8]">조회수 {item.views.toLocaleString()}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 뉴스레터 + 카카오 */}
          <div className="grid gap-4 md:grid-cols-2">
            <section className="flex flex-col justify-between rounded-2xl border border-[#DDE5E1] bg-white p-6">
              <div>
                <span className="mb-2 inline-block rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-[#21A05A]">머니픽 뉴스레터</span>
                <h3 className="mt-1 text-[17px] font-extrabold text-[#1A1D1F]">금융·재테크 정보를 이메일로 받아보세요!</h3>
                <p className="mt-1.5 text-[13px] text-[#8A949E]">주 1회, 꼭 필요한 금융 정보만 골라 보내드립니다.</p>
              </div>
              <NewsletterForm />
            </section>
            <section className="flex items-center justify-between rounded-2xl bg-[#1A1D1F] p-6 text-white">
              <div>
                <span className="mb-2 inline-block rounded-full bg-[#FEE500]/20 px-3 py-1 text-[10px] font-bold text-[#FEE500]">카카오톡 채널</span>
                <h3 className="mt-1 text-[17px] font-extrabold">카카오톡 채널 추가하고<br />실시간 금융 정보를 받아보세요!</h3>
              </div>
              <button type="button" className="ml-4 shrink-0 rounded-2xl bg-[#FEE500] px-5 py-3 text-[13px] font-bold text-[#3C1E1E] hover:bg-yellow-300">
                채널 추가
              </button>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
