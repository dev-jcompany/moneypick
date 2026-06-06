'use client';

import { useState } from 'react';
import type { Faq } from '@/src/types';

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y divide-[#E8ECEF] overflow-hidden rounded-2xl border border-[#E8ECEF] dark:divide-navy-700 dark:border-navy-700">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="bg-white dark:bg-navy-800">
            <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold" onClick={() => setOpenId(isOpen ? null : item.id)} aria-expanded={isOpen}>
              <span>Q. {item.question}</span><span className="text-[#21A05A]">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="px-5 pb-5 text-sm leading-7 text-[#5B6168] dark:text-slate-400">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
