import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, adminCookieOptions, createAdminSessionToken, verifyAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: 'Admin auth is not configured' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, adminCookieOptions);

  return response;
}
