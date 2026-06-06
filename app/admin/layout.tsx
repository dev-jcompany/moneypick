import type { Metadata } from 'next';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { AdminProvider } from '@/components/admin/AdminStore';

export const metadata: Metadata = { title: '머니픽 관리자', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-[#F4F7F6] text-[#17211D] dark:bg-[#F4F7F6] dark:text-[#17211D]">
        <AdminSidebar />
        <div className="min-h-screen lg:pl-[260px]"><AdminHeader /><main className="p-5 lg:p-8">{children}</main></div>
      </div>
    </AdminProvider>
  );
}
