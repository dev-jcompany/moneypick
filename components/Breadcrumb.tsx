import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="현재 위치" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-[#8A949E] dark:text-slate-500">
        <li><Link href="/" className="hover:text-[#21A05A]">홈</Link></li>
        {items.map((item) => (
          <li key={`${item.label}-${item.href ?? ''}`} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? <Link href={item.href} className="hover:text-[#21A05A]">{item.label}</Link> : <span className="text-[#5B6168] dark:text-slate-300">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
