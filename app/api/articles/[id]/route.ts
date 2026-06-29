import { NextRequest, NextResponse } from 'next/server';
import { updateMoneypickArticle, deleteMoneypickArticle } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';

interface Context { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Context) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const { id } = await params;
    const payload = await req.json();
    const result = await updateMoneypickArticle(id, payload);

    if (!result.ok) {
      const isDuplicate = result.code === '23505';
      const needsThumbnailColumn = result.code === 'MISSING_THUMBNAIL_COLUMN';
      return NextResponse.json(
        {
          error: needsThumbnailColumn
            ? `${result.error} Supabase SQL Editor에서 "alter table moneypick_articles add column if not exists thumbnail_url text;"를 실행해주세요.`
            : isDuplicate
            ? '이미 사용 중인 슬러그입니다.'
            : `수정에 실패했습니다. ${result.error ?? '필수 항목과 DB 설정을 확인해주세요.'}`,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({ id });
  } catch (e) {
    console.error('[api/articles PATCH]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  if (!isAdminRequest(_req)) return unauthorized();

  try {
    const { id } = await params;
    const ok = await deleteMoneypickArticle(id);
    if (!ok) return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ id });
  } catch (e) {
    console.error('[api/articles DELETE]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
