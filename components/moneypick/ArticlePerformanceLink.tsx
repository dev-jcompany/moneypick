'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

type Props = ComponentProps<typeof Link> & {
  dimensions: Record<string, string>;
};

export default function ArticlePerformanceLink({ dimensions, onClick, children, ...props }: Props) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const analyticsWindow = window as typeof window & {
      gtag?: (command: 'event', name: string, params: Record<string, string>) => void;
    };
    analyticsWindow.gtag?.('event', 'article_card_click', dimensions);
    window.dispatchEvent(new CustomEvent('moneypick:article-card-click', { detail: dimensions }));
    onClick?.(event);
  }

  return <Link {...props} onClick={handleClick}>{children}</Link>;
}
