export const ADMIN_BASE_PATH = '/mp-hub-8r6q2';
export const ADMIN_INTERNAL_BASE_PATH = '/admin';
export const ADMIN_INTERNAL_LOGIN_PATH = '/admin-login-internal';

export function adminPath(path = '') {
  if (!path || path === '/') return ADMIN_BASE_PATH;
  return `${ADMIN_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

export function safeAdminReturnPath(value: string | null | undefined) {
  if (!value || value.includes('\\') || /[\u0000-\u001f]/.test(value)) return adminPath();

  try {
    const parsed = new URL(value, 'https://admin.local');
    const isSameOrigin = parsed.origin === 'https://admin.local';
    const isAdminPath = parsed.pathname === ADMIN_BASE_PATH || parsed.pathname.startsWith(`${ADMIN_BASE_PATH}/`);
    return isSameOrigin && isAdminPath ? `${parsed.pathname}${parsed.search}${parsed.hash}` : adminPath();
  } catch {
    return adminPath();
  }
}

export function isPublicAdminPath(pathname: string) {
  return pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`);
}

export function isInternalAdminPath(pathname: string) {
  return pathname === ADMIN_INTERNAL_BASE_PATH || pathname.startsWith(`${ADMIN_INTERNAL_BASE_PATH}/`);
}

export function toInternalAdminPath(pathname: string) {
  if (pathname === ADMIN_BASE_PATH) return ADMIN_INTERNAL_BASE_PATH;
  if (pathname.startsWith(`${ADMIN_BASE_PATH}/`)) {
    return `${ADMIN_INTERNAL_BASE_PATH}${pathname.slice(ADMIN_BASE_PATH.length)}`;
  }
  return pathname;
}

export function toPublicAdminPath(pathname: string) {
  if (pathname === ADMIN_INTERNAL_BASE_PATH) return ADMIN_BASE_PATH;
  if (pathname.startsWith(`${ADMIN_INTERNAL_BASE_PATH}/`)) {
    return `${ADMIN_BASE_PATH}${pathname.slice(ADMIN_INTERNAL_BASE_PATH.length)}`;
  }
  return pathname;
}
