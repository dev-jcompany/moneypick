'use client';

import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import PostCard from '@/components/PostCard';
import type { Post } from '@/src/types';
import { categories } from '@/src/data/categories';

export default function SearchClient({ posts, initialQuery = '' }: { posts: Post[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const documents = useMemo(() => posts.map((post) => ({ ...post, categoryName: categories.find((item) => item.id === post.categoryId)?.name ?? '' })), [posts]);
  const fuse = useMemo(() => new Fuse(documents, { keys: [{ name: 'title', weight: 0.5 }, { name: 'summary', weight: 0.25 }, { name: 'metaDescription', weight: 0.15 }, { name: 'categoryName', weight: 0.1 }], threshold: 0.35, ignoreLocation: true }), [documents]);
  const results = query.trim() ? fuse.search(query.trim()).map((result) => result.item) : documents;

  return (
    <>
      <div className="relative mb-8">
        <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="전세대출, DSR, ISA 등을 검색해보세요" className="w-full rounded-2xl border border-[#DDE3EB] bg-white px-5 py-4 pr-14 text-base outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 dark:border-navy-600 dark:bg-navy-800" />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8A949E]" aria-hidden="true">⌕</span>
      </div>
      <p className="mb-5 text-sm text-[#5B6168] dark:text-slate-400">{query ? <><strong className="text-[#21A05A]">“{query}”</strong> 검색 결과 {results.length}개</> : `전체 콘텐츠 ${results.length}개`}</p>
      {results.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{results.map((post) => <PostCard key={post.id} post={post} />)}</div> : <div className="rounded-2xl border border-dashed border-[#DDE3EB] p-12 text-center text-sm text-[#8A949E] dark:border-navy-600">검색 결과가 없습니다. 다른 단어로 검색해보세요.</div>}
    </>
  );
}
