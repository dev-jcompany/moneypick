import Link from 'next/link';
import { categories } from '@/src/data/categories';

export default function Nav() {
  return (
    <nav
      className="bg-white dark:bg-navy-900 border-b border-[#E8ECEF] dark:border-navy-700"
      aria-label="카테고리 내비게이션"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        <ul className="flex items-center overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <li key={cat.id} className="shrink-0">
              <Link
                href={`/${cat.enSlug}`}
                className="flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-medium text-[#5B6168] dark:text-slate-400 hover:text-[#21A05A] dark:hover:text-[#21A05A] whitespace-nowrap border-b-2 border-transparent hover:border-[#21A05A] transition-colors"
              >
                <span aria-hidden="true" className="text-[15px]">{cat.icon}</span>
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
