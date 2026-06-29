import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'admin_auth';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_DEV_PASSWORD = 'moneypick-admin';

function getAdminUsername() {
  return process.env.ADMIN_USERNAME ?? DEFAULT_ADMIN_USERNAME;
}

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;
  return process.env.NODE_ENV === 'production' ? null : DEFAULT_DEV_PASSWORD;
}

function getSigningSecret() {
  return process.env.ADMIN_AUTH_SECRET ?? getAdminPassword();
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
  return typeof input === 'string' && password !== null && safeEqual(input, password);
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
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
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
