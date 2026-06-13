import { createClient } from '@supabase/supabase-js';
import type { Post } from '@/src/types';
import { allPosts, popularPosts, latestPosts } from '@/src/data/posts';
import { notices as staticNotices } from '@/src/data/notices';

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function sanitizeSlug(raw: string): string {
  return raw.replace(/[?:*"<>|\\]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(row: any): Post {
  const rawSlug = String(row.slug || row.id);
  return {
    id: String(row.id),
    title: String(row.title),
    slug: sanitizeSlug(rawSlug),
    postNumber: row.post_number ? Number(row.post_number) : undefined,
    englishSlug: row.english_slug ? String(row.english_slug) : undefined,
    categoryId: String(row.category_id || ''),
    authorId: '1',
    summary: [],
    content: String(row.content || ''),
    thumbnail: String(row.thumbnail || ''),
    metaDescription: String(row.meta_description || ''),
    status: row.status ?? 'draft',
    sourceDate: String(row.created_at || '').slice(0, 10),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    views: Number(row.views || 0),
  };
}

export async function getPopularPosts(limit = 5): Promise<Post[]> {
  try {
    const { data } = await client().from('posts').select().eq('status', 'published').order('views', { ascending: false }).limit(limit);
    if (data?.length) return data.map(rowToPost);
  } catch {}
  return popularPosts.slice(0, limit);
}

export async function getLatestPosts(limit = 5): Promise<Post[]> {
  try {
    const { data } = await client().from('posts').select().eq('status', 'published').order('created_at', { ascending: false }).limit(limit);
    if (data?.length) return data.map(rowToPost);
  } catch {}
  return latestPosts.slice(0, limit);
}

export async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  try {
    const { data } = await client().from('posts').select().eq('category_id', categoryId).eq('status', 'published').order('updated_at', { ascending: false });
    if (data?.length) return data.map(rowToPost);
  } catch {}
  return allPosts.filter((p) => p.categoryId === categoryId && p.status === 'published');
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await client().from('posts').select().eq('slug', slug).maybeSingle();
    if (error) console.error('[db] getPostBySlug error:', slug, error.message);
    if (data) return rowToPost(data);
  } catch (e) {
    console.error('[db] getPostBySlug exception:', slug, e);
  }
  return allPosts.find((p) => p.slug === slug) ?? null;
}

export async function getAllPublishedPosts(limit = 50): Promise<Post[]> {
  try {
    const { data } = await client().from('posts').select().eq('status', 'published').order('updated_at', { ascending: false }).limit(limit);
    if (data?.length) return data.map(rowToPost);
  } catch {}
  return allPosts.filter((p) => p.status === 'published');
}

/** /{categoryEn}/{postNumber}-{englishSlug} 경로로 단건 조회 */
export async function getPostByNumberSlug(postNumber: number, englishSlug: string): Promise<Post | null> {
  try {
    const { data, error } = await client()
      .from('posts')
      .select()
      .eq('post_number', postNumber)
      .eq('english_slug', englishSlug)
      .maybeSingle();
    if (error) console.error('[db] getPostByNumberSlug error:', error.message);
    if (data) return rowToPost(data);
  } catch (e) {
    console.error('[db] getPostByNumberSlug exception:', e);
  }
  return null;
}

export async function getNotices() {
  try {
    const { data } = await client().from('notices').select().eq('visible', true).order('created_at', { ascending: false }).limit(5);
    if (data?.length) return data.map((r) => ({ id: String(r.id), title: String(r.title), date: String(r.created_at).slice(0, 10), type: 'info' as const }));
  } catch {}
  return staticNotices;
}
