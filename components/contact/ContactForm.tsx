'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CONTACT_INQUIRY_TYPES, type ContactInquiryType } from '@/lib/contact-inquiries';

type FormState = {
  type: ContactInquiryType;
  senderEmail: string;
  senderName: string;
  title: string;
  message: string;
  website: string;
};

const initialState: FormState = {
  type: 'advertising_partnership',
  senderEmail: '',
  senderName: '',
  title: '',
  message: '',
  website: '',
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: form.type,
          sender_email: form.senderEmail,
          sender_name: form.senderName,
          title: form.title,
          message: form.message,
          website: form.website,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(typeof result.error === 'string' ? result.error : '문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      setForm(initialState);
      window.alert('정상적으로 접수되었습니다. 확인 후 연락드리겠습니다.');
    } catch {
      setError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-[#E8ECEF] bg-white p-5 shadow-sm dark:border-navy-700 dark:bg-navy-900 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-[#3D454D] dark:text-slate-200">유형</span>
          <select
            value={form.type}
            onChange={update('type')}
            className="w-full rounded-lg border border-[#DCE3E0] bg-white px-3 py-2.5 text-[14px] text-[#1A1D1F] outline-none transition focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/15 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
          >
            {Object.entries(CONTACT_INQUIRY_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-[#3D454D] dark:text-slate-200">회신 이메일</span>
          <input
            type="email"
            value={form.senderEmail}
            onChange={update('senderEmail')}
            placeholder="name@example.com"
            required
            className="w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 text-[14px] text-[#1A1D1F] outline-none transition placeholder:text-[#9AA3AA] focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/15 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-bold text-[#3D454D] dark:text-slate-200">이름 또는 회사명</span>
        <input
          type="text"
          value={form.senderName}
          onChange={update('senderName')}
          placeholder="선택 입력"
          maxLength={80}
          className="w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 text-[14px] text-[#1A1D1F] outline-none transition placeholder:text-[#9AA3AA] focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/15 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-bold text-[#3D454D] dark:text-slate-200">제목</span>
        <input
          type="text"
          value={form.title}
          onChange={update('title')}
          required
          maxLength={120}
          className="w-full rounded-lg border border-[#DCE3E0] px-3 py-2.5 text-[14px] text-[#1A1D1F] outline-none transition focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/15 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-bold text-[#3D454D] dark:text-slate-200">내용</span>
        <textarea
          value={form.message}
          onChange={update('message')}
          required
          minLength={10}
          maxLength={3000}
          rows={8}
          className="w-full resize-y rounded-lg border border-[#DCE3E0] px-3 py-2.5 text-[14px] leading-7 text-[#1A1D1F] outline-none transition focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/15 dark:border-navy-600 dark:bg-navy-800 dark:text-white"
        />
      </label>

      <label className="hidden" aria-hidden="true">
        웹사이트
        <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
      </label>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-600">{error}</p> : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[12px] leading-5 text-[#8A949E] dark:text-slate-500">접수된 내용은 문의 응대 목적으로만 확인합니다.</p>
        <button
          type="submit"
          disabled={submitting}
          className="shrink-0 rounded-lg bg-[#21A05A] px-5 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#17794A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '접수 중' : '보내기'}
        </button>
      </div>
    </form>
  );
}
