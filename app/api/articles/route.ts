import { NextRequest, NextResponse } from 'next/server';
import { createMoneypickArticle } from '@/lib/db';
import { isAdminRequest, unauthorized } from '@/lib/admin-auth';
import type { ArticleSavePayload } from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  try {
    const payload: ArticleSavePayload = await req.json();
    if (!payload.title || !payload.slug || !payload.body_html) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    const result = await createMoneypickArticle(payload);
    if (!result.id) {
      const isDuplicate = result.code === '23505';
      const needsThumbnailColumn = result.code === 'MISSING_THUMBNAIL_COLUMN';
      return NextResponse.json(
        {
          error: needsThumbnailColumn
            ? `${result.error} Supabase SQL Editor에서 "alter table moneypick_articles add column if not exists thumbnail_url text;"를 실행해주세요.`
            : isDuplicate
            ? '이미 사용 중인 슬러그입니다.'
            : `저장에 실패했습니다. ${result.error ?? '필수 항목과 DB 설정을 확인해주세요.'}`,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (e) {
    console.error('[api/articles POST]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
