'use client';

import { useEffect } from 'react';

export default function ArticleViewTracker({ dimensions }: { dimensions: Record<string, string> }) {
  useEffect(() => {
    const analyticsWindow = window as typeof window & {
      gtag?: (command: 'event', name: string, params: Record<string, string>) => void;
    };
    analyticsWindow.gtag?.('event', 'article_view', dimensions);
    window.dispatchEvent(new CustomEvent('moneypick:article-view', { detail: dimensions }));
  }, [dimensions]);
  return null;
}
