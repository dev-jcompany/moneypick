import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { adminPath } from '@/lib/admin-path';
import { createMoneypickArticle } from '@/lib/db';
import type { ArticleSavePayload } from '@/lib/db';

export const runtime = 'nodejs';

type DraftRequestBody = {
  title?: unknown;
  seoTitle?: unknown;
  slug?: unknown;
  category?: unknown;
  summary?: unknown;
  contentHtml?: unknown;
  tags?: unknown;
  status?: unknown;
  source?: unknown;
  heroValue?: unknown;
  heroLabel?: unknown;
  readingTime?: unknown;
  metaDescription?: unknown;
  thumbnailUrl?: unknown;
};

const CATEGORY_MAP: Record<string, { key: string; label: string }> = {
  loan: { key: 'loan', label: '대출연구소' },
  '대출': { key: 'loan', label: '대출연구소' },
  '대출연구소': { key: 'loan', label: '대출연구소' },
  estate: { key: 'estate', label: '부동산 가이드' },
  realestate: { key: 'estate', label: '부동산 가이드' },
  '부동산': { key: 'estate', label: '부동산 가이드' },
  '부동산연구소': { key: 'estate', label: '부동산 가이드' },
  '부동산 가이드': { key: 'estate', label: '부동산 가이드' },
  tax: { key: 'tax', label: '세금 절약법' },
  '세금': { key: 'tax', label: '세금 절약법' },
  '세금연구소': { key: 'tax', label: '세금 절약법' },
  '세금 절약법': { key: 'tax', label: '세금 절약법' },
  work: { key: 'work', label: '직장인 머니' },
  '직장': { key: 'work', label: '직장인 머니' },
  '직장인연구소': { key: 'work', label: '직장인 머니' },
  '직장인 머니': { key: 'work', label: '직장인 머니' },
  invest: { key: 'invest', label: '투자 첫걸음' },
  '투자': { key: 'invest', label: '투자 첫걸음' },
  '투자연구소': { key: 'invest', label: '투자 첫걸음' },
  '투자 첫걸음': { key: 'invest', label: '투자 첫걸음' },
};

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function getRequestApiKey(req: NextRequest) {
  const authorization = req.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) return authorization.slice('Bearer '.length).trim();
  return req.headers.get('x-admin-api-key')?.trim() ?? '';
}

function requireString(value: unknown, label: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { error: `${label} 값이 필요합니다.` };
  }
  return { value: value.trim() };
}

function optionalString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return null;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeTags(value: unknown) {
  if (value == null) return [];
  if (!Array.isArray(value)) return null;
  return value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function POST(req: NextRequest) {
  const configuredApiKey = process.env.ADMIN_API_KEY?.trim();
  if (!configuredApiKey) {
    return NextResponse.json({ error: 'ADMIN_API_KEY 환경변수가 설정되지 않았습니다.' }, { status: 503 });
  }

  if (!safeEqual(getRequestApiKey(req), configuredApiKey)) {
    return NextResponse.json({ error: '관리자 API 키가 올바르지 않습니다.' }, { status: 401 });
  }

  try {
    const body: DraftRequestBody = await req.json();

    if (body.status != null && body.status !== 'draft') {
      return NextResponse.json(
        { error: '자동 발행은 허용되지 않습니다. status는 draft만 가능합니다.' },
        { status: 400 },
      );
    }

    const title = requireString(body.title, 'title');
    if ('error' in title) return NextResponse.json({ error: title.error }, { status: 400 });

    const slugInput = requireString(body.slug, 'slug');
    if ('error' in slugInput) return NextResponse.json({ error: slugInput.error }, { status: 400 });

    const categoryInput = requireString(body.category, 'category');
    if ('error' in categoryInput) return NextResponse.json({ error: categoryInput.error }, { status: 400 });

    const summary = requireString(body.summary, 'summary');
    if ('error' in summary) return NextResponse.json({ error: summary.error }, { status: 400 });

    const contentHtml = requireString(body.contentHtml, 'contentHtml');
    if ('error' in contentHtml) return NextResponse.json({ error: contentHtml.error }, { status: 400 });

    const category = CATEGORY_MAP[String(categoryInput.value).trim()];
    if (!category) {
      return NextResponse.json({ error: '지원하지 않는 category입니다.' }, { status: 400 });
    }

    const slug = normalizeSlug(slugInput.value);
    if (!slug) {
      return NextResponse.json({ error: 'slug 값이 유효하지 않습니다.' }, { status: 400 });
    }

    const tags = normalizeTags(body.tags);
    if (tags === null) {
      return NextResponse.json({ error: 'tags는 문자열 배열이어야 합니다.' }, { status: 400 });
    }

    const seoTitle = optionalString(body.seoTitle);
    const metaDescription = optionalString(body.metaDescription) ?? summary.value;
    const thumbnailUrl = optionalString(body.thumbnailUrl);
    const readingTime = optionalString(body.readingTime);
    const heroValue = optionalString(body.heroValue);
    const heroLabel = optionalString(body.heroLabel);

    const payload: ArticleSavePayload = {
      slug,
      category_key: category.key,
      category_label: category.label,
      title: title.value,
      seo_title: seoTitle,
      lead: summary.value,
      meta_description: metaDescription,
      body_html: contentHtml.value,
      summary: [summary.value],
      faq: [],
      tags,
      editor: '머니픽 에디터',
      reading_time: readingTime,
      hero_value: heroValue,
      hero_label: heroLabel,
      related_calculators: [],
      disclaimer: null,
      thumbnail_url: thumbnailUrl,
      status: 'draft',
      source: typeof body.source === 'string' ? body.source : 'claude_scheduled',
    };

    const result = await createMoneypickArticle(payload);
    if (!result.id) {
      const isDuplicate = result.code === '23505';
      return NextResponse.json(
        {
          error: isDuplicate
            ? '이미 사용 중인 slug입니다.'
            : result.error ?? '임시저장 등록에 실패했습니다.',
          ignoredColumns: result.ignoredColumns,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }

    return NextResponse.json(
      {
        articleId: result.id,
        editUrl: `${req.nextUrl.origin}${adminPath(`/articles/${result.id}`)}`,
        status: 'draft',
        source: payload.source,
        ignoredColumns: result.ignoredColumns,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[api/admin/articles/draft]', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
