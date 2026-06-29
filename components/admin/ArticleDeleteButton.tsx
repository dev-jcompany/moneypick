'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ArticleDeleteButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!window.confirm(`"${title}" 글을 삭제할까요?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        window.alert(result?.error ?? '글 삭제에 실패했습니다.');
        return;
      }

      router.refresh();
    } catch {
      window.alert('글 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-md border border-red-200 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? '삭제 중' : '삭제'}
    </button>
  );
}
