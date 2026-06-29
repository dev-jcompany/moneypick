export const ADMIN_BASE_PATH = '/mp-hub-8r6q2';
export const ADMIN_INTERNAL_BASE_PATH = '/admin';

export function adminPath(path = '') {
  if (!path || path === '/') return ADMIN_BASE_PATH;
  return `${ADMIN_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
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