import { getAllMoneypickArticles } from '@/lib/db';
import { buildPerformanceRows } from '@/lib/article-system/performance.mjs';

export const dynamic = 'force-dynamic';

export default async function ArticlePerformancePage() {
  const articles = await getAllMoneypickArticles();
  const rows = buildPerformanceRows(articles.filter((article) => article.status === 'published'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">아티클 성과 기준선</h1>
        <p className="mt-2 text-sm text-[#66736c]">Content Type × Pattern × Variant별 내부 조회수입니다. GA 이벤트에는 동일 차원이 전달되며 Search Console에서는 URL 기준으로 결합할 수 있습니다.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#e2e8e5] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f5f8f6] text-xs text-[#66736c]"><tr><th className="p-4">Content Type</th><th className="p-4">Pattern</th><th className="p-4">Variant</th><th className="p-4 text-right">글 수</th><th className="p-4 text-right">조회수</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={`${row.contentType}-${row.pattern}-${row.variant}`} className="border-t border-[#edf1ef]"><td className="p-4 font-bold">{row.contentType}</td><td className="p-4">{row.pattern}</td><td className="p-4">{row.variant}</td><td className="p-4 text-right">{row.articles.toLocaleString()}</td><td className="p-4 text-right font-bold">{row.views.toLocaleString()}</td></tr>)}
            {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-[#87928c]">발행된 성과 데이터가 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
