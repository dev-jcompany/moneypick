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
      <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-[14px] font-bold text-[#21A05A]">
        ✓ 구독 신청이 완료되었습니다!
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소를 입력하세요"
        className="min-w-0 flex-1 rounded-[14px] border border-[#CFE0D8] bg-white px-4 py-3 text-[14px] outline-none focus:border-[#21A05A]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-[14px] bg-[#21A05A] px-6 py-3 text-[15px] font-extrabold text-white hover:bg-[#17794A]"
      >
        구독하기
      </button>
    </form>
  );
}
