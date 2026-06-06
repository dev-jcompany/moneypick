'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAdmin } from '@/components/admin/AdminStore';

export default function NoticeEditorForm({ noticeId }: { noticeId?: string }) {
  const router = useRouter();
  const { notices, setNotices } = useAdmin();
  const existing = useMemo(() => notices.find((notice) => notice.id === noticeId), [notices, noticeId]);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [visible, setVisible] = useState(existing?.visible ?? true);

  const save = () => {
    if (!title.trim() || !content.replace(/<[^>]*>/g, '').trim()) return window.alert('제목과 내용을 입력해 주세요.');
    const next = { id: existing?.id ?? crypto.randomUUID(), title: title.trim(), content, visible, createdAt: existing?.createdAt ?? new Date().toISOString() };
    setNotices((current) => existing ? current.map((item) => item.id === existing.id ? next : item) : [next, ...current]);
    window.alert('공지사항을 저장했습니다.');
    router.push('/admin/notices');
  };

  return (
    <div className="mx-auto max-w-[950px]">
      <div className="mb-6 flex items-center justify-between gap-3"><div><h2 className="text-2xl font-extrabold">{existing ? '공지사항 수정' : '새 공지사항 작성'}</h2><p className="mt-1 text-sm text-slate-500">중요 안내를 블로그처럼 편하게 작성하세요.</p></div><button type="button" onClick={save} className="rounded-xl bg-[#21A05A] px-6 py-3 text-sm font-bold text-white">공지 저장</button></div>
      <section className="space-y-5 rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
        <label className="block"><span className="mb-2 block text-sm font-bold">공지 제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 머니픽 정식 오픈 안내" className="w-full rounded-2xl border border-[#DDE5E1] px-5 py-4 text-lg font-bold outline-none focus:border-[#21A05A]" /></label>
        <div><span className="mb-2 block text-sm font-bold">공지 내용</span><RichTextEditor value={content} onChange={setContent} /></div>
        <label className="flex items-center gap-3 rounded-2xl bg-[#F5F8F6] p-4"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} className="h-5 w-5 accent-[#21A05A]" /><span><strong className="block text-sm">사이트에 공개</strong><small className="text-slate-500">체크를 해제하면 목록에서 숨겨집니다.</small></span></label>
      </section>
    </div>
  );
}
