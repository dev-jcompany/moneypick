import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import type { Category, Post } from '@/src/types';
import type { MoneypickArticleRow, MoneyPickArticleProps, CategoryKey } from '@/components/moneypick/types';
import { normalizeRelatedCalculators } from '@/lib/article-calculators';
import { allPosts, popularPosts, latestPosts } from '@/src/data/posts';
import { categories as staticCategories } from '@/src/data/categories';
import { notices as staticNotices } from '@/src/data/notices';
import type { ContactInquiryType } from '@/lib/contact-inquiries';

const CONTACT_INQUIRY_STORAGE_BUCKET = 'contact-inquiries';
const CONTACT_INQUIRY_STORAGE_PREFIX = 'inquiries';

function client() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function serverClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function sanitizeSlug(raw: string): string {
  return raw.replace(/[?:*"<>|\\]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToCategory(row: any): Category {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug || row.name),
    enSlug: String(row.en_slug || row.enSlug || row.slug || ''),
    icon: String(row.icon || '💡'),
    description: String(row.description || ''),
    color: String(row.color || 'green'),
    enabled: row.enabled !== false,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
  };
}

function fallbackCategories(visibleOnly: boolean) {
  return staticCategories
    .map((category, index) => ({
      ...category,
      enabled: category.enabled ?? true,
      sortOrder: category.sortOrder ?? index + 1,
    }))
    .filter((category) => !visibleOnly || category.enabled !== false);
}

function isMissingCategoriesTable(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? '';
  return error?.code === 'PGRST205' || error?.code === '42P01' || message.includes('moneypick_categories');
}

export type CategorySavePayload = {
  name: string;
  slug: string;
  en_slug: string;
  icon: string;
  description: string;
  color: string;
  enabled: boolean;
  sort_order: number;
};

export async function getCategories(options: { visibleOnly?: boolean } = {}): Promise<Category[]> {
  const visibleOnly = options.visibleOnly ?? false;
  try {
    let query = client()
      .from('moneypick_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (visibleOnly) query = query.eq('enabled', true);

    const { data, error } = await query;
    if (error) {
      if (!isMissingCategoriesTable(error)) console.error('[db] getCategories:', error.message);
      return fallbackCategories(visibleOnly);
    }
    if (data?.length) return data.map(rowToCategory);
  } catch (e) {
    console.error('[db] getCategories exception:', e);
  }
  return fallbackCategories(visibleOnly);
}

export async function getVisibleCategories() {
  return getCategories({ visibleOnly: true });
}

export async function getVisibleCategoryByPath(enSlug: string): Promise<Category | null> {
  const categories = await getVisibleCategories();
  return categories.find((category) => category.enSlug === decodeURIComponent(enSlug)) ?? null;
}

export async function createCategory(payload: CategorySavePayload): Promise<{ id: string | null; error?: string; code?: string }> {
  try {
    const { data, error } = await client()
      .from('moneypick_categories')
      .insert(payload)
      .select('id')
      .single();
    if (error) return { id: null, error: error.message, code: error.code };
    return { id: data?.id ?? null };
  } catch (e) {
    return { id: null, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateCategory(id: string, payload: Partial<CategorySavePayload>): Promise<{ ok: boolean; error?: string; code?: string }> {
  try {
    const { error } = await client().from('moneypick_categories').update(payload).eq('id', id);
    if (error) return { ok: false, error: error.message, code: error.code };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await client().from('moneypick_categories').delete().eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
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

// ── moneypick_articles ──────────────────────────────

function rowToArticleProps(row: MoneypickArticleRow): MoneyPickArticleProps & { _id: string; _slug: string; _status: string } {
  return {
    _id: row.id,
    _slug: row.slug,
    _status: row.status,
    categoryKey: row.category_key as CategoryKey,
    categoryLabel: row.category_label,
    title: row.title,
    date: row.created_at.slice(0, 10).replace(/-/g, '.'),
    updateDate: row.updated_at.slice(0, 10).replace(/-/g, '.'),
    readingTime: row.reading_time ?? undefined,
    views: row.views,
    editor: row.editor,
    lead: row.lead,
    metaDescription: row.meta_description ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    bodyHtml: row.body_html,
    heroStat: row.hero_value ? { value: row.hero_value, label: row.hero_label ?? '' } : undefined,
    summary: row.summary ?? [],
    blocks: row.faq?.length
      ? [{ type: 'faq' as const, items: row.faq }]
      : undefined,
    tags: row.tags ?? [],
    relatedCalculators: normalizeRelatedCalculators(row.related_calculators, row.category_key),
    disclaimer: row.disclaimer ?? undefined,
  };
}

export async function getMoneypickArticleBySlug(slug: string): Promise<(MoneyPickArticleProps & { _id: string; _slug: string; _status: string }) | null> {
  try {
    const { data, error } = await client()
      .from('moneypick_articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) console.error('[db] getMoneypickArticleBySlug:', error.message);
    if (data) return rowToArticleProps(data as MoneypickArticleRow);
  } catch (e) {
    console.error('[db] getMoneypickArticleBySlug exception:', e);
  }
  return null;
}

export type ArticleCard = {
  id: string; slug: string; title: string; lead: string;
  category_key: CategoryKey; category_label: string; reading_time: string | null;
  thumbnail_url: string | null; created_at: string;
};

export async function getMoneypickArticlesByCategory(
  categoryKey: string,
  excludeSlug: string,
  limit = 4,
): Promise<ArticleCard[]> {
  try {
    const supabase = client();
    const { data, error } = await supabase
      .from('moneypick_articles')
      .select('id, slug, title, lead, category_key, category_label, reading_time, thumbnail_url, created_at')
      .eq('category_key', categoryKey)
      .eq('status', 'published')
      .neq('slug', excludeSlug)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (isMissingOptionalArticleColumn(error)) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('moneypick_articles')
          .select('id, slug, title, lead, category_key, category_label, reading_time, created_at')
          .eq('category_key', categoryKey)
          .eq('status', 'published')
          .neq('slug', excludeSlug)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (fallbackError) {
          console.error('[db] getMoneypickArticlesByCategory:', fallbackError.message);
          return [];
        }
        return (fallbackData ?? []).map((row) => ({ ...row, thumbnail_url: null })) as ArticleCard[];
      }
      console.error('[db] getMoneypickArticlesByCategory:', error.message);
    }
    return (data ?? []) as ArticleCard[];
  } catch (e) {
    console.error('[db] getMoneypickArticlesByCategory exception:', e);
    return [];
  }
}

export async function getAllMoneypickArticles(): Promise<MoneypickArticleRow[]> {
  try {
    const { data, error } = await client()
      .from('moneypick_articles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('[db] getAllMoneypickArticles:', error.message);
    return (data ?? []) as MoneypickArticleRow[];
  } catch (e) {
    console.error('[db] getAllMoneypickArticles exception:', e);
    return [];
  }
}

export type ArticleSavePayload = {
  slug: string;
  category_key: string;
  category_label: string;
  title: string;
  seo_title?: string | null;
  lead: string;
  meta_description: string | null;
  body_html: string;
  summary: string[];
  faq: { q: string; a: string }[];
  tags: string[];
  editor: string;
  reading_time: string | null;
  hero_value: string | null;
  hero_label: string | null;
  related_calculators: { label: string; href: string }[];
  disclaimer: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published';
  source?: string | null;
  article_type?: string | null;
  pattern_id?: string | null;
  recommended_slugs?: string[] | null;
};

export type ArticleSaveResult = {
  id: string | null;
  error?: string;
  code?: string;
  ignoredColumns?: OptionalArticleColumn[];
};

const OPTIONAL_ARTICLE_COLUMNS = ['thumbnail_url', 'meta_description', 'source', 'seo_title', 'article_type', 'pattern_id', 'recommended_slugs'] as const;
type OptionalArticleColumn = (typeof OPTIONAL_ARTICLE_COLUMNS)[number];

function missingOptionalArticleColumns(error: { code?: string; message?: string } | null): OptionalArticleColumn[] {
  if (!error) return [];
  const message = error.message ?? '';
  if (error.code !== '42703' && error.code !== 'PGRST204') return [];
  return OPTIONAL_ARTICLE_COLUMNS.filter((column) => message.includes(column));
}

function isMissingOptionalArticleColumn(error: { code?: string; message?: string } | null): boolean {
  return missingOptionalArticleColumns(error).length > 0;
}

function withoutUnsupportedOptionalColumns<T extends Partial<ArticleSavePayload>>(
  payload: T,
  errorOrColumns?: { message?: string } | OptionalArticleColumn[] | null,
) {
  const next = { ...payload };
  const missingColumns = Array.isArray(errorOrColumns)
    ? errorOrColumns
    : errorOrColumns
    ? missingOptionalArticleColumns(errorOrColumns)
    : [...OPTIONAL_ARTICLE_COLUMNS];

  for (const column of OPTIONAL_ARTICLE_COLUMNS) {
    if (missingColumns.includes(column)) {
      delete next[column];
    }
  }

  return next;
}

function cannotPersistThumbnail(payload: Partial<ArticleSavePayload>, columns: OptionalArticleColumn[]) {
  return Boolean(payload.thumbnail_url) && columns.includes('thumbnail_url');
}

export async function createMoneypickArticle(payload: ArticleSavePayload): Promise<ArticleSaveResult> {
  try {
    const supabase = client();
    const { data, error } = await supabase
      .from('moneypick_articles')
      .insert(payload)
      .select('id')
      .single();
    if (!error) return { id: data?.id ?? null };

    if (isMissingOptionalArticleColumn(error)) {
      const ignoredColumns = missingOptionalArticleColumns(error);
      if (cannotPersistThumbnail(payload, ignoredColumns)) {
        return {
          id: null,
          code: 'MISSING_THUMBNAIL_COLUMN',
          error: '대표 이미지를 저장하려면 moneypick_articles.thumbnail_url 컬럼이 필요합니다.',
          ignoredColumns,
        };
      }

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('moneypick_articles')
        .insert(withoutUnsupportedOptionalColumns(payload, error))
        .select('id')
        .single();
      if (!fallbackError) return { id: fallbackData?.id ?? null, ignoredColumns };

      if (isMissingOptionalArticleColumn(fallbackError)) {
        const finalIgnoredColumns = [...new Set([...ignoredColumns, ...missingOptionalArticleColumns(fallbackError)])];
        if (cannotPersistThumbnail(payload, finalIgnoredColumns)) {
          return {
            id: null,
            code: 'MISSING_THUMBNAIL_COLUMN',
            error: '대표 이미지를 저장하려면 moneypick_articles.thumbnail_url 컬럼이 필요합니다.',
            ignoredColumns: finalIgnoredColumns,
          };
        }

        const { data: finalData, error: finalError } = await supabase
          .from('moneypick_articles')
          .insert(withoutUnsupportedOptionalColumns(payload, finalIgnoredColumns))
          .select('id')
          .single();
        if (!finalError) return { id: finalData?.id ?? null, ignoredColumns: finalIgnoredColumns };
        console.error('[db] createMoneypickArticle:', finalError.message);
        return { id: null, error: finalError.message, code: finalError.code };
      }

      console.error('[db] createMoneypickArticle:', fallbackError.message);
      return { id: null, error: fallbackError.message, code: fallbackError.code };
    }

    console.error('[db] createMoneypickArticle:', error.message);
    return { id: null, error: error.message, code: error.code };
  } catch (e) {
    console.error('[db] createMoneypickArticle exception:', e);
    return { id: null, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function updateMoneypickArticle(id: string, payload: Partial<ArticleSavePayload>): Promise<{ ok: boolean; error?: string; code?: string; ignoredColumns?: OptionalArticleColumn[] }> {
  try {
    const supabase = client();
    const { error } = await supabase
      .from('moneypick_articles')
      .update(payload)
      .eq('id', id);
    if (!error) return { ok: true };

    if (isMissingOptionalArticleColumn(error)) {
      const ignoredColumns = missingOptionalArticleColumns(error);
      if (cannotPersistThumbnail(payload, ignoredColumns)) {
        return {
          ok: false,
          code: 'MISSING_THUMBNAIL_COLUMN',
          error: '대표 이미지를 저장하려면 moneypick_articles.thumbnail_url 컬럼이 필요합니다.',
          ignoredColumns,
        };
      }

      const fallbackPayload = withoutUnsupportedOptionalColumns(payload, error);
      const { error: fallbackError } = await supabase
        .from('moneypick_articles')
        .update(fallbackPayload)
        .eq('id', id);
      if (!fallbackError) return { ok: true, ignoredColumns };

      if (isMissingOptionalArticleColumn(fallbackError)) {
        const finalIgnoredColumns = [...new Set([...ignoredColumns, ...missingOptionalArticleColumns(fallbackError)])];
        if (cannotPersistThumbnail(payload, finalIgnoredColumns)) {
          return {
            ok: false,
            code: 'MISSING_THUMBNAIL_COLUMN',
            error: '대표 이미지를 저장하려면 moneypick_articles.thumbnail_url 컬럼이 필요합니다.',
            ignoredColumns: finalIgnoredColumns,
          };
        }

        const { error: finalError } = await supabase
          .from('moneypick_articles')
          .update(withoutUnsupportedOptionalColumns(payload, finalIgnoredColumns))
          .eq('id', id);
        if (!finalError) return { ok: true, ignoredColumns: finalIgnoredColumns };
        console.error('[db] updateMoneypickArticle:', finalError.message);
        return { ok: false, error: finalError.message, code: finalError.code };
      }

      console.error('[db] updateMoneypickArticle:', fallbackError.message);
      return { ok: false, error: fallbackError.message, code: fallbackError.code };
    }

    console.error('[db] updateMoneypickArticle:', error.message);
    return { ok: false, error: error.message, code: error.code };
  } catch (e) {
    console.error('[db] updateMoneypickArticle exception:', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function deleteMoneypickArticle(id: string): Promise<boolean> {
  try {
    const { error } = await client().from('moneypick_articles').delete().eq('id', id);
    if (error) { console.error('[db] deleteMoneypickArticle:', error.message); return false; }
    return true;
  } catch (e) {
    console.error('[db] deleteMoneypickArticle exception:', e);
    return false;
  }
}

export type ContactInquiryPayload = {
  type: ContactInquiryType;
  sender_email: string;
  title: string;
  message: string;
  sender_name?: string | null;
};

export type ContactInquiry = ContactInquiryPayload & {
  id: string;
  status: string;
  referer: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at?: string | null;
  storage_path?: string | null;
};

function isMissingContactTable(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? '';
  return error?.code === 'PGRST205' || error?.code === '42P01' || message.includes('contact_inquiries');
}

function safeStorageFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '-');
}

async function ensureContactInquiryBucket(supabase = serverClient()) {
  const { error } = await supabase.storage.createBucket(CONTACT_INQUIRY_STORAGE_BUCKET, {
    public: false,
    fileSizeLimit: 1024 * 1024,
    allowedMimeTypes: ['application/json'],
  });

  if (error && !/already exists|Duplicate/i.test(error.message)) {
    console.error('[db] ensureContactInquiryBucket:', error.message);
  }
}

function buildStoredContactInquiry(
  payload: ContactInquiryPayload,
  meta: { referer?: string | null; user_agent?: string | null },
): ContactInquiry {
  const now = new Date().toISOString();
  return {
    ...payload,
    id: randomUUID(),
    status: 'new',
    referer: meta.referer ?? null,
    user_agent: meta.user_agent ?? null,
    created_at: now,
    updated_at: now,
  };
}

async function createContactInquiryInStorage(
  payload: ContactInquiryPayload,
  meta: { referer?: string | null; user_agent?: string | null } = {},
): Promise<{ id: string | null; error?: string; code?: string }> {
  try {
    const supabase = serverClient();
    await ensureContactInquiryBucket(supabase);

    const inquiry = buildStoredContactInquiry(payload, meta);
    const datePrefix = inquiry.created_at.slice(0, 10);
    const path = `${CONTACT_INQUIRY_STORAGE_PREFIX}/${datePrefix}/${safeStorageFileName(inquiry.created_at)}-${inquiry.id}.json`;

    const { error } = await supabase.storage
      .from(CONTACT_INQUIRY_STORAGE_BUCKET)
      .upload(path, JSON.stringify(inquiry, null, 2), {
        contentType: 'application/json',
        upsert: false,
      });

    if (error) {
      console.error('[db] createContactInquiryInStorage upload:', error.message);
      return { id: null, error: error.message, code: 'STORAGE_UPLOAD_FAILED' };
    }
    return { id: inquiry.id };
  } catch (e) {
    console.error('[db] createContactInquiryInStorage exception:', e);
    return { id: null, error: e instanceof Error ? e.message : 'Unknown error', code: 'STORAGE_EXCEPTION' };
  }
}

function isContactInquiry(value: unknown): value is ContactInquiry {
  if (!value || typeof value !== 'object') return false;
  const inquiry = value as Partial<ContactInquiry>;
  return Boolean(inquiry.id && inquiry.type && inquiry.sender_email && inquiry.title && inquiry.message && inquiry.created_at);
}

async function readStorageContactInquiry(path: string): Promise<ContactInquiry | null> {
  try {
    const { data, error } = await serverClient().storage
      .from(CONTACT_INQUIRY_STORAGE_BUCKET)
      .download(path);

    if (error || !data) return null;
    const parsed = JSON.parse(await data.text());
    if (!isContactInquiry(parsed)) return null;
    return { ...parsed, storage_path: path };
  } catch (e) {
    console.error('[db] readStorageContactInquiry:', path, e);
    return null;
  }
}

async function listStorageContactInquiryPaths(prefix = CONTACT_INQUIRY_STORAGE_PREFIX, limit = 100): Promise<string[]> {
  try {
    await ensureContactInquiryBucket();
    const { data, error } = await serverClient().storage
      .from(CONTACT_INQUIRY_STORAGE_BUCKET)
      .list(prefix, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('[db] listStorageContactInquiryPaths:', error.message);
      return [];
    }

    const paths: string[] = [];
    for (const item of data ?? []) {
      if (!item.name) continue;
      if (item.id === null) {
        paths.push(...(await listStorageContactInquiryPaths(`${prefix}/${item.name}`, limit)));
      } else if (item.name.endsWith('.json')) {
        paths.push(`${prefix}/${item.name}`);
      }
      if (paths.length >= limit) break;
    }
    return paths.slice(0, limit);
  } catch (e) {
    console.error('[db] listStorageContactInquiryPaths exception:', e);
    return [];
  }
}

async function getStorageContactInquiries(limit = 100): Promise<ContactInquiry[]> {
  const paths = await listStorageContactInquiryPaths(CONTACT_INQUIRY_STORAGE_PREFIX, limit);
  const inquiries = await Promise.all(paths.map((path) => readStorageContactInquiry(path)));
  return inquiries
    .filter((inquiry): inquiry is ContactInquiry => Boolean(inquiry))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit);
}

export async function createContactInquiry(
  payload: ContactInquiryPayload,
  meta: { referer?: string | null; user_agent?: string | null } = {},
): Promise<{ id: string | null; error?: string; code?: string }> {
  try {
    const { data, error } = await serverClient()
      .from('contact_inquiries')
      .insert({
        ...payload,
        referer: meta.referer ?? null,
        user_agent: meta.user_agent ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[db] createContactInquiry table fallback:', error.message);
      return createContactInquiryInStorage(payload, meta);
    }
    return { id: data?.id ?? null };
  } catch (e) {
    console.error('[db] createContactInquiry exception fallback:', e);
    return createContactInquiryInStorage(payload, meta);
  }
}

export async function getContactInquiries(limit = 100): Promise<{ inquiries: ContactInquiry[]; error?: string; code?: string }> {
  const storageInquiries = await getStorageContactInquiries(limit);

  try {
    const { data, error } = await serverClient()
      .from('contact_inquiries')
      .select('id, type, sender_email, sender_name, title, message, status, referer, user_agent, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (!isMissingContactTable(error)) console.error('[db] getContactInquiries:', error.message);
      if (storageInquiries.length) return { inquiries: storageInquiries };
      return { inquiries: [], error: error.message, code: error.code };
    }

    const tableInquiries = (data ?? []) as ContactInquiry[];
    const byId = new Map<string, ContactInquiry>();
    for (const inquiry of [...tableInquiries, ...storageInquiries]) {
      byId.set(inquiry.id, inquiry);
    }

    return {
      inquiries: [...byId.values()]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit),
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    console.error('[db] getContactInquiries exception:', e);
    if (storageInquiries.length) return { inquiries: storageInquiries };
    return { inquiries: [], error };
  }
}

export async function getNotices() {
  try {
    const { data } = await client().from('notices').select().eq('visible', true).order('created_at', { ascending: false }).limit(5);
    if (data?.length) return data.map((r) => ({ id: String(r.id), title: String(r.title), date: String(r.created_at).slice(0, 10), type: 'info' as const }));
  } catch {}
  return staticNotices;
}
