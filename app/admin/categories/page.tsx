'use client';

import { useEffect, useState } from 'react';
import type { Category } from '@/src/types';

type CategoryForm = Category & {
  saving?: boolean;
};

const COLOR_OPTIONS = ['green', 'blue', 'orange', 'purple', 'emerald', 'gray'];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function toPayload(category: CategoryForm) {
  return {
    name: category.name,
    slug: category.slug || category.name,
    en_slug: category.enSlug,
    icon: category.icon,
    description: category.description,
    color: category.color,
    enabled: category.enabled !== false,
    sort_order: category.sortOrder ?? 100,
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('💡');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/categories');
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? '카테고리를 불러오지 못했습니다.');
      setCategories(body.categories ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '카테고리를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    fetch('/api/categories')
      .then((response) => response.json().then((body) => ({ response, body })))
      .then(({ response, body }) => {
        if (ignore) return;
        if (!response.ok) throw new Error(body.error ?? '카테고리를 불러오지 못했습니다.');
        setCategories(body.categories ?? []);
      })
      .catch((e) => {
        if (!ignore) setError(e instanceof Error ? e.message : '카테고리를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function add() {
    const name = newName.trim();
    if (!name) return;

    setError('');
    const payload = {
      name,
      slug: name,
      en_slug: normalizeSlug(name),
      icon: newIcon.trim() || '💡',
      description: `${name}의 실용 정보를 제공합니다.`,
      color: 'green',
      enabled: true,
      sort_order: categories.length + 1,
    };

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error ?? '카테고리 추가에 실패했습니다.');
      return;
    }

    setNewName('');
    setNewIcon('💡');
    await load();
  }

  async function save(category: CategoryForm) {
    setError('');
    setCategories((current) => current.map((item) => item.id === category.id ? { ...item, saving: true } : item));

    const response = await fetch(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(category)),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setError(body.error ?? '카테고리 저장에 실패했습니다.');

    setCategories((current) => current.map((item) => item.id === category.id ? { ...item, saving: false } : item));
    if (response.ok) await load();
  }

  async function remove(category: CategoryForm) {
    if (!window.confirm('이 카테고리를 삭제할까요?')) return;
    setError('');
    const response = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error ?? '카테고리 삭제에 실패했습니다.');
      return;
    }
    await load();
  }

  function patch(id: string, values: Partial<CategoryForm>) {
    setCategories((current) => current.map((category) => category.id === id ? { ...category, ...values } : category));
  }

  return (
    <div className="mx-auto max-w-[1050px]">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold">카테고리 설정</h2>
        <p className="mt-1 text-sm text-slate-500">
          사용 중인 카테고리만 FO GNB와 카테고리 홈에 노출됩니다.
        </p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

      <section className="mb-6 rounded-3xl border border-[#E0E7E3] bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-extrabold">새 카테고리 추가</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newIcon}
            onChange={(event) => setNewIcon(event.target.value)}
            className="w-full rounded-xl border border-[#DDE5E1] px-4 py-3 text-center sm:w-20"
            aria-label="카테고리 아이콘"
          />
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="예: 정부지원금"
            className="flex-1 rounded-xl border border-[#DDE5E1] px-4 py-3"
          />
          <button type="button" onClick={add} className="rounded-xl bg-[#21A05A] px-5 py-3 font-bold text-white">
            추가
          </button>
        </div>
      </section>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-[#DDE5E1] p-10 text-center text-sm text-slate-400">
          카테고리를 불러오는 중입니다.
        </div>
      ) : (
        <section className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-[#E0E7E3] bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[72px_minmax(150px,220px)_minmax(140px,180px)_1fr_120px]">
                <input
                  value={category.icon}
                  onChange={(event) => patch(category.id, { icon: event.target.value })}
                  className="rounded-xl border border-[#DDE5E1] px-3 py-3 text-center"
                  aria-label={`${category.name} 아이콘`}
                />
                <input
                  value={category.name}
                  onChange={(event) => {
                    const name = event.target.value;
                    patch(category.id, {
                      name,
                      slug: name,
                      enSlug: category.enSlug || normalizeSlug(name),
                    });
                  }}
                  className="rounded-xl border border-[#DDE5E1] px-3 py-3 font-bold"
                />
                <input
                  value={category.enSlug}
                  onChange={(event) => patch(category.id, { enSlug: normalizeSlug(event.target.value) })}
                  placeholder="url-key"
                  className="rounded-xl border border-[#DDE5E1] px-3 py-3 font-mono text-sm"
                />
                <input
                  value={category.description}
                  onChange={(event) => patch(category.id, { description: event.target.value })}
                  className="rounded-xl border border-[#DDE5E1] px-3 py-3 text-sm"
                />
                <select
                  value={category.color}
                  onChange={(event) => patch(category.id, { color: event.target.value })}
                  className="rounded-xl border border-[#DDE5E1] px-3 py-3 text-sm"
                >
                  {COLOR_OPTIONS.map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF1EF] pt-3">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-[#17211D]">
                  <input
                    type="checkbox"
                    checked={category.enabled !== false}
                    onChange={(event) => patch(category.id, { enabled: event.target.checked })}
                    className="h-4 w-4 accent-[#21A05A]"
                  />
                  {category.enabled !== false ? '사용' : '미사용'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={category.sortOrder ?? 100}
                    onChange={(event) => patch(category.id, { sortOrder: Number(event.target.value) })}
                    className="w-24 rounded-xl border border-[#DDE5E1] px-3 py-2 text-sm"
                    aria-label="노출 순서"
                  />
                  <button
                    type="button"
                    onClick={() => save(category)}
                    disabled={category.saving}
                    className="rounded-xl bg-[#10231B] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {category.saving ? '저장 중' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(category)}
                    className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
