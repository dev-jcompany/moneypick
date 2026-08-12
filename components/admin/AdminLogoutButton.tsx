'use client';

import { useState } from 'react';
import { adminPath } from '@/lib/admin-path';

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      window.location.replace(adminPath('/login'));
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? '로그아웃 중' : '로그아웃'}
    </button>
  );
}
