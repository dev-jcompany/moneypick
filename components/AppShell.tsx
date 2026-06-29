'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { isInternalAdminPath, isPublicAdminPath } from '@/lib/admin-path';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isPublicAdminPath(pathname) || isInternalAdminPath(pathname)) return <>{children}</>;

  return (
    <>
      <Header />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
