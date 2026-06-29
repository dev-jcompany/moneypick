import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { adminPath, isInternalAdminPath, isPublicAdminPath, toInternalAdminPath } from '@/lib/admin-path';

const PROTECTED_API_PREFIXES = ['/api/articles', '/api/categories'];
const DEFAULT_PRIVATE_ENTRY_PATH = '/mp-preview-8r6q2';

function isAccessLockEnabled() {
  return process.env.SITE_ACCESS_LOCK === '1';
}

function privateEntryPath() {
  const configuredPath = process.env.SITE_PRIVATE_ENTRY_PATH?.trim() || DEFAULT_PRIVATE_ENTRY_PATH;
  return configuredPath.startsWith('/') ? configuredPath : `/${configuredPath}`;
}

function requestIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    ''
  );
}

function allowedIps() {
  return (process.env.SITE_ALLOWED_IPS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean);
}

function isAllowedIp(request: NextRequest) {
  const ip = requestIp(request);
  if (!ip) return false;
  if (ip === '127.0.0.1' || ip === '::1') return true;
  return allowedIps().includes(ip);
}

function isStaticAsset(pathname: string) {
  return pathname.startsWith('/_next/') || /\.[a-z0-9]{2,8}$/i.test(pathname);
}

function preopenAccessGate(request: NextRequest) {
  if (!isAccessLockEnabled()) return null;

  const { pathname } = request.nextUrl;
  if (isStaticAsset(pathname)) return null;

  if (!isAllowedIp(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const entryPath = privateEntryPath();
  if (pathname === entryPath || pathname.startsWith(`${entryPath}/`)) {
    const rewriteUrl = request.nextUrl.clone();
    const nextPath = pathname === entryPath ? '/' : pathname.slice(entryPath.length);
    rewriteUrl.pathname = nextPath || '/';
    return NextResponse.rewrite(rewriteUrl);
  }

  if (pathname === '/') {
    return new NextResponse(null, { status: 404 });
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessGateResponse = preopenAccessGate(request);
  if (accessGateResponse) return accessGateResponse;

  if (isInternalAdminPath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const isAdminPage = isPublicAdminPath(pathname);
  const isProtectedApiWrite =
    PROTECTED_API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) &&
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    request.method !== 'OPTIONS';

  if (!isAdminPage && !isProtectedApiWrite) return NextResponse.next();

  if (pathname === adminPath('/login') && request.method === 'POST') {
    return NextResponse.next();
  }

  if (pathname === adminPath('/login')) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = toInternalAdminPath(pathname);
    return NextResponse.rewrite(rewriteUrl);
  }

  if (isAdminRequest(request)) {
    if (isAdminPage) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = toInternalAdminPath(pathname);
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  if (isProtectedApiWrite) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL(adminPath('/login'), request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/:path*'],
};
