# 07. RULES

> 모든 AI와 기여자가 따라야 하는 개발 규칙.

## 최우선 규칙 (AGENTS.md)

- 이 프로젝트의 Next.js는 표준 Next.js와 다른 Breaking Change를 포함할 수 있다. 코드를 작성하기 전 `node_modules/next/dist/docs/`의 관련 가이드를 반드시 확인하고, Deprecation 안내를 따른다.

## Design System

- Tailwind CSS 유틸리티 클래스를 기본으로 사용한다.
- 공용 UI는 `components/`에, 관리자 전용 UI는 `components/admin/`에 배치한다.
- 새로운 스타일 토큰(색상, 간격 등)을 추가하기 전 기존 컴포넌트에서 재사용 가능한 패턴이 있는지 먼저 확인한다.

## Naming

- 컴포넌트 파일: `PascalCase.tsx` (예: `PostCard.tsx`, `CalculatorClient.tsx`)
- 라우트 폴더: Next.js App Router 규칙을 따른다 (`[slug]`, `[category]`, `[id]` 등 동적 세그먼트).
- 데이터/타입 파일: `camelCase.ts` (예: `categories.ts`, `admin.ts`)
- 도메인 타입 이름은 단수형 명사를 사용한다 (`Post`, `Category`, `Calculator`).

## Accessibility

- 인터랙티브 요소(버튼, 링크, 폼)는 적절한 시맨틱 태그와 `aria-*` 속성을 사용한다.
- 이미지/아이콘에는 대체 텍스트를 제공한다.
- 색상만으로 정보를 구분하지 않는다 (카테고리 `color` 필드 외 아이콘/텍스트 병행).

## Coding Style

- TypeScript strict 지향: 도메인 타입은 `src/types`에 정의하고 재사용한다.
- 서버 컴포넌트/클라이언트 컴포넌트 경계를 명확히 한다 (`"use client"`가 필요한 경우만 사용).
- 불필요한 추상화, 미사용 코드, 과도한 방어 코드를 추가하지 않는다.
- 주석은 "왜"가 비직관적인 경우에만 최소한으로 작성한다.

## Git 규칙

- 지정된 작업 브랜치에서 개발한다.
- 커밋 메시지는 Conventional Commits 스타일을 따른다 (`feat:`, `fix:`, `docs:`, `chore:` 등).
- 하나의 논리적 작업 단위는 하나의 커밋으로 구성하는 것을 원칙으로 한다(작업 지시에 별도 명시가 있는 경우 그에 따른다).
- 작업 완료 시 `05_AI_HANDOVER.md`의 "작업 완료 절차"를 따른다.
