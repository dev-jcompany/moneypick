import Link from 'next/link';
import { notFound } from 'next/navigation';
import MoneyPickArticle from '@/components/moneypick/MoneyPickArticle';
import { adminPath } from '@/lib/admin-path';
import { getMoneypickArticleByIdForAdmin, rowToArticleProps } from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ArticlePreviewPage({ params }: Props) {
  const { id } = await params;
  const row = await getMoneypickArticleByIdForAdmin(id);
  if (!row) notFound();

  const article = rowToArticleProps(row);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="sticky top-4 z-30 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-extrabold text-amber-900">
              {row.status === 'published' ? '발행본' : 'DRAFT'}
            </span>
            <strong className="text-sm text-amber-950">관리자 전용 저장본 미리보기</strong>
          </div>
          <p className="mt-1 text-xs text-amber-800">편집 화면에서 저장한 내용만 표시되며 공개 조회수에는 반영되지 않습니다.</p>
        </div>
        <Link
          href={adminPath(`/articles/${row.id}`)}
          className="shrink-0 rounded-xl bg-[#17794A] px-4 py-2 text-center text-sm font-bold text-white hover:bg-[#12643D]"
        >
          편집 화면으로 돌아가기
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <MoneyPickArticle {...article} />
      </div>
    </div>
  );
}
