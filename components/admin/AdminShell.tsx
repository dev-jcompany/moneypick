'use client';

import { usePathname } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { adminPath, toPublicAdminPath } from '@/lib/admin-path';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = toPublicAdminPath(usePathname());

  if (pathname === adminPath('/login')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#17211D] dark:bg-[#F4F7F6] dark:text-[#17211D]">
      <AdminSidebar />
      <div className="min-h-screen lg:pl-[260px]">
        <AdminHeader />
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
