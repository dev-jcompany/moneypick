import type { ArticleCard } from '@/lib/db';
import { getArticleUrl } from '@/lib/article-url';
import { cardVariantFor, performanceDimensions, type CardVariant } from '@/lib/article-system/display.mjs';
import ArticlePerformanceLink from './ArticlePerformanceLink';

export default function ArticleCardV2({ article, index = 0, placement }: { article: ArticleCard; index?: number; placement: string }) {
  const variant: CardVariant = cardVariantFor(article, index);
  const href = getArticleUrl(article.category_key, article.slug);
  const dimensions = performanceDimensions(article, placement, variant);
  const featured = variant === 'featured';

  return (
    <article className={`h-full overflow-hidden rounded-2xl border border-[#E8ECEF] bg-white transition hover:-translate-y-0.5 hover:border-[#21A05A] hover:shadow-md dark:border-navy-700 dark:bg-navy-800 ${featured ? 'sm:col-span-2' : ''}`}>
      <ArticlePerformanceLink href={href} dimensions={dimensions} className={featured ? 'grid h-full sm:grid-cols-2' : 'flex h-full flex-col'}>
        {article.thumbnail_url && variant !== 'compact' && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.thumbnail_url} alt="" className="aspect-[16/9] h-full w-full object-cover" loading="lazy" />
        )}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2 text-[11px]">
            {variant === 'numbered' && <span className="font-extrabold text-[#21A05A]">#{index + 1}</span>}
            <span className="rounded-full bg-green-50 px-2 py-1 font-semibold text-[#21A05A] dark:bg-green-900/20">{article.category_label}</span>
            <span className="text-[#8A949E]">{article.reading_time ?? '5분'}</span>
          </div>
          <h3 className={`${featured ? 'text-[20px]' : 'text-[15px]'} mb-2 font-bold leading-snug text-[#1A1D1F] dark:text-white`}>{article.title}</h3>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-[#5B6168] dark:text-slate-400">{article.lead}</p>
          <span className="mt-4 text-xs font-bold text-[#21A05A]">자세히 보기 →</span>
        </div>
      </ArticlePerformanceLink>
    </article>
  );
}
