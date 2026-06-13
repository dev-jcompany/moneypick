import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'moneypick-admin';
const COOKIE_NAME = 'admin_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  // 로그인 POST 처리
  if (pathname === '/admin/login' && request.method === 'POST') {
    return NextResponse.next();
  }

  // 로그인 페이지는 통과
  if (pathname === '/admin/login') return NextResponse.next();

  // 쿠키 인증 확인
  const auth = request.cookies.get(COOKIE_NAME)?.value;
  if (auth === ADMIN_PASSWORD) return NextResponse.next();

  // 미인증 → 로그인 페이지로
  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: '/admin/:path*',
};
