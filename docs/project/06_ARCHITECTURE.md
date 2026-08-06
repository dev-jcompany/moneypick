# 06. ARCHITECTURE

## 개요

머니픽(MoneyPick)은 대출/부동산/세금/직장인/투자 등 생활 금융 정보를 제공하는 Next.js(App Router) 기반 웹 서비스이다. 현재는 정적 Mock 데이터로 동작하는 MVP 단계이다.

## 기술 스택

- **Framework**: Next.js (App Router), React, TypeScript
- **스타일**: Tailwind CSS (`@tailwindcss/postcss`)
- **데이터**: 정적 TypeScript 모듈 (`src/data/*.ts`) — 실 DB 미연동
- **검색**: `fuse.js`
- **엑셀/스프레드시트**: `exceljs`, `xlsx` (계산기 관련 기능 추정)
- **Lint**: ESLint (`eslint-config-next`)

## 폴더 구조

```
app/                    # Next.js App Router 라우트
  admin/                # 관리자 화면 (콘텐츠/공지/카테고리/태그/구독자/뉴스레터/미디어/사용자/설정/계산기)
  calculators/          # 계산기 목록 및 상세([slug])
  posts/                # 포스트 목록 및 상세([slug])
  [category]/           # 카테고리별 동적 라우트
  search/                # 검색
  news/, contact/, terms/, privacy/, disclaimer/, about/  # 정적 정보 페이지
  layout.tsx, page.tsx, globals.css, sitemap.ts, robots.ts

components/              # 공용 UI 컴포넌트 (Header, Nav, Footer, PostCard, CalculatorCards 등)
  admin/                 # 관리자 전용 컴포넌트 (AdminSidebar, ContentEditorForm, RichTextEditor 등)

src/
  data/                  # Mock 데이터 (categories, posts, faqs, notices, tags, calculators)
  types/                 # 공용 타입 정의 (index.ts, admin.ts)

docs/
  project/               # AI Project Operating System 문서 (본 체계)
```

## 공통 모듈

- **타입**: `src/types/index.ts`에 `Author`, `Category`, `Post`, `Faq`, `Tag`, `Calculator`, `Notice` 등 도메인 타입 정의. 관리자 전용 타입은 `src/types/admin.ts`.
- **데이터 소스**: `src/data/*.ts`가 현재 유일한 데이터 소스이며, 각 도메인 타입 배열을 export한다.
- **레이아웃/셸**: `components/AppShell.tsx`가 전역 레이아웃을 감싸는 것으로 추정되며, `Header`/`Nav`/`Footer`가 공용 프레임을 구성한다.

## API 구조

- 현재 `app/api` 라우트는 존재하지 않는다. 데이터는 서버 컴포넌트에서 `src/data`를 직접 import하는 방식으로 사용 중일 가능성이 높다.
- 향후 실 데이터 연동 시 API 구조는 이 문서에 갱신되어야 한다.

## 카테고리 도메인 (참고)

현재 정의된 카테고리(`src/data/categories.ts`): 대출연구소, 부동산연구소, 세금연구소, 직장인연구소, 투자연구소 등.
