'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAdmin } from '@/components/admin/AdminStore';
import type { AdminPost } from '@/src/types/admin';

export default function ContentEditorForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const { posts, setPosts, categories } = useAdmin();
  const existing = useMemo(() => posts.find((post) => post.id === postId), [posts, postId]);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [thumbnail, setThumbnail] = useState(existing?.thumbnail ?? '');
  const [tags, setTags] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);

  const save = (status: AdminPost['status']) => {
    if (!title.trim()) return window.alert('제목을 입력해 주세요.');
    if (!content.replace(/<[^>]*>/g, '').trim()) return window.alert('본문을 입력해 주세요.');
    const post: AdminPost = {
      id: existing?.id ?? crypto.randomUUID(),
      title: title.trim(),
      categoryId,
      content,
      thumbnail,
      status,
      views: existing?.views ?? 0,
      updatedAt: new Date().toISOString(),
    };
    setPosts((current) => existing ? current.map((item) => item.id === existing.id ? post : item) : [post, ...current]);
    window.alert(status === 'published' ? '콘텐츠를 발행했습니다.' : '임시 저장했습니다.');
    router.push('/admin/content');
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumbnail(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-extrabold">{existing ? '콘텐츠 수정' : '새 금융 가이드 작성'}</h2><p className="mt-1 text-sm text-slate-500">블로그를 쓰듯 제목, 사진, 본문을 채운 뒤 발행하세요.</p></div>
        <div className="flex gap-2"><button type="button" onClick={() => save('draft')} className="rounded-xl border border-[#CFD9D4] bg-white px-5 py-3 text-sm font-bold">임시저장</button><button type="button" onClick={() => save('published')} className="rounded-xl bg-[#21A05A] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#17794A]">{existing ? '수정 내용 발행' : '콘텐츠 발행'}</button></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <section className="space-y-5 rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
          <label className="block"><span className="mb-2 block text-sm font-bold">글 제목</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 2026년 청년 버팀목 전세자금대출 조건 총정리" className="w-full rounded-2xl border border-[#DDE5E1] px-5 py-4 text-lg font-bold outline-none focus:border-[#21A05A]" /></label>
          <div><span className="mb-2 block text-sm font-bold">본문</span><RichTextEditor value={content} onChange={setContent} placeholder="유익한 금융 정보를 자유롭게 작성하세요. 제목, 목록, 링크, 사진을 넣을 수 있습니다." /></div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm"><h3 className="mb-4 font-extrabold">발행 설정</h3><label className="block"><span className="mb-2 block text-xs font-bold text-slate-500">카테고리</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-xl border border-[#DDE5E1] px-3 py-3">{categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label><label className="mt-4 block"><span className="mb-2 block text-xs font-bold text-slate-500">태그</span><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="전세대출, DSR" className="w-full rounded-xl border border-[#DDE5E1] px-3 py-3 text-sm" /><small className="mt-2 block text-slate-400">쉼표로 구분해 입력하세요.</small></label></section>
          <section className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm"><h3 className="mb-4 font-extrabold">대표 이미지</h3>{thumbnail ? <img src={thumbnail} alt="대표 이미지 미리보기" className="mb-3 aspect-video w-full rounded-xl object-cover" /> : <button type="button" onClick={() => imageRef.current?.click()} className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-[#DDE5E1] text-sm text-slate-400">사진을 선택하세요</button>}<input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(event) => loadImage(event.target.files?.[0])} /><button type="button" onClick={() => imageRef.current?.click()} className="w-full rounded-xl bg-[#F1F5F3] py-2.5 text-sm font-bold text-[#17794A]">{thumbnail ? '이미지 변경' : '이미지 업로드'}</button></section>
        </aside>
      </div>
    </div>
  );
}
