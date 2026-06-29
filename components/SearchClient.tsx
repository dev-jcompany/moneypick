'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import PostCard from '@/components/PostCard';
import { getArticleUrl } from '@/lib/article-url';
import type { Post } from '@/src/types';
import type { StaticArticle } from '@/src/data/articles';
import { categories } from '@/src/data/categories';

type SearchDoc =
  | { _type: 'post'; id: string; title: string; summary: string; metaDescription: string; categoryName: string; post: Post }
  | { _type: 'article'; id: string; title: string; summary: string; metaDescription: string; categoryName: string; article: StaticArticle };

export default function SearchClient({
  posts,
  articles = [],
  initialQuery = '',
}: {
  posts: Post[];
  articles?: StaticArticle[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  const documents = useMemo<SearchDoc[]>(() => {
    const postDocs: SearchDoc[] = posts.map((post) => ({
      _type: 'post',
      id: `post-${post.id}`,
      title: post.title,
      summary: Array.isArray(post.summary) ? post.summary.join(' ') : (post.summary ?? ''),
      metaDescription: post.metaDescription ?? '',
      categoryName: categories.find((c) => c.id === post.categoryId)?.name ?? '',
      post,
    }));
    const articleDocs: SearchDoc[] = articles.map((article) => ({
      _type: 'article',
      id: `article-${article.slug}`,
      title: article.title,
      summary: article.lead.replace(/\*\*/g, ''),
      metaDescription: article.lead.replace(/\*\*/g, ''),
      categoryName: categories.find((c) => c.enSlug === article.categoryEnSlug)?.name ?? '',
      article,
    }));
    return [...postDocs, ...articleDocs];
  }, [posts, articles]);

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'summary', weight: 0.3 },
          { name: 'metaDescription', weight: 0.1 },
          { name: 'categoryName', weight: 0.1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [documents],
  );

  const results = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : documents;

  return (
    <>
      <div className="relative mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="전세대출, DSR, ISA 등을 검색해보세요"
          className="w-full rounded-2xl border border-[#DDE3EB] bg-white px-5 py-4 pr-14 text-base outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 dark:border-navy-600 dark:bg-navy-800"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8A949E]" aria-hidden="true">⌕</span>
      </div>
      <p className="mb-5 text-sm text-[#5B6168] dark:text-slate-400">
        {query ? <><strong className="text-[#21A05A]">&quot;{query}&quot;</strong> 검색 결과 {results.length}개</> : `전체 콘텐츠 ${results.length}개`}
      </p>
      {results.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((doc) =>
            doc._type === 'post' ? (
              <PostCard key={doc.id} post={doc.post} />
            ) : (
              <article key={doc.id} className="h-full overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800">
                <Link href={getArticleUrl(doc.article.categoryKey, doc.article.slug)} className="flex h-full flex-col p-5">
                  <div className="mb-2 flex items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-green-50 px-2 py-1 font-semibold text-[#21A05A] dark:bg-green-900/20">{doc.categoryName}</span>
                    <time className="text-[#8A949E]">{doc.article.date}</time>
                    {doc.article.readingTime && <span className="text-[#8A949E]">· {doc.article.readingTime}</span>}
                  </div>
                  <h2 className="mb-2 text-[16px] font-bold leading-snug text-[#1A1D1F] dark:text-white">{doc.article.title}</h2>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-[#5B6168] dark:text-slate-400">
                    {doc.article.lead.replace(/\*\*/g, '')}
                  </p>
                  <span className="mt-4 text-xs font-bold text-[#21A05A]">자세히 보기 →</span>
                </Link>
              </article>
            ),
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#DDE3EB] p-12 text-center text-sm text-[#8A949E] dark:border-navy-600">
          검색 결과가 없습니다. 다른 단어로 검색해보세요.
        </div>
      )}
    </>
  );
}
