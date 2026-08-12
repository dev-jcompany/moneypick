import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, adminCookieOptions, createAdminSessionToken, verifyAdminCredentials } from '@/lib/admin-auth';
import { ApiInputError, consumeRateLimit, isJsonObject, readLimitedJson } from '@/lib/api-security';

const LOGIN_BODY_LIMIT_BYTES = 4 * 1024;
const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const rateLimit = consumeRateLimit(request, 'admin-login', LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  let input: unknown;
  try {
    input = await readLimitedJson(request, LOGIN_BODY_LIMIT_BYTES);
  } catch (error) {
    if (error instanceof ApiInputError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  if (!isJsonObject(input)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!verifyAdminCredentials(input.username, input.password)) {
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
