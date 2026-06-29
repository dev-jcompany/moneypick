'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ArticlePublishButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    if (!window.confirm(`"${title}" 글을 발행할까요?`)) return;

    setIsPublishing(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        window.alert(result?.error ?? '글 발행에 실패했습니다.');
        return;
      }

      router.refresh();
    } catch {
      window.alert('글 발행 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={isPublishing}
      className="rounded-md border border-green-200 px-3 py-1.5 text-[12px] font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPublishing ? '발행 중' : '발행'}
    </button>
  );
}
