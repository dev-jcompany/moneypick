import Link from 'next/link';
import ArticleDeleteButton from '@/components/admin/ArticleDeleteButton';
import ArticlePublishButton from '@/components/admin/ArticlePublishButton';
import { getAllMoneypickArticles } from '@/lib/db';
import { getArticleUrl } from '@/lib/article-url';
import { adminPath } from '@/lib/admin-path';

export const dynamic = 'force-dynamic';

const CATEGORY_COLOR: Record<string, string> = {
  loan: 'bg-green-100 text-green-700',
  estate: 'bg-blue-100 text-blue-700',
  tax: 'bg-orange-100 text-orange-700',
  work: 'bg-purple-100 text-purple-700',
  invest: 'bg-teal-100 text-teal-700',
};

function sourceLabel(source?: string | null) {
  if (source === 'claude_desktop') return 'Claude Desktop';
  return source || '관리자';
}

function displayTags(tags?: string[]) {
  if (!Array.isArray(tags) || tags.length === 0) return '태그 없음';
  return tags.slice(0, 3).join(', ');
}

export default async function AdminArticlesPage() {
  const articles = await getAllMoneypickArticles();

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1d1f]">글 목록</h1>
          <p className="mt-1 text-sm text-[#66736c]">임시저장 글을 확인하고 수정 후 수동 발행합니다.</p>
        </div>
        <Link
          href={adminPath('/articles/new')}
          className="rounded-lg bg-[#21A05A] px-5 py-2.5 text-center text-[14px] font-bold text-white hover:bg-[#17794A]"
        >
          새 글 작성
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d7dbd8] py-16 text-center text-[#9aa39c]">
          등록된 글이 없습니다.
          <br />
          <Link href={adminPath('/articles/new')} className="mt-2 inline-block text-[#21A05A] hover:underline">
            첫 글 작성하기
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e8ecef] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[14px]">
              <thead className="border-b border-[#e8ecef] bg-[#f8fafa]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-[#555]">제목</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">카테고리</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">태그</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">출처</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">상태</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">등록일</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#555]">관리</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => {
                  const articleUrl = getArticleUrl(article.category_key, article.slug);

                  return (
                    <tr key={article.id} className="border-b border-[#f1f3f1] last:border-b-0 hover:bg-[#fafafa]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {article.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={article.thumbnail_url} alt="" className="h-12 w-20 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-[#f0f5f2] text-xs font-bold text-[#8a9790]">
                              이미지 없음
                            </div>
                          )}
                          <Link href={articleUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 hover:underline">
                            <p className="truncate font-semibold text-[#1a1d1f]">{article.title}</p>
                            <p className="truncate text-[12px] text-[#9aa39c]">{articleUrl}</p>
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${CATEGORY_COLOR[article.category_key] ?? 'bg-gray-100 text-gray-600'}`}>
                          {article.category_label}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-4 text-[13px] text-[#66736c]">{displayTags(article.tags)}</td>
                      <td className="px-4 py-4 text-[13px] font-semibold text-[#66736c]">{sourceLabel(article.source)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {article.status === 'published' ? '발행' : '임시저장'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[13px] text-[#9aa39c]">{article.created_at.slice(0, 10)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={adminPath(`/articles/${article.id}`)}
                            className="rounded-md border border-[#d7dbd8] px-3 py-1.5 text-[12px] font-semibold text-[#555] hover:bg-[#f4f6f4]"
                          >
                            수정
                          </Link>
                          {article.status !== 'published' ? <ArticlePublishButton articleId={article.id} title={article.title} /> : null}
                          <ArticleDeleteButton articleId={article.id} title={article.title} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
