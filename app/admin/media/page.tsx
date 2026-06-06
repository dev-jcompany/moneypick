'use client';

import { useRef, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminStore';

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function MediaPage() {
  const { media, setMedia } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const upload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        setMedia((current) => [{ id: crypto.randomUUID(), filename: file.name, dataUrl: String(reader.result), size: file.size, uploadedAt: new Date().toISOString() }, ...current]);
      };
      reader.readAsDataURL(file);
    });
  };

  const copyUrl = (id: string, dataUrl: string) => {
    navigator.clipboard.writeText(dataUrl).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const remove = (id: string) => {
    if (window.confirm('이 이미지를 삭제할까요?')) setMedia((current) => current.filter((m) => m.id !== id));
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">미디어 라이브러리</h2><p className="mt-1 text-sm text-slate-500">업로드한 이미지를 한 곳에서 관리하고 콘텐츠에 재사용하세요.</p></div>
        <button type="button" onClick={() => inputRef.current?.click()} className="rounded-xl bg-[#21A05A] px-5 py-3 text-sm font-bold text-white hover:bg-[#17794A]">+ 이미지 업로드</button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">전체 이미지</p><strong className="mt-2 block text-3xl">{media.length}</strong></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">총 용량</p><strong className="mt-2 block text-3xl">{formatSize(media.reduce((acc, m) => acc + m.size, 0))}</strong></div>
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E0E7E3]"><p className="text-xs font-bold text-slate-500">최근 업로드</p><strong className="mt-2 block text-3xl">{media.length > 0 ? new Date(media[0].uploadedAt).toLocaleDateString('ko-KR') : '-'}</strong></div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`mb-6 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed py-12 transition ${dragging ? 'border-[#21A05A] bg-green-50' : 'border-[#D0D9D4] bg-white hover:border-[#21A05A] hover:bg-[#F7FBF9]'}`}
      >
        <span className="mb-2 text-4xl">🖼</span>
        <p className="font-bold text-slate-600">이미지를 드래그하거나 클릭해서 업로드</p>
        <p className="mt-1 text-sm text-slate-400">JPG, PNG, GIF, WebP · 여러 파일 동시 업로드 가능</p>
      </div>

      {media.length === 0 ? (
        <div className="rounded-3xl border border-[#E0E7E3] bg-white py-16 text-center text-slate-400">업로드된 이미지가 없습니다.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-2xl border border-[#E0E7E3] bg-white shadow-sm">
              <div className="relative aspect-video overflow-hidden bg-[#F4F7F5]">
                <img src={item.dataUrl} alt={item.filename} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => copyUrl(item.id, item.dataUrl)} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700">{copied === item.id ? '복사됨 ✓' : 'URL 복사'}</button>
                  <button type="button" onClick={() => remove(item.id)} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-bold text-white">삭제</button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-slate-700">{item.filename}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{formatSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
