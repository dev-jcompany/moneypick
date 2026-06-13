'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAdmin } from '@/components/admin/AdminStore';
import { supabase } from '@/lib/supabase';
import { generatePostNumber, getPostUrl } from '@/lib/url';
import type { AdminPost } from '@/src/types/admin';

function toKoreanSlug(title: string) {
  const base = title
    .trim()
    .replace(/[：:]/g, '')
    .replace(/[·•\-–—]/g, '-')
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
  return base || `post-${Date.now()}`;
}

function toEnSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export default function ContentEditorForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const { posts, setPosts, categories } = useAdmin();
  const existing = useMemo(() => posts.find((p) => p.id === postId), [posts, postId]);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [thumbnail, setThumbnail] = useState(existing?.thumbnail ?? '');
  const [tags, setTags] = useState('');
  const [englishSlug, setEnglishSlug] = useState(existing?.englishSlug ?? '');
  const [enSlugTouched, setEnSlugTouched] = useState(!!existing?.englishSlug);
  const imageRef = useRef<HTMLInputElement>(null);

  // 제목 변경 시 영문 slug 자동 생성 (수동 수정 전까지만)
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!enSlugTouched) {
      const words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const ascii = words
        .map((w) => w.replace(/[^a-z0-9]/g, ''))
        .filter(Boolean)
        .slice(0, 5)
        .join('-');
      // 한글 제목 등 영문 추출 불가 시 날짜 기반 자동 생성
      const fallback = ascii || `post-${new Date().toISOString().slice(0, 10)}`;
      setEnglishSlug(fallback);
    }
  };

  const save = async (status: AdminPost['status']) => {
    if (!title.trim()) return window.alert('제목을 입력해 주세요.');
    if (!content.replace(/<[^>]*>/g, '').trim()) return window.alert('본문을 입력해 주세요.');
    // 영문 slug 비어있으면 날짜+ID 기반으로 자동 생성
    const enSlugClean = toEnSlug(englishSlug) || `post-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 6)}`;
    if (!toEnSlug(englishSlug)) setEnglishSlug(enSlugClean);

    const newId = existing?.id ?? crypto.randomUUID();
    const slug = existing?.slug ?? `${toKoreanSlug(title.trim())}-${newId.slice(0, 8)}`;
    const postNumber = existing?.postNumber ?? generatePostNumber(categoryId);

    const post: AdminPost = {
      id: newId,
      title: title.trim(),
      slug,
      postNumber,
      englishSlug: enSlugClean,
      categoryId,
      content,
      thumbnail,
      status,
      views: existing?.views ?? 0,
      updatedAt: new Date().toISOString(),
    };

    setPosts((current) =>
      existing
        ? current.map((item) => item.id === existing.id ? post : item)
        : [post, ...current]
    );

    // Supabase 저장
    const { error } = await supabase.from('posts').upsert({
      id: post.id,
      title: post.title,
      slug,
      post_number: post.postNumber,
      english_slug: enSlugClean,
      category_id: post.categoryId || null,
      status: post.status,
      content: post.content,
      thumbnail: post.thumbnail,
      views: post.views,
      updated_at: post.updatedAt,
    }, { onConflict: 'id' });

    if (error) { window.alert(`Supabase 저장 오류: ${error.message}`); return; }

    const previewUrl = getPostUrl({ ...post, slug, postNumber, englishSlug: enSlugClean });
    window.alert(
      status === 'published'
        ? `콘텐츠를 발행했습니다.\n\nURL: ${previewUrl}`
        : '임시 저장했습니다.'
    );
    router.push('/admin/content');
  };

  const loadImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumbnail(String(reader.result));
    reader.readAsDataURL(file);
  };

  const cat = categories.find((c) => c.id === categoryId);
  const previewUrl = englishSlug && existing?.postNumber
    ? `/${cat?.enSlug ?? 'post'}/${existing.postNumber}-${toEnSlug(englishSlug)}`
    : `/{카테고리}/{번호}-${toEnSlug(englishSlug) || 'english-slug'}`;

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">{existing ? '콘텐츠 수정' : '새 금융 가이드 작성'}</h2>
          <p className="mt-1 text-sm text-slate-500">제목, 영문 URL, 사진, 본문을 작성 후 발행하세요.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => save('draft')} className="rounded-xl border border-[#CFD9D4] bg-white px-5 py-3 text-sm font-bold">임시저장</button>
          <button type="button" onClick={() => save('published')} className="rounded-xl bg-[#21A05A] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#17794A]">
            {existing ? '수정 내용 발행' : '콘텐츠 발행'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        {/* 본문 영역 */}
        <section className="space-y-5 rounded-3xl border border-[#E0E7E3] bg-white p-6 shadow-sm">
          <label className="block">
            <span className="mb-2 block text-sm font-bold">글 제목</span>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="예: 2026년 청년 버팀목 전세자금대출 조건 총정리"
              className="w-full rounded-2xl border border-[#DDE5E1] px-5 py-4 text-lg font-bold outline-none focus:border-[#21A05A]"
            />
          </label>

          {/* 영문 URL slug */}
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              영문 URL Slug
              <span className="ml-2 text-[11px] font-normal text-slate-400">(소문자·숫자·하이픈만 사용)</span>
            </span>
            <div className="flex items-center rounded-2xl border border-[#DDE5E1] focus-within:border-[#21A05A] overflow-hidden">
              <span className="shrink-0 bg-[#F6F8FA] px-3 py-3.5 text-[12px] text-slate-400 border-r border-[#DDE5E1]">
                /{cat?.enSlug ?? 'category'}/
                {existing?.postNumber
                  ? `${existing.postNumber}-`
                  : `{번호}-`}
              </span>
              <input
                value={englishSlug}
                onChange={(e) => { setEnSlugTouched(true); setEnglishSlug(e.target.value); }}
                placeholder="dsr-guide"
                className="flex-1 px-3 py-3.5 text-sm outline-none bg-white"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              최종 URL: <span className="font-mono text-[#21A05A]">{previewUrl}</span>
            </p>
          </label>

          <div>
            <span className="mb-2 block text-sm font-bold">본문</span>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="유익한 금융 정보를 자유롭게 작성하세요."
            />
          </div>
        </section>

        {/* 우측 설정 패널 */}
        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-extrabold">발행 설정</h3>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-500">카테고리</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-[#DDE5E1] px-3 py-3"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-bold text-slate-500">태그</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="전세대출, DSR"
                className="w-full rounded-xl border border-[#DDE5E1] px-3 py-3 text-sm"
              />
              <small className="mt-2 block text-slate-400">쉼표로 구분해 입력하세요.</small>
            </label>
            {/* 번호 체계 안내 */}
            {existing?.postNumber && (
              <div className="mt-4 rounded-xl bg-[#F6F8FA] px-3 py-2.5 text-[11px] text-slate-500">
                <span className="font-bold">포스트 번호:</span> {existing.postNumber}
                <span className="ml-2 text-slate-400">(자동 부여, 변경 불가)</span>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-extrabold">대표 이미지</h3>
            {thumbnail ? (
              <img src={thumbnail} alt="" className="mb-3 aspect-video w-full rounded-xl object-cover" />
            ) : (
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="mb-3 flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-[#DDE5E1] text-sm text-slate-400"
              >
                사진을 선택하세요
              </button>
            )}
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => loadImage(e.target.files?.[0])} />
            <button type="button" onClick={() => imageRef.current?.click()} className="w-full rounded-xl bg-[#F1F5F3] py-2.5 text-sm font-bold text-[#17794A]">
              {thumbnail ? '이미지 변경' : '이미지 업로드'}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
