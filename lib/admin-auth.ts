import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { adminSecurityConfig } from '@/lib/env/server';

export const ADMIN_COOKIE_NAME = 'admin_auth';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
function getAdminUsername() {
  return adminSecurityConfig().username;
}

function getAdminPassword() {
  return adminSecurityConfig().password;
}

function getSigningSecret() {
  return adminSecurityConfig().signingSecret;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function sign(value: string) {
  const secret = getSigningSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function verifyAdminPassword(input: unknown) {
  const password = getAdminPassword();
  return typeof input === 'string' && safeEqual(input, password);
}

export function verifyAdminCredentials(username: unknown, password: unknown) {
  return typeof username === 'string' && safeEqual(username, getAdminUsername()) && verifyAdminPassword(password);
}

export function createAdminSessionToken() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${expires}`;
  const signature = sign(payload);
  return signature ? `${payload}.${signature}` : null;
}

export function isAdminRequest(request: NextRequest) {
  return isAdminSessionToken(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export function isAdminSessionToken(token: string | undefined) {
  if (!token) return false;

  const [version, expires, signature] = token.split('.');
  if (version !== 'v1' || !expires || !signature) return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const expected = sign(`${version}.${expires}`);
  if (!expected) return false;
  return safeEqual(signature, expected);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_TTL_SECONDS,
  path: '/',
};
