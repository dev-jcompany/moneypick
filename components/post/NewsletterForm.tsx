'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setDone(true);
  };

  if (done) {
    return (
      <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-[13px] font-bold text-[#21A05A]">
        ✓ 구독 신청이 완료되었습니다!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소를 입력하세요"
        className="flex-1 rounded-xl border border-[#DDE5E1] px-4 py-3 text-[13px] outline-none focus:border-[#21A05A]"
      />
      <button
        type="submit"
        className="rounded-xl bg-[#21A05A] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#17794A]"
      >
        구독하기
      </button>
    </form>
  );
}
