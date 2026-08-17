# Block System 설계

[← ARTICLE_SYSTEM_V2.md](./ARTICLE_SYSTEM_V2.md)

원 작업지시서 §16~17(Block, Block Variant)에 대한 설계. 출발점은 이미 존재하는
[`ArticleBlock`](../../components/moneypick/types.ts) 유니온 타입(8종)이다 — 새로 발명하지
않고 확장한다. 현재 이 타입은 DB 기반 콘텐츠에서 쓰이지 않는 legacy 경로지만(근거:
`ARTICLE_SYSTEM_V2.md` §1.3), 타입 정의 자체는 재사용 가능한 좋은 출발점이다.

## 1. 기존 8종 Block

```ts
heading | paragraph | checklist | point | warning | example | calculator | faq
```

렌더링 컴포넌트는 이미 [`MoneyPickArticle.tsx`](../../components/moneypick/MoneyPickArticle.tsx)의
`Block()` 함수에 구현돼 있다(스타일까지 완성). V2에서는 이 컴포넌트를 그대로 재사용하고
Props 타입만 아래 확장 스키마로 넓힌다.

## 2. 최종 Block 목록 (기존 8종 + 신규 12종 = 20종)

| Block | 상태 | 용도 |
| --- | --- | --- |
| `heading` | 기존 | 소제목 |
| `paragraph` | 기존 | 본문 단락 |
| `checklist` | 기존 | 체크 항목 목록 |
| `point` | 기존 | 한 문장 강조 |
| `warning` | 기존 | 주의 박스 |
| `example` | 기존 | 예시/사례 |
| `calculator` | 기존 | 계산기 CTA (§4에서 개수 제한 이슈 수정 포함) |
| `faq` | 기존 | FAQ 아코디언 |
| `summary` (신규) | 현재 body_html 안 raw HTML(`mp-summary`)로만 존재 → 정식 Block으로 승격 | 핵심 요약 |
| `table` (신규) | body_html 안 raw `<table>`로만 존재 → 정식 Block化 | 데이터/비교 표 |
| `comparison` (신규) | — | A/B 비교 카드 |
| `scenario` (신규) | 기존 `engine.mjs`의 `generateSampleScenarios()` 출력을 그대로 담는 그릇 | 계산 시나리오 |
| `eligibility` (신규) | — | 자격/대상 조건 |
| `steps` (신규) | — | STEP 절차 |
| `timeline` (신규) | — | 시행일·일정 |
| `prosCons` (신규) | — | 장단점 |
| `tip` (신규) | `point`와 유사하나 톤이 다름(팁 vs 강조) — 필요성 재검토 후 `point`로 흡수 가능 | 실천 팁 |
| `officialSources` (신규) | 현재 `buildSourcesHtml()`가 raw HTML append → 정식 Block化 | 공식 확인처 |
| `relatedArticles` (신규) | 현재 `recommendedContent` prop이 이미 담당 → Block으로 통합할지는 Phase 3에서 재검토 | 관련 글 |
| `updateInfo` (신규) | — | "이 글은 언제 갱신되었나" 표시 |

**우선순위**: 초기 구현(Phase 2, Vertical Slice)은 기존 8종 중 이미 렌더러가 갖춘 것을
그대로 쓰고, 신규 Block은 `summary`, `table`, `officialSources` 3종만 우선 구현한다 —
이 3개가 현재 raw HTML로 가장 많이 쓰이고 있어(§ARTICLE_SYSTEM_V2.md §1.2, §1.7) 정식
Block으로 승격했을 때 효과가 가장 크다.

## 3. Block Variant 예시

원 작업지시서 §17 예시를 기존 시스템 용어로 재작성한다.

```
summary (기존 mp-summary를 대체)
S1  한 문장 결론                — 지금 body_html에 흔히 쓰이는 형태와 가장 가까움
S2  3포인트 카드
S3  핵심 숫자 강조 (heroStat과 중복 가능성 있음 — Phase 2에서 정리)
S4  Q&A 형태
S5  미니 표

table
T1  기본 표(현재 renderer 기본 스타일 그대로)
T2  비교 표(좌우 대비 강조)
T3  단계별 표(절차형 글에서 STEP별 정리)

officialSources
O1  기본 목록형(현재 buildSourcesHtml() 그대로 — Variant 없이 시작)
```

**초기 구현에서는 Block당 1~2 Variant만 만든다.** 원 작업지시서 §17이 예시로 든 5개 Variant
(S1~S5, C1~C4, E1~E5)는 최종 목표이지 1차 구현 범위가 아니다 — Content Type/Pattern
Variant와 마찬가지로 "가장 작은 Vertical Slice" 원칙을 따른다.

## 4. 기존 raw HTML → Block 대응표 (호환성 다리)

이 표는 `body_html` 문자열 안에 이미 박혀 있는 CSS 클래스를 신규 Block으로 옮길 때 쓰는
변환 규칙이다. Legacy 글은 변환하지 않고 그대로 둔다(§ARTICLE_SCHEMA.md의 Legacy 호환 전략
참고). 신규 글부터 Block Schema로 저장할 때만 적용한다.

| 기존 HTML(raw string) | 신규 Block |
| --- | --- |
| `<ul class="mp-summary">...` 또는 `<div class="mp-summary">...` | `{ type: 'summary', variant: 'S1', items: [...] }` |
| `<p class="mp-point">...` | `{ type: 'point', text: ... }` (기존 타입 그대로) |
| `<p class="mp-warning"><strong>⚠ 주의</strong>...` | `{ type: 'warning', title: '주의', text: ... }` (기존 타입 그대로) |
| `<div class="mp-faq">...` | `{ type: 'faq', items: [{q,a}, ...] }` (기존 타입 그대로) |
| `<div class="mp-official-sources">...`(코드가 append) | `{ type: 'officialSources', variant: 'O1', agencies: [...] }` |
| `<a class="mp-calc-cta">...` | `{ type: 'calculator', label, href }` (기존 타입 그대로, §5에서 개수 이슈 수정) |

## 5. 렌더러 버그 동시 수정 권고

Block System 도입과 무관하게, 현재 `relatedCalculators.slice(0, 1)`로 1개만 노출하는 문제
(`ARTICLE_SYSTEM_V2.md` 발견 6)는 `calculator` Block을 여러 개 렌더링하도록 고치면 자연히
해결된다 — Block System을 "완성해야만" 고칠 수 있는 게 아니라 Phase 0에서 렌더러 한 줄만
고쳐도 되는 문제이므로, Roadmap Phase 0에 포함되어 있다.
