# 머니픽 보안 기준선 — 2026-08-12

## 결론

현재 저장소의 Next.js 취약 버전과 관리자 페이지의 Proxy 단독 인증 의존은 해소했다. 다만 Production 환경변수와 Supabase RLS는 운영 환경에서 아직 검증되지 않았으므로 배포 완료 상태로 간주하지 않는다.

## 2026-08-12 적용 사항

- Next.js 및 `eslint-config-next`를 16.2.7에서 16.3.0으로 고정 업그레이드
- 모든 `/admin` Server Component에 공통 서버 인증 재검증 적용
- Proxy 인증은 조기 차단용 optimistic check로만 유지
- 로그인 화면을 보호 레이아웃 밖의 내부 rewrite 전용 경로로 분리하고 직접 접근은 404 처리
- Production dependency audit 취약점 5건(High 2, Moderate 3) 패치 후 0건 확인
- 로그인 API에 IP별 15분 10회 제한과 4KB 요청 제한 적용
- 문의 API에 IP별 10분 5회 제한과 16KB 요청 제한 적용
- 정규식 HTML 정제를 허용목록 기반 `sanitize-html`로 교체
- 관리자 로그아웃 API와 UI 추가, 인증 쿠키 즉시 만료 처리
- 로그인 `from` 매개변수를 관리자 내부 경로로 제한하여 외부 URL 이동 차단
- Vitest 기반 보안 회귀테스트 추가

## 검증 결과

