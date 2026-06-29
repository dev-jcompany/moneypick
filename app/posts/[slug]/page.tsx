import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostDetailView from '@/components/post/PostDetailView';
import { getPostBySlug, getPostsByCategory, getPopularPosts } from '@/lib/db';
import { siteUrl } from '@/lib/site';

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: { title: post.title, description: post.metaDescription, type: 'article', publishedTime: post.createdAt, modifiedTime: post.updatedAt },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [popular, categoryPosts] = await Promise.all([
    getPopularPosts(5),
    getPostsByCategory(post.categoryId),
  ]);

  return (
    <PostDetailView
      post={post}
      popular={popular}
      categoryPosts={categoryPosts}
      canonicalUrl={`${siteUrl}/posts/${post.slug}`}
    />
  );
}
