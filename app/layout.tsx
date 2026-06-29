import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppShell from '@/components/AppShell';
import { siteUrl } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
        {/* eslint-disable-next-line react/no-danger */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(!t||t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();` }} />
      </head>
      <body className="bg-[#F6F8FA] dark:bg-navy-950 text-[#1A1D1F] dark:text-slate-100 min-h-screen flex flex-col">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
