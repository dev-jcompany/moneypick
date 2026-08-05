import { NextRequest, NextResponse } from 'next/server';
import { createContactInquiry, type ContactInquiryPayload } from '@/lib/db';
import { isContactInquiryType } from '@/lib/contact-inquiries';

function normalizeText(value: unknown, maxLength: number) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    const input = await req.json();
    if (normalizeText(input.website, 200)) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const type = normalizeText(input.type, 80);
    const senderEmail = normalizeText(input.sender_email, 160).toLowerCase();
    const senderName = normalizeText(input.sender_name, 80);
    const title = normalizeText(input.title, 120);
    const message = normalizeText(input.message, 3000);

    if (!isContactInquiryType(type)) {
      return NextResponse.json({ error: '문의 유형을 선택해주세요.' }, { status: 400 });
    }
    if (!isValidEmail(senderEmail)) {
      return NextResponse.json({ error: '회신 받을 이메일을 정확히 입력해주세요.' }, { status: 400 });
    }
    if (title.length < 2) {
      return NextResponse.json({ error: '제목을 2자 이상 입력해주세요.' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: '내용을 10자 이상 입력해주세요.' }, { status: 400 });
    }

    const payload: ContactInquiryPayload = {
      type,
      sender_email: senderEmail,
      sender_name: senderName || null,
      title,
      message,
    };

    const result = await createContactInquiry(payload, {
      referer: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
    });

    if (!result.id) {
      const needsTable = result.code === 'PGRST205' || result.code === '42P01';
      return NextResponse.json(
        {
          error: needsTable
            ? '문의 저장 테이블이 아직 준비되지 않았습니다. 관리자에게 문의해주세요.'
            : '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (e) {
    console.error('[api/contact POST]', e);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
