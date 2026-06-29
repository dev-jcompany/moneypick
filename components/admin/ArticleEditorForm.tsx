'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MoneypickArticleRow } from '@/components/moneypick/types';
import type { ArticleSavePayload } from '@/lib/db';
import { getArticleCategoryKeyFromPath, getArticleUrl } from '@/lib/article-url';
import { ARTICLE_CALCULATOR_OPTIONS, getDefaultRelatedCalculators } from '@/lib/article-calculators';
import { adminPath } from '@/lib/admin-path';
import type { Category } from '@/src/types';

type ArticleStatus = 'draft' | 'published';
type CategoryOption = {
  key: string;
  label: string;
};

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { key: 'loan', label: '대출연구소' },
  { key: 'estate', label: '부동산 가이드' },
  { key: 'tax', label: '세금 절약법' },
  { key: 'work', label: '직장인 머니' },
  { key: 'invest', label: '투자 첫걸음' },
];

function toSlug(title: string) {
  const raw = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  const limited = raw.length > 50 ? raw.slice(0, 50).replace(/-[^-]*$/, '') : raw;
  return limited || `article-${Date.now()}`;
}

function isValidImageUrl(value: string) {
  const url = value.trim();
  if (!url) return true;
  if (url.startsWith('data:image/') || url.startsWith('blob:')) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function splitHeroStat(value: string) {
  if (!value.includes('/')) return { value: '', label: '' };
  const [heroValue, ...labelParts] = value.split('/');
  return {
    value: heroValue.trim(),
    label: labelParts.join('/').trim(),
  };
}

async function imageFileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
    });

    const maxWidth = 1200;
    const scale = Math.min(1, maxWidth / image.width);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('이미지를 처리할 수 없습니다.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

interface Props {
  existing?: MoneypickArticleRow;
}

export default function ArticleEditorForm({ existing }: Props) {
  const router = useRouter();
  const isEdit = !!existing;
  const fallbackHeroStat = splitHeroStat(existing?.summary?.[0] ?? existing?.lead ?? '');

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(DEFAULT_CATEGORIES);
  const [categoryKey, setCategoryKey] = useState<string>(existing?.category_key ?? 'loan');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [slug, setSlug] = useState(existing?.slug ?? '');
  const [slugManual, setSlugManual] = useState(isEdit);
  const [metaDescription, setMetaDescription] = useState(existing?.meta_description ?? '');
  const [bodyHtml, setBodyHtml] = useState(existing?.body_html ?? '');
  const [heroValue, setHeroValue] = useState(existing?.hero_value ?? fallbackHeroStat.value);
  const [heroLabel, setHeroLabel] = useState(existing?.hero_label ?? fallbackHeroStat.label);
  const [readingTime, setReadingTime] = useState(existing?.reading_time ?? '');
  const [editor, setEditor] = useState(existing?.editor ?? '머니픽 에디터');
  const [relatedCalculatorHrefs, setRelatedCalculatorHrefs] = useState<string[]>(
    existing?.related_calculators?.length
      ? existing.related_calculators.map((calculator) => calculator.href)
      : getDefaultRelatedCalculators(existing?.category_key ?? 'loan').map((calculator) => calculator.href),
  );
  const [calculatorTouched, setCalculatorTouched] = useState(!!existing?.related_calculators?.length);
  const [tags, setTags] = useState(existing?.tags?.join(', ') ?? '');
  const [disclaimer, setDisclaimer] = useState(
    existing?.disclaimer ??
      '본 콘텐츠는 일반적인 정보 제공을 목적으로 하며 특정 개인을 위한 금융 자문이 아닙니다. 실제 적용 전 관련 기관의 최신 안내를 확인하시기 바랍니다.',
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(existing?.thumbnail_url ?? '');
  const [thumbUploading, setThumbUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  useEffect(() => {
    let ignore = false;
    fetch('/api/categories?visible=1')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (ignore || !data?.categories?.length) return;
        setCategoryOptions(
          data.categories.map((category: Category) => ({
            key: getArticleCategoryKeyFromPath(category.enSlug) ?? category.enSlug,
            label: category.name,
          })),
        );
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const categoryLabel = categoryOptions.find((category) => category.key === categoryKey)?.label ?? categoryOptions[0].label;
  const trimmedThumbnailUrl = thumbnailUrl.trim();
  const validThumbnailUrl = isValidImageUrl(trimmedThumbnailUrl);
  const selectedRelatedCalculators = ARTICLE_CALCULATOR_OPTIONS.filter((calculator) => relatedCalculatorHrefs.includes(calculator.href));

  async function saveExistingThumbnail(nextUrl: string) {
    if (!isEdit) return true;

    const response = await fetch(`/api/articles/${existing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnail_url: nextUrl }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? '대표 이미지 저장에 실패했습니다.');
      return false;
    }

    router.refresh();
    return true;
  }

  async function handleSave(status: ArticleStatus) {
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!bodyHtml.trim()) {
      setError('본문 HTML을 입력해주세요.');
      return;
    }
    if (!slug.trim()) {
      setError('슬러그를 확인해주세요.');
      return;
    }
    if (!validThumbnailUrl) {
      setError('대표 이미지 URL은 https://로 시작하는 실제 이미지 주소여야 합니다.');
      return;
    }

    setSaving(true);
    setError('');

    const payload: ArticleSavePayload = {
      slug: slug.trim(),
      category_key: categoryKey,
      category_label: categoryLabel,
      title: title.trim(),
      lead: existing?.lead?.trim() || metaDescription.trim(),
      meta_description: metaDescription.trim() || null,
      body_html: bodyHtml.trim(),
      summary: [],
      faq: [],
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      editor: editor.trim() || '머니픽 에디터',
      reading_time: readingTime.trim() || null,
      hero_value: heroValue.trim() || null,
      hero_label: heroLabel.trim() || null,
      related_calculators: selectedRelatedCalculators,
      disclaimer: disclaimer.trim() || null,
      thumbnail_url: trimmedThumbnailUrl || null,
      status,
    };

    const url = isEdit ? `/api/articles/${existing.id}` : '/api/articles';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? '저장에 실패했습니다.');
      return;
    }

    router.push(adminPath('/articles'));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-[#1a1d1f]">{isEdit ? '아티클 수정' : '새 아티클'}</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="rounded-lg border border-[#d7dbd8] bg-white px-4 py-2 text-[14px] font-semibold text-[#555] hover:bg-[#f4f6f4] disabled:opacity-50"
          >
            {saving ? '저장 중...' : '임시저장'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="rounded-lg bg-[#21A05A] px-5 py-2 text-[14px] font-bold text-white hover:bg-[#17794A] disabled:opacity-50"
          >
            {saving ? '저장 중...' : '발행'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-700">{error}</div>}

      <Card title="기본 정보">
        <Row label="카테고리">
          <select
            value={categoryKey}
            onChange={(event) => {
              const nextCategoryKey = event.target.value;
              setCategoryKey(nextCategoryKey);
              if (!calculatorTouched) {
                setRelatedCalculatorHrefs(getDefaultRelatedCalculators(nextCategoryKey).map((calculator) => calculator.href));
              }
            }}
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
          >
            {categoryOptions.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
        </Row>

        <Row label="제목 *">
          <input
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (!slugManual) setSlug(toSlug(nextTitle));
            }}
            placeholder="예: DSR 변경 가이드와 대출 한도 계산법"
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
          />
        </Row>

        <Row label="슬러그(URL)">
          <div className="flex gap-2">
            <input
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugManual(true);
              }}
              placeholder="dsr-guide"
              className="flex-1 rounded-lg border border-[#d7dbd8] px-3 py-2 font-mono text-[13px]"
            />
            <button
              type="button"
              onClick={() => {
                setSlug(toSlug(title));
                setSlugManual(false);
              }}
              className="rounded-lg border border-[#d7dbd8] px-3 py-2 text-[12px] text-[#555] hover:bg-[#f4f6f4]"
            >
              자동생성
            </button>
          </div>
          <p className="mt-1 text-[12px] text-[#9aa39c]">접속 URL: {getArticleUrl(categoryKey, slug || 'slug')}</p>
        </Row>

        <Row label="메타 설명">
          <textarea
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            rows={3}
            maxLength={180}
            placeholder="검색 결과와 공유 미리보기에 표시할 설명을 입력하세요."
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
          />
          <p className="mt-1 text-[12px] text-[#9aa39c]">{metaDescription.length}/180자</p>
        </Row>

        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="히어로 수치">
            <input
              value={heroValue}
              onChange={(event) => setHeroValue(event.target.value)}
              placeholder="0원"
              className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
            />
          </Row>
          <Row label="히어로 부제">
            <input
              value={heroLabel}
              onChange={(event) => setHeroLabel(event.target.value)}
              placeholder="절약 가능 금액"
              className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
            />
          </Row>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Row label="읽는 시간">
            <input
              value={readingTime}
              onChange={(event) => setReadingTime(event.target.value)}
              placeholder="5분"
              className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
            />
          </Row>
          <Row label="작성자">
            <input
              value={editor}
              onChange={(event) => setEditor(event.target.value)}
              className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
            />
          </Row>
        </div>
      </Card>

      <Card title="대표 이미지 (목록 전용)">
        <div className="rounded-xl border border-[#d7dbd8] bg-[#f8fafa] p-3 text-[12px] text-[#555]">
          <p className="mb-1.5 font-bold">이미지 배경색 가이드 — 카테고리 색으로 제작하세요</p>
          <div className="flex flex-wrap gap-2">
            {([['대출연구소','#27ab63'],['부동산 가이드','#3b82f6'],['세금 절약법','#f59e0b'],['직장인 머니','#8b5cf6'],['투자 첫걸음','#14b8a6']] as const).map(([label, color]) => (
              <span key={color} className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-white text-[11px] font-bold" style={{ backgroundColor: color }}>
                {label} {color}
              </span>
            ))}
          </div>
        </div>
        <Row label="이미지 파일 업로드">
          <input
            type="file"
            accept="image/*"
            disabled={thumbUploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              setThumbUploading(true);
              setError('');
              setUploadMessage('');
              try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                );
                const extension = file.name.split('.').pop();
                const path = `thumbnails/${Date.now()}.${extension}`;
                const { error: uploadError } = await supabase.storage.from('article-images').upload(path, file, { upsert: true });

                if (uploadError) {
                  const dataUrl = await imageFileToDataUrl(file);
                  setThumbnailUrl(dataUrl);

                  const saved = await saveExistingThumbnail(dataUrl);
                  if (saved) {
                    setUploadMessage(
                      isEdit
                        ? 'Storage 권한이 막혀 압축 이미지로 저장했습니다.'
                        : 'Storage 권한이 막혀 압축 이미지로 준비했습니다. 글을 저장하면 함께 반영됩니다.',
                    );
                  }
                } else {
                  const { data } = supabase.storage.from('article-images').getPublicUrl(path);
                  const publicUrl = data.publicUrl;
                  setThumbnailUrl(publicUrl);

                  if (await saveExistingThumbnail(publicUrl)) {
                    setUploadMessage(isEdit ? '대표 이미지가 저장되었습니다.' : '대표 이미지가 업로드되었습니다. 글을 저장하면 함께 반영됩니다.');
                  } else {
                    setThumbnailUrl('');
                  }
                }
              } catch (err) {
                setError('이미지 업로드 중 오류가 발생했습니다.');
                console.error(err);
              } finally {
                setThumbUploading(false);
              }
            }}
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px] file:mr-3 file:rounded-md file:border-0 file:bg-[#21A05A] file:px-3 file:py-1 file:text-[12px] file:font-bold file:text-white"
          />
          {thumbUploading && <p className="mt-1 text-[12px] text-[#21A05A]">업로드 중...</p>}
          {uploadMessage && <p className="mt-1 text-[12px] text-[#21A05A]">{uploadMessage}</p>}
        </Row>

        <Row label="또는 이미지 URL 직접 입력">
          <input
            value={thumbnailUrl}
            onChange={(event) => {
              setThumbnailUrl(event.target.value);
              setUploadMessage('');
            }}
            placeholder="https://..."
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[13px] font-mono"
          />
          {trimmedThumbnailUrl && !validThumbnailUrl && (
            <p className="mt-1 text-[12px] text-red-600">https://로 시작하는 실제 이미지 주소를 입력하세요.</p>
          )}
        </Row>

        {trimmedThumbnailUrl && validThumbnailUrl && (
          <div className="relative mt-2 overflow-hidden rounded-xl border border-[#e8ecef]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={trimmedThumbnailUrl} alt="대표 이미지 미리보기" className="h-40 w-full object-cover" />
            <button
              type="button"
              onClick={() => setThumbnailUrl('')}
              className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[12px] text-white hover:bg-black/70"
            >
              삭제
            </button>
          </div>
        )}
      </Card>

      <Card title="관련 계산기">
        <div className="grid gap-2 sm:grid-cols-2">
          {ARTICLE_CALCULATOR_OPTIONS.map((calculator) => (
            <label
              key={calculator.href}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#d7dbd8] px-3 py-2 text-[13px] font-semibold text-[#333] hover:bg-[#f7faf8]"
            >
              <input
                type="checkbox"
                checked={relatedCalculatorHrefs.includes(calculator.href)}
                onChange={(event) => {
                  setCalculatorTouched(true);
                  setRelatedCalculatorHrefs((current) =>
                    event.target.checked
                      ? [...new Set([...current, calculator.href])]
                      : current.filter((href) => href !== calculator.href),
                  );
                }}
                className="h-4 w-4 accent-[#21A05A]"
              />
              <span>{calculator.label}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setCalculatorTouched(false);
            setRelatedCalculatorHrefs(getDefaultRelatedCalculators(categoryKey).map((calculator) => calculator.href));
          }}
          className="mt-3 rounded-lg border border-[#d7dbd8] px-3 py-2 text-[12px] font-semibold text-[#555] hover:bg-[#f4f6f4]"
        >
          카테고리 기본 계산기로 되돌리기
        </button>
      </Card>

      <Card title="본문 HTML *">
        <div className="mb-3 rounded-xl bg-[#f4f9f6] p-4 text-[13px] text-[#4a5952]">
          <p className="mb-2 font-bold text-[#21A05A]">생성한 HTML을 그대로 붙여넣으세요.</p>
          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <span>
              <code className="rounded bg-white px-1">&lt;div class=&quot;mp-summary&quot;&gt;</code> 핵심요약
            </span>
            <span>
              <code className="rounded bg-white px-1">&lt;h2&gt;</code> 소제목
            </span>
            <span>
              <code className="rounded bg-white px-1">&lt;div class=&quot;mp-point&quot;&gt;</code> 강조 박스
            </span>
            <span>
              <code className="rounded bg-white px-1">&lt;div class=&quot;mp-warning&quot;&gt;</code> 주의 박스
            </span>
          </div>
        </div>
        <textarea
          value={bodyHtml}
          onChange={(event) => setBodyHtml(event.target.value)}
          rows={24}
          placeholder={`<div class="mp-summary">\n  <ul>\n    <li>핵심 포인트 1</li>\n    <li>핵심 포인트 2</li>\n  </ul>\n</div>\n\n<h2>소제목</h2>\n<p>본문 내용...</p>`}
          className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2.5 font-mono text-[13px] leading-relaxed"
        />
      </Card>

      <Card title="태그 및 면책조항">
        <Row label="태그(쉼표로 구분)">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="DSR, 대출한도, 주택담보대출"
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
          />
        </Row>
        <Row label="꼭 읽어주세요">
          <textarea
            value={disclaimer}
            onChange={(event) => setDisclaimer(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#d7dbd8] px-3 py-2 text-[14px]"
          />
        </Row>
      </Card>

      <div className="flex justify-end gap-3 border-t border-[#e8ecef] pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[#d7dbd8] px-5 py-2.5 text-[14px] font-semibold text-[#555] hover:bg-[#f4f6f4]"
        >
          취소
        </button>
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="rounded-lg border border-[#d7dbd8] px-5 py-2.5 text-[14px] font-semibold text-[#555] hover:bg-[#f4f6f4] disabled:opacity-50"
        >
          임시저장
        </button>
        <button
          type="button"
          onClick={() => handleSave('published')}
          disabled={saving}
          className="rounded-lg bg-[#21A05A] px-6 py-2.5 text-[14px] font-bold text-white hover:bg-[#17794A] disabled:opacity-50"
        >
          발행
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e8ecef] bg-white p-6">
      <h2 className="mb-5 text-[15px] font-extrabold text-[#1a1d1f]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[#555]">{label}</span>
      {children}
    </label>
  );
}