| 항목 | 결과 | 증빙/비고 |
| --- | --- | --- |
| Next.js 버전 | PASS | `next@16.3.0` |
| Production build | PASS | `npm run build`, Next.js 16.3.0 컴파일 및 타입 검사 성공 |
| ESLint | PASS (경고 26건) | 오류 0건, 기존 이미지 최적화·미사용 항목 경고 |
| Production dependency audit | PASS | `npm audit --omit=dev`: 0 vulnerabilities |
| 로컬 무인증 라우트 회귀 | PASS | 관리자 문의 307, 로그인 200, 내부 로그인 경로 404, 쓰기 API 401 |
| API 남용 방지 회귀 | PASS | 로그인 11번째 요청 429, 로그인·문의 초과 본문 413 |
| 로그아웃 회귀 | PASS | 응답 200 및 `admin_auth` Max-Age=0 확인 |
| 자동 보안 회귀 | PASS | `npm run security:test`: 2 files, 7 tests 통과 |
| 로컬 보안 환경 검사 | PASS | 관리자 비밀번호 정책은 운영 결정에 따라 최소 14자로 설정, 실제 값은 16자 확인 |
| Vercel Production 환경변수 | PASS | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_AUTH_SECRET` 교체 및 암호화 등록 확인 |
| Supabase Production RLS | PASS | 존재하는 대상 테이블 9개 모두 RLS 활성화, anon/public 쓰기 정책 조회 0건 |
| 문의 테이블 운영 상태 | PASS | Production 테이블 생성, RLS 활성화, 정책 0건, anon 전체 권한 차단, service_role SELECT/INSERT 허용 |
| Production 배포 및 무인증 접근 | PASS | 배포 `dpl_6DzUHT1ZBttmC7B7JSuTpohwpjZY`; 관리자 307, 로그인 200, 내부 경로 404, 쓰기 API 401 |

## 관리자 인증 원칙

1. Proxy는 비로그인 요청을 빠르게 차단하지만 최종 권한 경계가 아니다.
2. 관리자 Server Component는 데이터를 조회하기 전에 `requireAdminPage()`를 통과해야 한다.
3. 관리자 쓰기 Route Handler는 요청마다 `isAdminRequest()`를 다시 검사한다.
4. 새 개인정보·관리자 페이지는 반드시 보호된 `app/admin` 레이아웃 아래에 둔다.

## Production 완료 체크리스트

- [x] Next.js 16.3.0 고정 및 lockfile 갱신
- [x] 관리자 Server Component 공통 인증 추가
- [x] `npm run build`
- [x] `npm audit --omit=dev` 취약점 0건
- [x] 로컬 무인증 관리자 접근 307 및 쓰기 API 401 확인
- [x] 로그인·문의 API 애플리케이션 rate limit 및 본문 제한
- [x] 허용목록 기반 HTML sanitizer 적용
- [x] 로그아웃 및 브라우저 인증 쿠키 만료
- [x] 로그인 복귀 경로 open redirect 차단
- [x] sanitizer·관리자 경로 자동 보안 테스트
- [x] Vercel Production의 `ADMIN_USERNAME` 정책 확인(4자 이상)
- [x] Vercel Production의 `ADMIN_PASSWORD` 교체 및 정책 확인(14자 이상)
- [x] Vercel Production의 `ADMIN_AUTH_SECRET` 교체 및 정책 확인(32자 이상, 비밀번호와 다른 값)
- [x] Production과 동일한 관리자 설정을 대상으로 `npm run security:env` PASS
- [x] Supabase SQL Editor에서 `supabase/security-verification.sql` 실행 및 결과 보관
- [x] 관리자 로그인·문의·기사 CRUD 회귀 테스트
- [x] Production 배포
- [x] 비로그인 관리자 페이지 접근 307 확인
- [x] 비로그인 관리자 쓰기 API 접근 401 확인

## 2026-08-17 추가 하드닝 및 회귀검증

기준 커밋: `b4607a2` (이전 `a7185cb`)

### 적용 사항

- `moneypick_articles` 관리자 쓰기 경로(`createMoneypickArticle`/`updateMoneypickArticle`/`deleteMoneypickArticle`/`getAllMoneypickArticles`)를 anon client에서 server-only service-role client(`serverClient()`)로 전환. `security-hardening.sql`의 anon SELECT-published-only RLS 정책과 정합.
- 컬럼 fallback 로직을 중첩 재시도에서 유한 루프(`OPTIONAL_ARTICLE_COLUMNS.length` 상한)로 정리. 스키마 오류(`42703`/`PGRST204` + 알려진 컬럼명 매칭)만 fallback 대상으로 하고 그 외 오류(RLS/인증/중복 등)는 즉시 실제 오류로 반환.
- `mcp/scheduled-generator.mjs`에 Anthropic API 크레딧 부족 감지(`isCreditBalanceError`) 추가. 감지 시 `main()`을 즉시 종료(`return`)하여 이후 주제 생성을 중단하고 `process.exitCode = 1` 설정. 일부 기사 생성 실패가 있어도 `process.exitCode = 1`을 설정해 자동화 결과가 성공으로 위장되지 않도록 함.

### 코드 검증 결과

| 항목 | 결과 |
| --- | --- |
| service role은 server-only (`'use client'` 없음) | PASS |
| Client Component의 service role 런타임 import 없음(타입만 import) | PASS |
| Browser bundle에 service role 노출 없음, `NEXT_PUBLIC_*` 미사용 | PASS |
| 관리자 API는 service role 실행 전 인증(`isAdminRequest`/API 키) | PASS |
| 공개 API에 service role 쓰기 경로 노출 없음 | PASS |
| 컬럼 fallback: 정상 스키마 1회 성공 | PASS |
| 컬럼 fallback: 무한 반복 없음(유한 루프) | PASS |
| 컬럼 fallback: RLS/인증 오류를 스키마 오류로 오인하지 않음 | PASS |
| credit 부족 감지 정확도(9개 케이스: 실제 메시지 매치, 일시적 오류 비매치) | PASS (9/9) |
| credit 부족 시 즉시 중단 및 exit code 1 | PASS |

### 정적 검증

| 항목 | 결과 |
| --- | --- |
| `npx tsc --noEmit` | PASS (오류 0건) |
| `npm run lint` | PASS (오류 0건, 기존 경고 26건 외 신규 없음) |
| `npm run build` | PASS |
| `npm run security:env` | PASS |

### Git / 배포

| 항목 | 결과 |
| --- | --- |
| 커밋 | `b4607a2` "fix: harden admin writes and generator failure handling" |
| `origin/master` push | PASS, local/remote hash 일치 |
| Production 배포(Vercel) | READY, `https://www.moneypick.co.kr` 200 확인 |

### 관리자 로그인 회귀 (Production)

