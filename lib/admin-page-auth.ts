import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE_NAME, isAdminSessionToken } from '@/lib/admin-auth';
import { adminPath } from '@/lib/admin-path';

/**
 * Performs the authoritative admin check at the Server Component boundary.
 * Proxy remains an optimistic first check, not the authorization boundary.
 */
export async function requireAdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isAdminSessionToken(token)) {
    redirect(adminPath('/login'));
  }
}
