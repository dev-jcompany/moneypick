'use client';

import { useRef, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-5 sm:grid-cols-[200px_1fr] sm:items-start">
      <div><p className="text-sm font-bold">{label}</p>{description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}</div>
      <div>{children}</div>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-[#DDE5E1] px-4 py-3 text-sm outline-none focus:border-[#21A05A] focus:ring-2 focus:ring-[#21A05A]/10';

export default function SettingsPage() {
  const { siteSettings, setSiteSettings } = useAdmin();
  const [saved, setSaved] = useState(false);
  const ogRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof typeof siteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSiteSettings((current) => ({ ...current, [key]: e.target.value }));
    setSaved(false);
  };

  const loadOgImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSiteSettings((current) => ({ ...current, ogImageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const s = siteSettings;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">사이트 설정</h2><p className="mt-1 text-sm text-slate-500">머니픽의 기본 정보, SEO, SNS 채널을 관리합니다.</p></div>
        <button type="button" onClick={save} className={`rounded-xl px-6 py-3 font-bold text-white transition ${saved ? 'bg-green-600' : 'bg-[#21A05A] hover:bg-[#17794A]'}`}>{saved ? '저장됨 ✓' : '변경사항 저장'}</button>
      </div>

      <div className="space-y-6">
        <section className="rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
          <div className="border-b border-[#EDF1EF] px-6 py-4"><h3 className="font-extrabold">기본 정보</h3></div>
          <div className="divide-y divide-[#EDF1EF] px-6">
            <Field label="사이트 이름" description="브라우저 탭에 표시됩니다.">
              <input value={s.siteName} onChange={update('siteName')} className={inputClass} />
            </Field>
            <Field label="슬로건" description="헤더와 OG 태그에 사용됩니다.">
              <input value={s.tagline} onChange={update('tagline')} className={inputClass} />
            </Field>
            <Field label="사이트 설명" description="검색 결과 미리보기에 표시됩니다.">
              <textarea value={s.description} onChange={update('description')} rows={3} className={`${inputClass} resize-none`} />
            </Field>
            <Field label="대표 이메일">
              <input type="email" value={s.contactEmail} onChange={update('contactEmail')} className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
          <div className="border-b border-[#EDF1EF] px-6 py-4"><h3 className="font-extrabold">SNS 채널</h3></div>
          <div className="divide-y divide-[#EDF1EF] px-6">
            <Field label="인스타그램 URL">
              <input value={s.instagramUrl} onChange={update('instagramUrl')} placeholder="https://instagram.com/moneypick" className={inputClass} />
            </Field>
            <Field label="유튜브 URL">
              <input value={s.youtubeUrl} onChange={update('youtubeUrl')} placeholder="https://youtube.com/@moneypick" className={inputClass} />
            </Field>
            <Field label="카카오채널 URL">
              <input value={s.kakaoUrl} onChange={update('kakaoUrl')} placeholder="https://pf.kakao.com/_xxxxx" className={inputClass} />
            </Field>
          </div>
        </section>

        <section className="rounded-3xl border border-[#E0E7E3] bg-white shadow-sm">
          <div className="border-b border-[#EDF1EF] px-6 py-4"><h3 className="font-extrabold">SEO / OG 이미지</h3><p className="mt-1 text-xs text-slate-400">카카오톡·페이스북 등 SNS 공유 시 표시되는 대표 이미지입니다. 권장 크기: 1200×630px</p></div>
          <div className="px-6 py-5">
            <input ref={ogRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadOgImage(e.target.files?.[0])} />
            {s.ogImageUrl ? (
              <div className="mb-4">
                <img src={s.ogImageUrl} alt="OG 이미지 미리보기" className="mb-3 h-40 w-full max-w-md rounded-2xl object-cover border border-[#E0E7E3]" />
                <button type="button" onClick={() => ogRef.current?.click()} className="rounded-xl bg-[#F1F5F3] px-4 py-2.5 text-sm font-bold text-[#17794A]">이미지 변경</button>
              </div>
            ) : (
              <button type="button" onClick={() => ogRef.current?.click()} className="flex h-36 w-full max-w-md items-center justify-center rounded-2xl border-2 border-dashed border-[#DDE5E1] text-sm text-slate-400 hover:border-[#21A05A] hover:bg-[#F7FBF9]">클릭해서 OG 이미지 업로드</button>
            )}
          </div>
        </section>

        <div className="flex justify-end pb-6">
          <button type="button" onClick={save} className={`rounded-xl px-8 py-3 font-bold text-white transition ${saved ? 'bg-green-600' : 'bg-[#21A05A] hover:bg-[#17794A]'}`}>{saved ? '저장됨 ✓' : '변경사항 저장'}</button>
        </div>
      </div>
    </div>
  );
}
