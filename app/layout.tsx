import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: {
    default: '머니픽 — 돈이 모이는 선택, MoneyPick',
    template: '%s | 머니픽',
  },
  description:
    '대출, 부동산, 세금, 투자까지 꼭 필요한 금융정보를 쉽고 정확하게 제공합니다. 전세대출, DSR, 연말정산, 실업급여 계산기 무료 제공.',
  keywords: ['머니픽', 'MoneyPick', '전세대출', 'DSR', '부동산', '세금', '연말정산', '실업급여', 'ISA', '자동차세', '연봉 실수령액'],
  openGraph: {
    title: '머니픽 — 돈이 모이는 선택',
    description: '대출, 부동산, 세금, 투자까지 꼭 필요한 금융정보를 쉽고 정확하게 제공합니다.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '머니픽(MoneyPick)',
  },
  // TODO: 다음 단계에서 추가 — sitemap.ts, robots.ts, JSON-LD 구조화 데이터
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){var s=localStorage.getItem('theme');var p=s||'dark';if(p==='dark')document.documentElement.classList.add('dark');})();`}</Script>
      </head>
      <body className="bg-[#F6F8FA] dark:bg-navy-950 text-[#1A1D1F] dark:text-slate-100 min-h-screen flex flex-col">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
