'use client';

import { useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';

export default function UsersPage() {
  const { users, setUsers } = useAdmin();
  const [email, setEmail] = useState('');
  const invite = () => {
    if (!email.includes('@')) return window.alert('올바른 이메일을 입력해 주세요.');
    setUsers((current) => [...current, { id: crypto.randomUUID(), name: '새 운영자', email, role: '에디터', status: '초대 중' }]);
    setEmail('');
    window.alert('운영자 초대를 만들었습니다.');
  };
  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6"><h2 className="text-2xl font-extrabold">운영자 계정 관리</h2><p className="mt-1 text-sm text-slate-500">직원을 초대하고 역할과 계정 상태를 관리하세요.</p></div>
      <section className="mb-6 rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm"><h3 className="mb-4 font-extrabold">운영자 초대</h3><div className="flex flex-col gap-3 sm:flex-row"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="staff@moneypick.kr" className="flex-1 rounded-xl border border-[#DDE5E1] px-4 py-3" /><button type="button" onClick={invite} className="rounded-xl bg-[#21A05A] px-5 py-3 font-bold text-white">초대 보내기</button></div></section>
      <section className="overflow-hidden rounded-3xl border border-[#E0E7E3] bg-white shadow-sm"><div className="divide-y divide-[#EDF1EF]">{users.map((user) => <div key={user.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 font-bold text-[#17794A]">{user.name.slice(0, 1)}</span><div className="flex-1"><strong className="block">{user.name}</strong><span className="text-sm text-slate-500">{user.email}</span></div><select value={user.role} onChange={(event) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: event.target.value as typeof user.role } : item))} className="rounded-xl border border-[#DDE5E1] px-3 py-2 text-sm"><option>최고 관리자</option><option>에디터</option></select><span className={`rounded-full px-3 py-1 text-xs font-bold ${user.status === '활성' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{user.status}</span><button type="button" onClick={() => user.id === '1' ? window.alert('기본 최고 관리자 계정은 삭제할 수 없습니다.') : window.confirm('이 운영자 계정을 삭제할까요?') && setUsers((current) => current.filter((item) => item.id !== user.id))} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600">삭제</button></div>)}</div></section>
      <section className="mt-6 rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm"><h3 className="mb-2 font-extrabold">내 비밀번호 변경</h3><p className="mb-4 text-sm text-slate-500">실제 인증 서버 연결 전 UI입니다.</p><div className="grid gap-3 sm:grid-cols-2"><input type="password" placeholder="새 비밀번호" className="rounded-xl border border-[#DDE5E1] px-4 py-3" /><input type="password" placeholder="새 비밀번호 확인" className="rounded-xl border border-[#DDE5E1] px-4 py-3" /></div><button type="button" onClick={() => window.alert('비밀번호 변경 요청을 확인했습니다. 실제 배포 시 인증 서버와 연결됩니다.')} className="mt-4 rounded-xl bg-[#10231B] px-5 py-3 text-sm font-bold text-white">비밀번호 변경</button></section>
    </div>
  );
}
