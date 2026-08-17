# MoneyPick Article System V2 — 현황조사 및 설계 기준선

작성일: 2026-08-17
Git 기준: `master` / `43ec944`
작업 유형: 현황조사 / 아키텍처 설계 (구현 없음)

이 문서는 Article System V2 작업지시서(2026-08-17)의 최종 산출물이다. 이번 단계에서는 코드를
수정하지 않았다. 실제 저장소 코드를 읽고 확인한 사실만 기록했으며, 추정이 필요한 부분은 "추정"으로
명시했다.

## 문서 구성

이 문서(`ARTICLE_SYSTEM_V2.md`)는 현황·Gap·아키텍처·로드맵을 담는 마스터 문서다. 세부 설계는
아래 4개 문서로 분리했다. 원 작업지시서 §26이 제안한 7개 파일 구조 대신, 서로 강하게 결합된
섹션을 묶어 5개로 통합했다(사유는 §9 참고).

| 문서 | 내용 |
| --- | --- |
| `ARTICLE_SYSTEM_V2.md` (본 문서) | 현황조사, Gap Analysis, 아키텍처, 로드맵, 완료조건 답변 |
| [`CONTENT_TYPES_AND_PATTERNS.md`](./CONTENT_TYPES_AND_PATTERNS.md) | Content Type, Article Pattern, Pattern Variant |
| [`BLOCK_SYSTEM.md`](./BLOCK_SYSTEM.md) | Block, Block Variant |
| [`DISPLAY_AND_THUMBNAIL.md`](./DISPLAY_AND_THUMBNAIL.md) | 메인/카테고리/카드, 썸네일, Rotation Engine |
| [`ARTICLE_SCHEMA.md`](./ARTICLE_SCHEMA.md) | Article Schema 초안, Legacy 호환, Article Agent V2 역할 |

---

## 1. 현재 시스템 현황

### 1.1 기사 생성 경로 (실제 코드 기준, 5개)

코드를 추적한 결과 기사는 서로 다른 규칙을 가진 **5개의 경로**로 만들어진다. 그중 2개는 저장
API 자체가 다르다(`/api/articles` vs `/api/admin/articles/draft`).

| # | 경로 | 진입점 | 입력 | Prompt/분류 | DB 저장 API | article_type/pattern_id | 계산기 사례 | 공식출처 | 썸네일 |
| - | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 관리자 수동 작성 | [ArticleEditorForm.tsx](../../components/admin/ArticleEditorForm.tsx) | 사람이 HTML 직접 입력 | 없음(자유 작성) | `POST/PATCH /api/articles` (세션 쿠키 인증) | 미설정 | 없음 | 없음 | 없음(수동 업로드만) |
| 2 | `ARTICLE_PROMPT.md` 복붙 워크플로 | 루트 [ARTICLE_PROMPT.md](../../ARTICLE_PROMPT.md) 안내 → 사람이 결과를 경로 1에 붙여넣음 | 사람이 Claude.ai 등에 복붙 | 자체 프롬프트(시스템 프롬프트와 다른 HTML 클래스 규칙) | 경로 1과 동일 | 미설정 | 없음 | 없음 | 없음 |
| 3 | Claude Desktop MCP (`saveDraft`) | [mcp/moneypick-draft-agent.mjs](../../mcp/moneypick-draft-agent.mjs) | 사람이 Claude Desktop 대화로 작성 | 없음(도구는 저장만 담당) | `POST /api/admin/articles/draft` (API 키 인증) | 미설정(agent가 채우지 않음) | 없음 | 없음 | 없음(fallback도 안 탐, 아래 §1.7 참고) |
| 4 | 자동 배치 생성 | [mcp/scheduled-generator.mjs](../../mcp/scheduled-generator.mjs) | `topics.json` 예정 주제 | [mcp/system-prompt.md](../../mcp/system-prompt.md) + pattern-selector 지시 | `POST /api/admin/articles/draft` (API 키 인증) | 코드가 계산해 채움 | 4개 계산기 한정 자동 주입 | 10개 기관 레지스트리 매칭 | archetype 기반 24종 SVG |
| 5 | draft API 자체 fallback | [app/api/admin/articles/draft/route.ts](../../app/api/admin/articles/draft/route.ts) | 경로 3·4가 넘긴 payload | — | (경로 3·4에 종속) | payload에 있으면 통과, 없으면 null | — | — | thumbnailUrl 없으면 `lib/article-thumbnail.ts`로 category 전용 1종 생성 |

