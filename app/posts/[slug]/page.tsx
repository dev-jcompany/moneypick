import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import FaqAccordion from '@/components/FaqAccordion';
import JsonLd from '@/components/JsonLd';
import PostCard from '@/components/PostCard';
import { categories } from '@/src/data/categories';
import { faqs } from '@/src/data/faqs';
import { allPosts } from '@/src/data/posts';

interface Props { params: Promise<{ slug: string }> }
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://moneypick.kr';

export function generateStaticParams() {
  return allPosts.filter((post) => post.status === 'published').map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = allPosts.find((item) => item.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: { title: post.title, description: post.metaDescription, type: 'article', publishedTime: post.createdAt, modifiedTime: post.updatedAt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = allPosts.find((item) => item.slug === slug);
  if (!post) notFound();
  const category = categories.find((item) => item.id === post.categoryId);
  const postFaqs = faqs.filter((item) => item.postId === post.id).sort((a, b) => a.sortOrder - b.sortOrder);
  const related = allPosts.filter((item) => item.id !== post.id && item.categoryId === post.categoryId).slice(0, 3);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${siteUrl}/posts/${post.slug}`,
    author: { '@type': 'Organization', name: '머니픽' },
    publisher: { '@type': 'Organization', name: '머니픽' },
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 md:py-14">
      <JsonLd data={articleJsonLd} />
      {postFaqs.length > 0 && <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: postFaqs.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) }} />}
      <Breadcrumb items={[{ label: category?.name ?? '콘텐츠', href: category ? `/${category.slug}` : '/posts' }, { label: post.title }]} />
      <article className="mx-auto max-w-[760px]">
        <header className="mb-8">
          <span className="mb-3 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#21A05A] dark:bg-green-900/20">{category?.name}</span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-[#1A1D1F] dark:text-white md:text-4xl">{post.title}</h1>
          <div className="flex gap-3 text-xs text-[#8A949E]"><time>{new Date(post.updatedAt).toLocaleDateString('ko-KR')}</time><span>조회 {post.views.toLocaleString()}</span></div>
        </header>
        {post.thumbnail && <img src={post.thumbnail} alt="" className="mb-8 aspect-[16/9] w-full rounded-3xl object-cover" />}
        <section className="mb-9 rounded-2xl border border-green-100 bg-green-50 p-6 dark:border-green-900/30 dark:bg-green-900/10">
          <h2 className="mb-3 font-bold text-[#17794A] dark:text-primary-light">핵심 요약</h2>
          <ul className="space-y-2">{post.summary.map((line) => <li key={line} className="flex gap-2 text-sm leading-6"><span className="font-bold text-[#21A05A]">✓</span>{line}</li>)}</ul>
        </section>
        <div className="space-y-8 text-[16px] leading-8 text-[#343A40] dark:text-slate-300">
          <p>{post.metaDescription} 아래 내용은 제도를 이해하고 본인 상황을 점검하기 위한 일반적인 안내입니다.</p>
          {post.summary.map((line, index) => (
            <section key={line}>
              <h2 className="mb-3 text-xl font-bold text-[#1A1D1F] dark:text-white">{index + 1}. {line}</h2>
              <p>조건과 계산 기준은 소득, 보유 자산, 계약 형태와 적용 시점에 따라 달라질 수 있습니다. 숫자를 비교할 때는 같은 기준일과 같은 상환 조건을 사용하고, 신청 전에는 반드시 공식 기관 또는 금융회사에서 최신 기준을 확인하세요.</p>
            </section>
          ))}
          <aside className="rounded-2xl bg-[#F6F8FA] p-5 text-sm leading-7 text-[#5B6168] dark:bg-navy-800 dark:text-slate-400">본 콘텐츠는 일반 정보 제공을 목적으로 하며 금융·세무·법률 자문이 아닙니다. 중요한 의사결정은 자격을 갖춘 전문가와 상의하세요.</aside>
        </div>
        {postFaqs.length > 0 && <section className="mt-12"><h2 className="mb-5 text-2xl font-bold">자주 묻는 질문</h2><FaqAccordion items={postFaqs} /></section>}
      </article>
      {related.length > 0 && <section className="mt-16"><h2 className="mb-5 text-xl font-bold">같이 읽으면 좋은 글</h2><div className="grid gap-5 sm:grid-cols-3">{related.map((item) => <PostCard key={item.id} post={item} />)}</div></section>}
    </div>
  );
}