| 항목 | 결과 |
| --- | --- |
| 비로그인 `/mp-hub-8r6q2` 접근 | 307 → 로그인 페이지 |
| 비로그인 쓰기 API(`POST /api/articles`) | 401 |
| 잘못된 로그인 | 401 |
| 정상 로그인 | 200, `admin_auth` 세션 쿠키 발급 |
| 로그인 세션으로 관리자 페이지 접근 | 200 |
| 관리자 문의 목록 캐시 헤더 | `private, no-cache, no-store, max-age=0, must-revalidate` 확인 |
| 로그아웃 | 200, 쿠키 제거 확인 |

### 문의(Contact) E2E (Production)

| 항목 | 결과 |
| --- | --- |
| 비개인 테스트 문의 1건 `POST /api/contact` | 201, ID 반환 |
| 관리자 문의 화면에서 동일 문의 확인(ID/이메일 매칭) | PASS |
| 비로그인 관리자 문의 접근 | 307 차단 |
| 잘못된 문의 요청 | 400 |

### Article CRUD E2E (Production)

| 테스트 | 결과 |
| --- | --- |
| CREATE (draft) | PASS — `serverClient()` 경유 저장 성공, RLS 오류 없음 |
| READ (관리자 목록 노출) | PASS |
| READ (공개 draft 비노출) | PASS — `/articles/{slug}` 404 (RLS로 anon에 미노출, 앱 레벨 status 필터 없이도 차단 확인) |
| UPDATE (제목 수정) | PASS — 중복 레코드 없음 확인 |
| PUBLISH | PASS — published 전환 후 공개 URL 307→200 정상 노출 |
| DELETE | PASS — 관리자 목록 및 공개 경로 모두 404, 잔여 데이터 없음 |

테스트 아티클(`[TEST] MoneyPick Admin CRUD Verification`)은 검증 완료 후 즉시 삭제하여 Production에 잔존하지 않음. 문의 테스트 레코드(`qa-test-noreply@example.com`)는 비개인 데이터이며 삭제 API가 없어 기존 2026-08-12 검증 시와 동일하게 보존됨.

### 잔여 사항

애플리케이션 rate limit은 서버리스 인스턴스별 메모리 기반으로, 완전한 분산 rate limit이 아니다. `SECURITY-P1`로 후속 등록: Vercel WAF/Firewall 또는 Upstash Redis 등 공유 저장소 기반 분산 rate limit 검토. 이번 Sprint 종료를 막는 P0로 취급하지 않는다.

## 다음 24시간 권고 순서

애플리케이션 수준 rate limit은 서버리스 인스턴스별 메모리를 사용하므로 Vercel WAF 또는 공유 저장소 기반 분산 rate limit을 추가해야 한다. 로그아웃은 브라우저 쿠키를 즉시 만료하지만 이미 탈취된 stateless 토큰의 서버 강제 폐기는 지원하지 않으므로, 필요하면 공유 세션 저장소 기반으로 전환한다.

남은 순서는 Vercel 분산 rate limit → Production 환경변수 교체·검증 → Supabase RLS 증빙 → 전체 Production 회귀검증이다.

## Contact inquiry 운영 정상화

- Migration: `supabase/migrations/20260812_create_contact_inquiries.sql`
- Schema: `id`, `type`, `sender_email`, `sender_name`, `title`, `message`, `status`, `referer`, `user_agent`, `created_at`
- 저장 경로: 브라우저 → `POST /api/contact` → 서버 검증 → service_role → `contact_inquiries`
- Storage fallback: 제거. DB 저장 실패 시 API도 실패를 반환하여 이중 저장과 허위 성공을 방지
- RLS: 활성화
- anon 권한: SELECT/INSERT/UPDATE/DELETE 모두 차단(Production REST 요청 각각 401)
- service_role 권한: SELECT/INSERT 허용, 브라우저 번들·로그·Git 노출 없음
- E2E: 비개인 테스트 문의 1건 API 201 및 ID 반환, DB 저장 1건, 인증된 관리자 화면 표시 확인
- 관리자 캐시: `private, no-cache, no-store, max-age=0, must-revalidate` 확인
- Production deployment: `2bUnR7m9wVZSQMQPmovRCdBy5MA8`
- 재배포 회귀: 비로그인 관리자 307, 로그인 200, 관리자 목록 200, 잘못된 문의 400
- service_role: 클라이언트 빌드 값 노출 없음 확인