**즉 "지금 몇 종류의 기사 생성 규칙이 있는가?"에 대한 답은 5개**이며, 그중 완결된 자동 파이프라인은
경로 4 하나뿐이다. 경로 1·2·3은 article_type/pattern_id/계산기 사례/공식출처/구조화된 요약 중
아무것도 채우지 않는다.

### 1.2 Article Data Model

DB(`moneypick_articles`, [supabase/moneypick_articles.sql](../../supabase/moneypick_articles.sql))
실제 컬럼:

```
id, slug, category_key, category_label, title, seo_title, lead, meta_description,
body_html, summary(text[]), faq(jsonb), tags(text[]), editor, reading_time,
hero_value, hero_label, related_calculators(jsonb), disclaimer, thumbnail_url,
status(draft|published), source, views, created_at, updated_at,
article_type, pattern_id, recommended_slugs(text[])
```

**본문은 HTML 문자열이다.** `body_html: text` 컬럼에 완성된 HTML을 그대로 저장하고,
[MoneyPickArticle.tsx](../../components/moneypick/MoneyPickArticle.tsx)는
`dangerouslySetInnerHTML`(+ [`sanitizePostHtml`](../../lib/sanitize.ts) 허용목록 정제)로
그대로 출력한다. Block/JSON 구조는 아니다.

**`summary`(text[])와 `faq`(jsonb)는 사실상 죽은 컬럼이다.** 확인된 증거:

