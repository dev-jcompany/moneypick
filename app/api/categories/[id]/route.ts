import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory, updateCategory } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import type { CategorySavePayload } from '@/lib/db';

interface Context {
  params: Promise<{ id: string }>;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizePatch(input: Partial<CategorySavePayload>): Partial<CategorySavePayload> {
  const payload: Partial<CategorySavePayload> = {};
  if (input.name !== undefined) payload.name = String(input.name).trim();
  if (input.slug !== undefined) payload.slug = String(input.slug).trim();
  if (input.en_slug !== undefined) payload.en_slug = normalizeSlug(String(input.en_slug));
  if (input.icon !== undefined) payload.icon = String(input.icon).trim() || '💡';
  if (input.description !== undefined) payload.description = String(input.description).trim();
  if (input.color !== undefined) payload.color = String(input.color).trim() || 'green';
  if (input.enabled !== undefined) payload.enabled = Boolean(input.enabled);
  if (input.sort_order !== undefined) payload.sort_order = Number(input.sort_order);
  return payload;
}

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const { id } = await params;
    const payload = normalizePatch(await req.json());
    const result = await updateCategory(id, payload);
    if (!result.ok) {
      const isDuplicate = result.code === '23505';
      return NextResponse.json(
        {
          error: isDuplicate
            ? '이미 사용 중인 카테고리 URL입니다.'
            : `카테고리 수정에 실패했습니다. ${result.error ?? 'DB 설정을 확인해주세요.'}`,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }
    return NextResponse.json({ id });
  } catch (e) {
    console.error('[api/categories PATCH]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  if (!isAdminRequest(_req)) return unauthorized();

  try {
    const { id } = await params;
    const result = await deleteCategory(id);
    if (!result.ok) return NextResponse.json({ error: result.error ?? '삭제에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ id });
  } catch (e) {
    console.error('[api/categories DELETE]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
