import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { categories } from '@/src/data/categories';
import { getPostByNumberSlug, getPostsByCategory, getPopularPosts } from '@/lib/db';
// 공통 렌더러를 재사용
import PostDetailView from '@/components/post/PostDetailView';

interface Props {
  params: Promise<{ categoryEn: string; postId: string }>;
}

/** "1234-dsr-guide" → { postNumber: 1234, englishSlug: "dsr-guide" } */
function parsePostId(postId: string): { postNumber: number; englishSlug: string } | null {
  const match = postId.match(/^(\d+)-(.+)$/);
  if (!match) return null;
  const postNumber = parseInt(match[1], 10);
  if (isNaN(postNumber)) return null;
  return { postNumber, englishSlug: match[2] };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const parsed = parsePostId(postId);
  if (!parsed) return {};
  const post = await getPostByNumberSlug(parsed.postNumber, parsed.englishSlug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/${categories.find((c) => c.id === post.categoryId)?.enSlug}/${postId}` },
    openGraph: { title: post.title, description: post.metaDescription, type: 'article' },
  };
}

export default async function PostByNumberPage({ params }: Props) {
  const { categoryEn, postId } = await params;

  // categoryEn 유효성 검사
  const cat = categories.find((c) => c.enSlug === categoryEn);
  if (!cat) notFound();

  const parsed = parsePostId(postId);
  if (!parsed) notFound();

  const post = await getPostByNumberSlug(parsed.postNumber, parsed.englishSlug);
  if (!post) notFound();

  // 카테고리 불일치 → 올바른 URL로 리디렉션
  const correctCat = categories.find((c) => c.id === post.categoryId);
  if (correctCat && correctCat.enSlug !== categoryEn) {
    redirect(`/${correctCat.enSlug}/${postId}`);
  }

  const [popular, categoryPosts] = await Promise.all([
    getPopularPosts(5),
    getPostsByCategory(post.categoryId),
  ]);

  return (
    <PostDetailView
      post={post}
      popular={popular}
      categoryPosts={categoryPosts}
    />
  );
}