- 관리자 수동 폼: `summary: [], faq: [],` 하드코딩 ([ArticleEditorForm.tsx:201-202](../../components/admin/ArticleEditorForm.tsx#L201-L202))
- 자동생성 draft API: `summary: [], faq: [],` 하드코딩 ([app/api/admin/articles/draft/route.ts:189-190](../../app/api/admin/articles/draft/route.ts#L189-L190))
- 즉 두 저장 경로 모두 이 컬럼을 항상 빈 값으로 저장한다. 렌더러의 "핵심 요약" React 섹션과
  FAQ 아코디언은 각각 `summary`/`faq`가 채워져 있을 때만 동작하도록 짜여 있는데, 실제로는 항상
  비어 있으므로 **한 번도 실행되지 않는 코드 경로**다. 실제 요약·FAQ는 `body_html` 안에
  AI/사람이 직접 심은 `<ul class="mp-summary">`, `<div class="mp-faq">` HTML이 전부다.
- 이름 충돌도 있다: draft API의 요청 필드 `summary`(string 1개)는 DB `lead` 컬럼에
  매핑되고([route.ts:165](../../app/api/admin/articles/draft/route.ts#L165)), DB의
  `summary`(string 배열) 컬럼과는 이름만 같고 관계가 없다.

### 1.3 Renderer

[MoneyPickArticle.tsx](../../components/moneypick/MoneyPickArticle.tsx)는 실제로 **하이브리드**다.

```
bodyHtml 있음  → dangerouslySetInnerHTML (sanitize-html 허용목록 통과) — 실사용 경로
bodyHtml 없음  → blocks 배열을 <Block/> 컴포넌트로 렌더 — src/data 정적 시드 글 전용, 사실상 legacy
```

`ArticleBlock` 유니온 타입([components/moneypick/types.ts](../../components/moneypick/types.ts))은
`heading | paragraph | checklist | point | warning | example | calculator | faq` 8종으로
이미 구조화 Block 스키마의 원형이 존재한다. 다만 DB 기반 콘텐츠는 이 경로를 타지 않는다
(`rowToArticleProps`가 `faq`만 예외적으로 `blocks`에 합성해 넣지만, `faq` 컬럼이 항상 비어
있으므로 이마저 실행되지 않는다).

추가로 확인한 렌더러 결함(AI 기획과 렌더링 결과 불일치의 구체 사례):

- 시스템 프롬프트는 `relatedCalculators`를 **최소 3개** 요구하지만, 렌더러는
  `relatedCalculators.slice(0, 1)`로 **1개만 표시**한다
  ([MoneyPickArticle.tsx:219](../../components/moneypick/MoneyPickArticle.tsx#L219)).
- 카테고리 색상 테마가 최소 3곳에 각각 하드코딩되어 있다: `MoneyPickArticle.tsx`의
  `CATEGORY_THEME`, `lib/article-thumbnail.ts`의 `CATEGORY_STYLES`,
  `mcp/thumbnail-generator.mjs`의 자체 카테고리 색 테이블. DB `moneypick_categories.color`
  컬럼과도 별개로 관리된다.

### 1.4 자동 콘텐츠 Pipeline (경로 4, 가장 완성도 높은 경로)

```
topics.json (예정 주제, 250개, id/category/title/planTags/status/archetype만 존재)
    ↓
scheduled-generator.mjs: pickTargets() — archetype 있고 status='예정'인 것을 배열 순서대로 slice
    ↓
[보조 데이터] pattern-selector.mjs(articleType/pattern) · engine.mjs(계산 사례, 4개 계산기 한정)
              · official-registry.mjs(공식기관 매칭) · link-cache.mjs(추천 slug)
    ↓
Claude API (system-prompt.md + 위 보조데이터 프롬프트 블록들)
    ↓
validate() — mp-summary/mp-faq 정규식 존재 검사, metaDescription 120~180자, calculators≥3
    ↓
공식출처 HTML append → thumbnail-generator.mjs(archetype 기반 24종 SVG)
    ↓
POST /api/admin/articles/draft (source: claude_scheduled)
    ↓
link-cache.json / schedule-state.json 갱신 → 관리자 수동 발행
```

문서화 상태: [docs/AUTO_CONTENT_PIPELINE.md](../AUTO_CONTENT_PIPELINE.md)가 이 흐름을 정확히
기술하고 있다(최신, 신뢰 가능).

운영 데이터로 확인한 사실: `mcp/schedule-state.json`에는 `generated`(145건) 키만 있고
`history` 키가 없다. `pickPattern`/`pickTitleStyle`의 "최근 5개 반복 회피" 로직은
`state.history`가 비어 있으면 사실상 회전 효과가 없다 — 현재 파일 상태로는 회전 로직이
실질적으로 작동하지 않는 것으로 보인다(추정: history 필드가 최근에 추가되었고 아직 스크립트가
재실행되지 않음).

### 1.5 기존 Article Type 분류 — 두 체계가 병렬로 존재

이번 조사에서 가장 중요한 발견이다. **서로 다른 두 개의 분류 체계가 같은 기사 생성 호출 안에서
동시에 사용된다.**

| 체계 | 값 개수 | 정의 위치 | 무엇을 결정하나 | Claude가 아는가 |
| --- | --- | --- | --- | --- |
| `archetype` (구) | 8종: 개념정리형/비교형/하우투·절차형/완벽가이드형/꿀팁·리스트형/함정주의형/트렌드·정책형/케이스·대상별형 | `topics.json` 각 주제에 수동 배정 | system-prompt.md의 "글유형별 구조 스켈레톤" + 썸네일 24종 SVG 선택 | 예 — 프롬프트에 명시 전달 |
| `articleType` (신) | 6종: GUIDE/COMPARISON/CASE_STUDY/CHECKLIST/CALCULATOR_FOCUSED/POLICY_CHANGE | `pattern-selector.mjs`가 제목·태그 키워드로 **코드가 자동 판정** | `article-patterns.json`의 패턴별 섹션 순서/필수요소 → 추가 프롬프트 블록으로 주입, DB `article_type`/`pattern_id` 컬럼에 저장 | 간접적 — 프롬프트 지시문으로만 전달, Claude는 이 이름 자체를 모름 |

두 체계는 서로를 참조하지 않는다(`archetype`은 `articleType` 판정에서 4순위 보조 신호로만
쓰인다). 즉 한 편의 글이 "완벽가이드형"(archetype) 스켈레톤 지시와 "COMPARISON_02"(articleType
pattern) 섹션 순서 지시를 동시에 받을 수 있고, 둘이 상충해도 검증하는 코드가 없다. 게다가
archetype 기반 구조 스켈레톤은 `system-prompt.md`와 `scheduled-generator.mjs`의 `SKELETON`
상수에 **동일 내용이 두 번** 하드코딩되어 있다 — 단일 진실 공급원 원칙(원칙 B) 위반의 가장
명확한 사례.

상태 표기:

| 개념 | 상태 | 근거 |
| --- | --- | --- |
| archetype 8종 | ✅ 실제 구현 (구) | topics.json 전체에 배정됨, system-prompt.md가 사용 |
| articleType 6종 + pattern 12종 | ✅ 실제 구현 (신) | pattern-selector.mjs + article-patterns.json, DB 컬럼까지 연결됨 |
| 두 체계의 통합 | 🔴 미구현 | 서로 다른 값 집합, 조율 코드 없음 |

### 1.6 계산기 연동

[lib/calculators/engine.mjs](../../lib/calculators/engine.mjs)에 계산기별 `fields`/`note`가
정의되어 있고(총 계산기 수는 [ARTICLE_CALCULATOR_OPTIONS](../../lib/article-calculators.ts)
기준 16개), `generateSampleScenarios()`/`formatResultValue()`로 실제 계산된 시나리오를
만든다. 그러나 자동 파이프라인에서 이 사례 자동 주입이 적용되는 계산기는
`CALCULATOR_KEYWORDS`에 등록된 **4개뿐**(`dsr`, `acquisition-tax`, `jeonse-loan`,
`mortgage`) — [scheduled-generator.mjs:190-195](../../mcp/scheduled-generator.mjs#L190-L195).
나머지 12개 계산기는 관련 글이 생성돼도 실제 계산 사례가 자동 주입되지 않는다. 설계 원칙대로
"AI가 숫자를 지어내지 않고 Calculator Engine이 검증된 값을 준다"는 방향은 옳게 잡혀 있지만
적용 범위가 좁다.

렌더링 CTA는 `relatedCalculators.slice(0, 1)`만 노출(§1.3 참고) — AI가 3개 이상 추천해도
독자는 1개만 본다.

### 1.7 공식 출처 연동

[mcp/official-registry.mjs](../../mcp/official-registry.mjs)에 10개 공식기관 레지스트리와
키워드 매칭(+3점/키워드, +1 카테고리 보너스, 최대 3개)이 구현되어 있다. 매칭 결과는
(a) 프롬프트에 "귀속 지침"으로 주입되고 (b) `buildSourcesHtml()`로 `<div
class="mp-official-sources">` HTML을 생성해 `body_html` 끝에 직접 append한다. 별도 DB
컬럼이나 구조화 필드는 없다 — 이미 "일반 HTML이 아니라 독립 Block 후보로 본다"는 V2 원칙과
맞닿아 있지만, 현재는 문자열 append로 구현되어 있어 렌더러가 이를 인식하지 못한다(스타일만
`globals.css`가 처리).

### 1.8 관리자 폼

[ArticleEditorForm.tsx](../../components/admin/ArticleEditorForm.tsx)는 카테고리/제목/슬러그/
메타설명/히어로/읽는시간/작성자/대표이미지/관련계산기(체크박스)/본문 HTML(textarea)/태그/
면책조항을 입력받는다. **Content Type, Pattern, Variant, Block 구성 개념이 전혀 없다.**
본문 HTML 작성 가이드 텍스트가 `<div class="mp-summary">`(구 ARTICLE_PROMPT.md 형식)를
안내하는데, 자동 파이프라인의 `validate()`는 `<ul class="mp-summary">`만 통과시킨다 — 사람이
안내를 따라도 자동 파이프라인 기준으로는 형식 불일치가 발생한다(수동 경로는 validate()를 타지
않아 즉시 오류는 안 나지만, 렌더링 일관성이 깨진다).

### 1.9 썸네일 시스템 — 진입 경로별로 다른 결과

| 경로 | 사용 로직 | 스타일 결정 기준 |
| --- | --- | --- |
| 자동 배치 생성(경로 4) | `mcp/thumbnail-generator.mjs` | archetype별 3종 × 8종 = 24개 SVG 템플릿 |
| MCP Claude Desktop(경로 3) | 없음 → draft API가 `lib/article-thumbnail.ts` fallback 시도 | category 1종 템플릿(제목 텍스트 배치만 다름) |
| 관리자 수동(경로 1) | 없음 | 관리자가 직접 업로드하지 않으면 썸네일 없음 |

같은 사이트의 글이라도 어떤 경로로 만들어졌느냐에 따라 썸네일 시각 언어가 완전히 달라진다.

### 1.10 노출(Display) 시스템

홈([app/page.tsx](../../app/page.tsx)): `Hero → CategoryCards → PostsSection →
CalculatorCards → RecommendedPosts → BottomSection`. 카드 컴포넌트는
[PostCard.tsx](../../components/PostCard.tsx) **단 1종**이며, 이마저 DB 기반
`moneypick_articles`가 아니라 정적 시드 데이터(`src/types.Post`, `src/data/categories`)에
바인딩되어 있다. `RecommendedPosts.tsx`도 같은 `PostCard`를 재사용한다. 즉 "카드 컴포넌트가
1종류뿐이다"는 사용자 문제 인식이 코드로 정확히 확인된다.

---

## 2. 발견된 문제

### HIGH

1. **두 개의 병렬 Article Type 분류 체계(archetype 8종 vs articleType 6종)가 조율 없이 동시
   사용됨.** 구조 지시가 상충할 수 있고, 스켈레톤 정의가 2곳(system-prompt.md,
   scheduled-generator.mjs)에 중복됨. (§1.5)
2. **`summary`/`faq` DB 컬럼이 두 저장 경로 모두에서 항상 빈 값 — 죽은 스키마.** 렌더러의
   구조화 요약/FAQ 렌더 경로가 한 번도 실행되지 않는다. 스키마와 실제 동작이 어긋나 있어
   새로 합류하는 개발자·AI 세션이 스키마만 보고 잘못된 가정을 하기 쉽다. (§1.2)
3. **5개 생성 경로 중 4개(수동/ARTICLE_PROMPT.md/Claude Desktop MCP/draft fallback)가
   article_type·계산기 사례·공식출처·구조화 요약 중 아무것도 채우지 않음.** 자동 배치
   생성(경로 4)만 "완성형" 파이프라인이고 나머지는 사실상 순수 HTML 붙여넣기다. (§1.1)

### MEDIUM

4. **mp-summary HTML 형식이 문서마다 다름.** `ARTICLE_PROMPT.md`/관리자 폼 안내는
   `<div class="mp-summary"><ul>...`, `system-prompt.md`(실제 자동 파이프라인이 사용)는
   `<ul class="mp-summary">`. 자동 파이프라인의 `validate()`는 후자만 통과시킨다. (§1.5, §1.8)
5. **카테고리 색상 테마가 최소 3곳에 중복 하드코딩**(`MoneyPickArticle.tsx`,
   `lib/article-thumbnail.ts`, `mcp/thumbnail-generator.mjs`) — DB `moneypick_categories.color`
   와도 무관. (§1.3)
6. **렌더러가 AI 기획을 배신하는 구체 사례**: `relatedCalculators` 최소 3개 요구 → 렌더러는
   1개만 표시. (§1.3, §1.6)
7. **계산기 사례 자동 주입이 16개 중 4개 계산기에만 적용.** (§1.6)
8. **썸네일 시각 언어가 생성 경로 3가지에 따라 완전히 다름**(24종 archetype 기반 / category
   1종 / 없음). (§1.9)
9. **홈/추천 영역 카드 컴포넌트가 1종뿐이며 DB 기반 콘텐츠가 아니라 정적 시드 데이터에
   바인딩됨.** (§1.10)
10. **`topic-selection-policy.md`가 제안한 `moneyAction`/`priorityScore` 등 필드가
    `topics.json` 실제 데이터에는 전혀 없음** — 설계 문서만 존재, 미구현. (§3 참고)
11. **`schedule-state.json`에 `history` 키가 없어 패턴/제목 로테이션이 사실상 비활성 상태로
    보임.** (§1.4)

### LOW

12. draft API 요청 필드명 `summary`(string)와 DB 컬럼명 `summary`(string[])가 동명이의로
    혼동 소지. (§1.2)
13. `ARTICLE_PROMPT.md`가 존재하지 않는 관리자 경로(`/mp-console/articles/new`)를 안내함 —
    실제 경로는 `/mp-hub-8r6q2`. 보안 하드닝(2026-08-12) 이후 갱신되지 않은 것으로 보임.

---

## 3. 기존 Article System V2 구현 여부

| 기능 | 상태 | 위치 |
| --- | --- | --- |
| Content Type | 🟡 부분 구현 (2개 체계 병존, 미통합) | `topics.json.archetype`(8종), `pattern-selector.mjs`(6종) |
| Search Intent | 🔵 문서 설계만 존재 | `docs/topic-selection-policy.md`의 `moneyAction`(받기/아끼기/피하기/결정하기) — topics.json에 필드 자체가 없음 |
| Pattern | ✅ 실제 구현 | `mcp/article-patterns.json`(6타입 × 2패턴 = 12종), `pattern-selector.mjs` |
| Pattern Variant | 🟡 부분 구현 | 현재 패턴이 "고정 섹션 순서" 1개뿐이라 Variant 개념은 없음. 로테이션은 패턴 단위 |
| Block | 🟡 부분 구현(legacy) | `components/moneypick/types.ts`의 `ArticleBlock`(8종) — DB 기반 콘텐츠는 미사용, 정적 시드 글 전용 |
| Thumbnail Variant | ✅ 실제 구현(비통합) | `mcp/thumbnail-generator.mjs` 24종, 단 archetype 기반이라 신규 6종 분류와 미연결 |
| Rotation | 🟡 부분 구현(불안정) | `pickPattern`/`pickTitleStyle`의 최근-5개 회피 로직, 단 `schedule-state.json.history` 부재로 사실상 미작동 추정 |
| Article Schema(구조화) | 🔴 미구현 | `body_html`은 순수 HTML 문자열. `summary`/`faq` 구조화 컬럼은 존재하나 미사용 |

---

## 4. Gap Analysis

| 영역 | 현재 | V2 목표 | 격차 |
| --- | --- | --- | --- |
| 분류 체계 | archetype 8종 + articleType 6종 병렬, 미통합 | Content Type 단일 체계 | 두 체계 통합·매핑 필요 |
| 구조 규칙 정의 위치 | system-prompt.md + scheduled-generator.mjs(SKELETON) + article-patterns.json, 3곳 | Pattern/Block Registry 1곳 | 중복 제거, 단일 참조로 전환 |
| 콘텐츠 저장 형식 | HTML 문자열(body_html) | 구조화 Schema(type/pattern/variant/blocks) → 렌더러가 조립 | 신규 필드 추가(마이그레이션 없이 병행 가능, §ARTICLE_SCHEMA.md) |
| 생성 경로 일관성 | 5개 경로, 완성도 편차 큼(1개만 완전) | 모든 경로가 동일 Schema로 수렴 | 경로 1·2·3을 Schema 기반으로 통합하거나 legacy로 명시 분리 |
| Block 다양성 | 8종 legacy Block, DB 콘텐츠 미사용 | 20종 내외 Block × Block당 2~5 Variant | Block Registry 신설, 기존 8종 재사용 |
| 계산기 연동 | 16개 중 4개만 자동 사례 주입, CTA 1개만 노출 | 전 계산기 지원, CTA는 추천 개수만큼 노출 | 키워드 매핑 확장, 렌더러 CTA 로직 수정(별도 태스크) |
| 썸네일 | 경로별 3가지 다른 로직/스타일 | Pattern/moneyAction 기반 단일 Rotation 로직 | 3개 로직 통합 |
| 카드/노출 | PostCard 1종, 정적 데이터 바인딩 | Card Variant 다수, DB 콘텐츠 기반 | Display System 신설(§DISPLAY_AND_THUMBNAIL.md) |
| 주제 우선순위 | 배열 순서 그대로 소비 | 100점 스코어 기반 선정 | `topic-selection-policy.md` 구현 필요(별도 트랙, 이번 범위 아님이지만 로드맵에 포함) |

---

## 5. 최종 V2 권장 구조

```
                    MoneyPick Article System V2

                         Topic (topics.json + moneyAction)
                              │
                        Search Intent
                              │
                     ┌── Content Type ──┐   (기존 archetype 8종 + articleType 6종을
                     │   통합한 단일 체계)   §CONTENT_TYPES_AND_PATTERNS.md 참고
                     └────────┬─────────┘
                              │
                       Article Pattern  (기존 article-patterns.json 확장)
                              │
                      Pattern Variant   (신규)
                              │
                     Block Composition  (기존 ArticleBlock 8종 확장 → 20종 내외)
                              │
                Structured Article Schema  (신규 JSON, DB엔 병행 컬럼으로 저장)
                              │
                      Schema Validator   (기존 validate() 확장)
                              │
                 React Article Renderer V2  (기존 MoneyPickArticle.tsx 확장,
                                              legacy HTML 경로는 유지)
                              │
                        MoneyPick Article

           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
        Detail              Main              Category
           │                  │                  │
    Layout Variant     Section 구성        Card Variant
   (§DISPLAY_AND_THUMBNAIL.md)
```

핵심은 기존에 이미 존재하는 조각(archetype, articleType, article-patterns.json, ArticleBlock
타입, official-registry, calculator engine)을 버리지 않고 **하나의 파이프라인으로 수렴**시키는
것이다. 완전히 새로 만드는 것은 Pattern Variant, Block Variant, 통합 Content Type, 구조화
Article Schema뿐이다.

---

## 6. 기존 문서와의 관계 (원 작업지시서 §27)

| 문서 | 판정 | 사유 |
| --- | --- | --- |
| `ARTICLE_PROMPT.md`(루트) | **Deprecated 후보** | 존재하지 않는 관리자 경로 안내, 자동 파이프라인 validate()와 어긋나는 mp-summary 형식. 삭제는 이번 범위 아님 — V2 적용 시 이 문서의 "복붙 워크플로"는 폐기하고 V2 스키마 기반 관리자 폼으로 대체 권장 |
| `mcp/system-prompt.md` | **개편** | 자동 생성의 SSOT지만 archetype 스켈레톤이 scheduled-generator.mjs와 중복. V2에서는 Pattern/Block Registry를 참조하는 방식으로 재작성 |
| `docs/AUTO_CONTENT_PIPELINE.md` | **유지** | 정확하고 최신. 운영 문서로 계속 사용, V2 반영 시 갱신만 필요 |
| `docs/topic-selection-policy.md` | **유지(설계 상태)** | 유효한 제안이나 미구현. `moneyAction`을 V2의 Search Intent 신호로 채택 권장 |
| `mcp/README.md` | **유지** | 정확한 운영 문서. saveDraft 스키마에 V2 필드 추가 시 갱신 |
| `mcp/article-patterns.json` | **유지, 확장** | 이미 V2의 Pattern Registry 원형. 삭제·교체하지 말고 Variant 레이어만 추가 |

이번 작업에서 어떤 문서도 삭제하지 않았다.

---

## 7. 구현 Roadmap

| Phase | 범위 | 수정 예상 영역 | 난이도 | 선행조건 | 우선순위 |
| --- | --- | --- | --- | --- | --- |
| 0 | 즉시 고칠 수 있는 불일치 수정(§8 완료조건 답변에도 명시): mp-summary 형식 통일, CTA 1개→N개 표시, ARTICLE_PROMPT.md deprecated 표시 | `MoneyPickArticle.tsx`, `ArticleEditorForm.tsx` 안내 텍스트, `ARTICLE_PROMPT.md` | 작음 | 없음 | P1 |
| 1 | Schema/Registry: 통합 Content Type 매핑표 확정, Block Registry 정의(§BLOCK_SYSTEM.md 확정판), Article Schema 필드 DB에 추가(마이그레이션, 데이터 이관 없이 신규 컬럼만) | `lib/db.ts`, `supabase/moneypick_articles.sql` | 중간 | Phase 0 | P0 |
| 2 | Block Components: React Block 컴포넌트 5개(Vertical Slice 범위, §9 참고) 구현 | `components/moneypick/` 신규 | 중간 | Phase 1 | P0 |
| 3 | Renderer V2: Schema가 있으면 Block 조립 렌더, 없으면 기존 HTML 렌더(legacy) — 이중 경로 | `MoneyPickArticle.tsx` | 중간 | Phase 2 | P0 |
| 4 | Admin Form V2: Content Type/Pattern 선택 UI(AI 추천 + Override), 최소 침습적으로 기존 폼에 추가 | `ArticleEditorForm.tsx` | 중간 | Phase 3 | P1 |
| 5 | Article Agent V2: 기존 `scheduled-generator.mjs` 확장(§ARTICLE_SCHEMA.md의 Agent V2 역할 참고, 신규 Agent 생성 안 함) | `mcp/scheduled-generator.mjs`, `pattern-selector.mjs` | 큼 | Phase 1, 4 | P1 |
| 6 | Display System: Card Variant 3~4종, DB 콘텐츠 기반 홈 섹션 전환 | `components/PostCard.tsx` 등, 신규 | 큼 | Phase 3 | P2 |
| 7 | Performance Loop: articleType/pattern/variant 메타데이터를 Search Console/Analytics와 연결 | 신규(분석 인프라) | 매우 큼 | Phase 1~6 배포 후 데이터 축적 | P3 |

각 Phase가 크면 하나의 작업지시서로 묶지 않는다는 지시에 따라, Phase 1개당 별도 Sprint로 분리
진행을 권장한다.

---

## 8. 완료 조건 — 9개 질문에 대한 답변

1. **현재 MoneyPick에는 실제로 몇 종류의 Article 생성 경로가 있는가?**
   5개(관리자 수동, ARTICLE_PROMPT.md 복붙, Claude Desktop MCP, 자동 배치 생성, draft API
   fallback) — 저장 API 기준으로는 2개(`/api/articles`, `/api/admin/articles/draft`). §1.1

2. **기사 규칙이 몇 군데에 중복 정의되어 있는가?**
   최소 4곳: (a) archetype 구조 스켈레톤이 `system-prompt.md`와
   `scheduled-generator.mjs`(SKELETON 상수)에 중복, (b) mp-summary HTML 형식이
   `ARTICLE_PROMPT.md`/관리자 폼 안내 vs `system-prompt.md`에서 다르게 정의, (c) 카테고리
   색상 테마가 3곳에 하드코딩, (d) 썸네일 스타일 로직이 3곳에 분산. §1.3, §1.5, §1.9, §2

3. **현재 Article Type은 실제로 몇 개인가?**
   체계가 2개라 답도 2개다: archetype 8종(topics.json), articleType 6종(pattern-selector.mjs,
   DB 저장값). 통합된 단일 체계는 없다. §1.5

4. **기존 Article System V2 설계 중 무엇이 실제 구현돼 있는가?**
   Pattern(12종, article-patterns.json)과 legacy Block 타입(8종, ArticleBlock)은 구현되어
   있다. Search Intent(moneyAction)와 구조화 Article Schema는 문서 설계만 있고 미구현이다.
   §3

5. **기존 기사와 V2 기사를 어떻게 공존시킬 것인가?**
   기존 기사는 `body_html` 그대로 유지하고 legacy 렌더 경로를 보존한다. 신규 기사부터 Schema
   필드를 채우기 시작하고, 렌더러는 Schema 존재 여부로 분기한다(있으면 Block 조립, 없으면
   기존 HTML). 즉시 전체 마이그레이션은 하지 않는다. 상세: `ARTICLE_SCHEMA.md` §Legacy 호환.

6. **다양성을 Template 개수 증가 없이 어떻게 확보할 것인가?**
   Content Type × Pattern × Pattern Variant × Block Variant의 조합으로 확보한다. 이미
   article-patterns.json이 "Type × Pattern" 2단계까지 구현돼 있으므로, V2는 여기에
   Variant 2개 층만 추가하면 된다(완전히 새로 만드는 게 아니다). 상세:
   `CONTENT_TYPES_AND_PATTERNS.md`, `BLOCK_SYSTEM.md`.

7. **AI가 생성한 결과와 실제 Renderer 결과를 어떻게 일치시킬 것인가?**
   현재 가장 큰 불일치는 관측된 사실 기반이다(relatedCalculators 3→1, summary/faq 죽은
   컬럼). V2는 AI가 HTML을 직접 만들지 않고 Schema(type/pattern/variant/blocks)만 출력하게
   하고, 렌더러가 Schema를 그대로 조립하므로 구조적으로 드리프트가 발생할 수 없게 만든다.
   Phase 0의 즉시 수정 항목들이 현재 드리프트를 먼저 없앤다.

8. **Article Agent V2는 새로 만들 것인가, 기존 Pipeline을 발전시킬 것인가?**
   기존 `scheduled-generator.mjs`를 발전시킨다. 이미 pattern-selector/calculator engine/
   official registry/link cache 등 필요한 조각을 대부분 갖추고 있고 운영 이력(145건 생성)도
   있다. 새 Agent를 만들 이유가 없다. 상세: `ARTICLE_SCHEMA.md` §Article Agent V2.

9. **첫 번째 구현 Sprint는 무엇인가?**
   §9(다음 작업 추천) 참고.

---

## 9. 다음 작업 추천

**1개만 추천한다.**

**Phase 0 + Phase 1의 최소 Vertical Slice**: Content Type 통합 매핑표를 확정하고
(archetype 8종 ↔ articleType 6종을 문서 §CONTENT_TYPES_AND_PATTERNS.md 기준으로 매핑),
`moneypick_articles`에 Article Schema용 신규 컬럼 1개(`article_schema jsonb`, nullable)를
추가하는 마이그레이션만 작성한다. 기존 데이터는 건드리지 않는다(전부 NULL로 유지되며 legacy
렌더 경로로 계속 서비스됨). 여기에 Phase 0의 즉시 수정 3건(mp-summary 형식 통일, CTA 개수
표시 수정, ARTICLE_PROMPT.md deprecated 표기)을 함께 처리하면 리스크 없이 다음 Sprint(Block
Component 구현)로 넘어갈 기반이 만들어진다.

범위가 작고(스키마 추가 + 문서 수정 3건), 되돌리기 쉽고(신규 nullable 컬럼, 기존 렌더링
경로 무변경), 이후 모든 Phase가 이 매핑표와 컬럼 위에 쌓이므로 다음 Sprint로 적합하다.

이 작업 완료 후 새로운 작업을 시작하지 않고 결과를 먼저 보고한다.
