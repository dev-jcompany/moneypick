import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import type { CategorySavePayload } from '@/lib/db';

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizePayload(input: Partial<CategorySavePayload>): CategorySavePayload {
  const name = String(input.name ?? '').trim();
  const enSlug = normalizeSlug(String(input.en_slug ?? input.slug ?? name));
  return {
    name,
    slug: String(input.slug ?? name).trim() || name,
    en_slug: enSlug,
    icon: String(input.icon ?? '💡').trim() || '💡',
    description: String(input.description ?? '').trim(),
    color: String(input.color ?? 'green').trim() || 'green',
    enabled: input.enabled !== false,
    sort_order: Number(input.sort_order ?? 100),
  };
}

export async function GET(req: NextRequest) {
  const visibleOnly = req.nextUrl.searchParams.get('visible') === '1';
  const categories = await getCategories({ visibleOnly });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const payload = normalizePayload(await req.json());
    if (!payload.name || !payload.en_slug) {
      return NextResponse.json({ error: '카테고리명과 URL 키를 입력해주세요.' }, { status: 400 });
    }

    const result = await createCategory(payload);
    if (!result.id) {
      const isDuplicate = result.code === '23505';
      return NextResponse.json(
        {
          error: isDuplicate
            ? '이미 사용 중인 카테고리 URL입니다.'
            : `카테고리 저장에 실패했습니다. ${result.error ?? 'DB 설정을 확인해주세요.'}`,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (e) {
    console.error('[api/categories POST]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
