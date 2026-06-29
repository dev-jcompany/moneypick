import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import { AdminProvider } from '@/components/admin/AdminStore';

export const metadata: Metadata = {
  title: '머니픽 관리자',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}
