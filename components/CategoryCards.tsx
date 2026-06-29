import Link from 'next/link';
import { getVisibleCategories } from '@/lib/db';

const colorMap: Record<string, { iconBg: string }> = {
  green:   { iconBg: 'bg-green-50 dark:bg-green-900/20' },
  blue:    { iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  orange:  { iconBg: 'bg-orange-50 dark:bg-orange-900/20' },
  purple:  { iconBg: 'bg-purple-50 dark:bg-purple-900/20' },
  emerald: { iconBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
};

export default async function CategoryCards() {
  const categories = await getVisibleCategories();

  return (
    <section className="py-10 bg-[#F6F8FA] dark:bg-navy-900 border-b border-[#E8ECEF] dark:border-navy-700">
      <div className="max-w-[1200px] mx-auto px-4">
        <h2 className="text-lg font-bold text-[#1A1D1F] dark:text-white mb-5">카테고리 바로가기</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const c = colorMap[cat.color] ?? colorMap.green;
            return (
              <Link
                key={cat.id}
                href={`/${cat.enSlug}`}
                className="bg-white dark:bg-navy-800 rounded-xl border border-[#E8ECEF] dark:border-navy-700 p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-[#21A05A] dark:hover:border-[#21A05A] transition-all group"
              >
                <div
                  className={`w-11 h-11 rounded-full ${c.iconBg} flex items-center justify-center text-xl mb-2.5 group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                >
                  {cat.icon}
                </div>
                <h3 className="font-bold text-[#1A1D1F] dark:text-white text-[13px] mb-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-[#5B6168] dark:text-slate-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
