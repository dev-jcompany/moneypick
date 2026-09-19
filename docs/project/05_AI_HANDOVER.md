# 05. AI HANDOVER

> **가장 중요한 문서.** 모든 AI는 작업을 시작하기 전에 반드시 이 문서를 읽는다.
>
> 읽는 순서: `00_PROJECT_STATUS.md` → `05_AI_HANDOVER.md`(본 문서) → `07_RULES.md` → 현재 작업 확인 → 작업 시작

## 현재 Sprint

- Sprint 0 (2026-08): AI-POS 문서 체계 구축

## 현재 작업

- `docs/project` 문서 체계(AI-POS) 최초 구축 완료
- 프로젝트는 Next.js 기반 Mock 데이터 MVP 상태이며, 실 백엔드/DB 연동 전 단계

## 주의사항

- `AGENTS.md`에 명시된 대로, 이 프로젝트가 사용하는 Next.js 버전은 표준 Next.js와 다를 수 있는 Breaking Change가 포함되어 있다. 코드를 작성하기 전 `node_modules/next/dist/docs/` 문서를 확인할 것.
- 현재 모든 콘텐츠/카테고리/태그/공지/계산기 데이터는 `src/data/*.ts`의 정적 Mock 데이터이다. 실 DB가 아니므로 관리자 화면에서의 변경은 영속되지 않을 수 있다.
- `app/admin/**`는 인증/권한 체크가 아직 없는 UI 단계이다. 운영 배포 전 반드시 보호 처리가 필요하다.
- 작업 완료 시 아래 "작업 완료" 절차를 반드시 따른다.

## 다음 작업

- 실 데이터 소스(DB 또는 CMS) 연동 방식 결정 및 설계
- 관리자 인증/권한 체계 설계
- `02_TODO.md`의 HIGH 항목부터 순서대로 진행

## 작업 시작 절차

1. `00_PROJECT_STATUS.md` 읽기
2. `05_AI_HANDOVER.md`(본 문서) 읽기
3. `07_RULES.md` 읽기
4. 현재 작업 확인
5. 작업 시작

## 작업 완료 절차

1. `00_PROJECT_STATUS.md` 갱신
2. `02_TODO.md` 갱신
3. `04_CHANGELOG.md` 작성
4. `worklog/YYYY-MM.md` 작성
5. `05_AI_HANDOVER.md`(본 문서) 업데이트
6. Git Commit
