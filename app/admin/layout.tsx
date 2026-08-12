import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import { AdminProvider } from '@/components/admin/AdminStore';
import { requireAdminPage } from '@/lib/admin-page-auth';

export const metadata: Metadata = {
  title: '머니픽 관리자',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
