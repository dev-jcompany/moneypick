'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminPath } from '@/lib/admin-path';

export default function AdminLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? adminPath();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      router.push(from);
      router.refresh();
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F6] px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#21A05A]">MoneyPick</p>
          <h1 className="mt-2 text-xl font-extrabold text-[#17211D]">관리자 로그인</h1>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">아이디</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 ${error ? 'border-red-300' : 'border-gray-200'}`}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/20 ${error ? 'border-red-300' : 'border-gray-200'}`}
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="mt-6 w-full rounded-xl bg-[#21A05A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1B8D4F] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </form>
    </main>
  );
}