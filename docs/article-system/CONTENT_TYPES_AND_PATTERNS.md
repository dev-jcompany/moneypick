# Content Type · Article Pattern · Pattern Variant 설계

[← ARTICLE_SYSTEM_V2.md](./ARTICLE_SYSTEM_V2.md)

이 문서는 원 작업지시서 §13~15(Content Type, Article Pattern, Pattern Variant)에 대한 설계다.
설계 원칙: **기존 `mcp/article-patterns.json`(6타입 × 2패턴)을 버리지 않고 그 위에 쌓는다.**
새로 만드는 것은 Content Type 통합 매핑과 Pattern Variant 레이어뿐이다.

## 1. 왜 통합이 필요한가

현재 두 체계가 병렬로 존재한다(근거는 `ARTICLE_SYSTEM_V2.md` §1.5):

- `topics.json.archetype` — 8종, 사람이 주제마다 수동 배정, `system-prompt.md`의 구조
  스켈레톤을 결정
- `pattern-selector.mjs`의 `articleType` — 6종, 제목/태그 키워드로 코드가 자동 판정,
  `article-patterns.json`의 패턴(섹션 순서)을 결정하고 DB에 저장됨

원 작업지시서 §13이 제시한 15개 후보(EXPLAINER, CALCULATION, COMPARISON, ELIGIBILITY,
CHECKLIST, SIMULATION, FAQ, UPDATE, HOW_TO, CASE_STUDY, RANKING, DECISION, DATA_REPORT,
TIMELINE, PROBLEM_SOLUTION)를 그대로 채택하지 않는다. 이미 운영 중인 6타입(articleType)이
DB에 145건 저장되어 있고, 실제 검색 의도와 계산기·공식출처 연동 로직이 이 6타입을 중심으로
짜여 있기 때문이다. **기존 6타입을 뼈대로 삼아 8종 archetype이 커버하던 것 중 6타입에 없는
것만 추가**하는 방식으로 결정했다.

## 2. 최종 Content Type (8종)

기존 articleType 6종을 유지하고, archetype에만 있던 "하우투·절차형"과 "꿀팁·리스트형"을
독립 타입으로 승격한다(이 둘은 6타입 중 어디에도 명확히 대응되지 않기 때문— GUIDE로 묶기엔
절차형·리스트형이 섹션 구조가 뚜렷이 다르다).

| Content Type | 구 articleType | 구 archetype 대응 | 설명 |
| --- | --- | --- | --- |
| `GUIDE` | GUIDE | 개념정리형, 완벽가이드형 | 개념 정의·자격·조건을 정리해서 알려주는 글 |
| `COMPARISON` | COMPARISON | 비교형 | A vs B 비교, 상황별 추천 |
| `CASE_STUDY` | CASE_STUDY | 케이스·대상별형 | 구체적 인물/조건 기반 시뮬레이션 |
| `CHECKLIST` | CHECKLIST | (신규 대응 없음, 흡수) | 대상 확인·준비 항목 점검 |
| `CALCULATOR_FOCUSED` | CALCULATOR_FOCUSED | (신규 대응 없음, 흡수) | 계산 결과가 핵심인 글 |
| `POLICY_CHANGE` | POLICY_CHANGE | 트렌드·정책형 | 제도 변경·시행일 대응 |
| `HOW_TO` (신규) | — | 하우투·절차형 | STEP 단위 절차 안내 |
| `TIPS_LIST` (신규) | — | 꿀팁·리스트형 | 독립적인 팁 여러 개 나열 |

"함정주의형"(archetype)은 별도 Content Type을 신설하지 않고, 아래 §3의 각 Type에
`WARNING` 계열 Pattern으로 흡수한다 — 함정주의형의 본질은 "무엇에 대해 경고하는가"이지
"무엇을 다루는가"가 아니므로, 독립 주제 분류가 아니라 표현 Pattern으로 두는 것이 Gap
Analysis 결과와 맞다(§ARTICLE_SYSTEM_V2.md §4의 "구조 규칙 정의 위치 통합" 방향과 일치).

## 3. topics.json 마이그레이션 매핑 (실행은 별도 Sprint)

기존 250개 주제의 `archetype` 값을 신규 Content Type으로 옮기려면 아래 규칙을 적용한다.
(이번 단계에서는 실행하지 않는다 — 매핑 규칙만 확정.)

```
개념정리형    → GUIDE
완벽가이드형  → GUIDE
비교형        → COMPARISON
케이스·대상별형 → CASE_STUDY
트렌드·정책형 → POLICY_CHANGE
하우투·절차형 → HOW_TO
꿀팁·리스트형 → TIPS_LIST
함정주의형    → pattern-selector.mjs 키워드 재판정 후 6~8종 중 하나로 배정 +
                WARNING 계열 Pattern 태깅
```

이후 `pattern-selector.mjs`의 `selectArticleType()`은 이 8종을 대상으로 재판정하면 되므로
코드 변경은 `TYPE_PRIORITY`/`KEYWORDS`/`OVERRIDE_KEYWORDS`에 `HOW_TO`, `TIPS_LIST` 두
항목을 추가하는 정도로 끝난다(대규모 재작성 아님).

## 4. Article Pattern

기존 `article-patterns.json`의 12개 패턴(6타입 × 2개)을 그대로 유지하고, 신규 2개 타입에
패턴을 추가한다.

| Content Type | 기존 패턴 | 신규 패턴(제안) |
| --- | --- | --- |
| GUIDE | GUIDE_01 결론 우선형, GUIDE_02 대상 안내형 | — |
| COMPARISON | COMPARISON_01 비교표 중심형, COMPARISON_02 비용 계산 비교형 | — |
| CASE_STUDY | CASE_01 가상 사례형, CASE_02 질문 답변형 | — |
| CHECKLIST | CHECKLIST_01 대상 확인형, CHECKLIST_02 5가지 확인형 | — |
| CALCULATOR_FOCUSED | CALCULATOR_01 계산 예시형, CALCULATOR_02 상황 비교형 | — |
| POLICY_CHANGE | POLICY_01 비교 중심형, POLICY_02 유불리 분석형 | — |
| HOW_TO | — | `HOWTO_01` 준비물→STEP형, `HOWTO_02` 흔한 실수 중심형 |
| TIPS_LIST | — | `TIPS_01` 항목 나열형, `TIPS_02` 효과 극대화형 |

신규 패턴 정의는 `article-patterns.json`과 동일한 스키마(`label`, `sections`, `intro`,
`requiredElements`, `avoidPhrases`)를 따른다. 원 archetype 스켈레톤 설명
(`SKELETON['하우투·절차형']`, `SKELETON['꿀팁·리스트형']`, 위치는
`mcp/scheduled-generator.mjs`)을 그대로 이관하면 된다 — 내용을 새로 만들 필요가 없다.

## 5. Pattern Variant (신규 레이어)

현재 각 패턴은 고정된 `sections` 배열 1개뿐이라 "같은 패턴이면 항상 같은 순서"다. Variant는
같은 패턴 안에서 섹션 순서·도입부를 2~4가지로 나눈다. 예시(COMPARISON_01 기준):

```
COMPARISON_01-A  (기존 기본값)
  A와 B의 핵심 차이 → 비교표 → A 장단점 → B 장단점 → 상황별 추천 → 최종 판단

COMPARISON_01-B  질문 우선형
  독자 질문("A와 B 중 뭐가 나을까?") → 결론 한 문장 → 비교표 → 근거 → 예외 상황

COMPARISON_01-C  숫자 우선형
  핵심 숫자 차이(예: "월 12만 원 차이") → 비교표 → 그 차이가 나는 이유 → 상황별 추천
```

**초기 구현 범위: Pattern당 2개 Variant까지만.** 원 작업지시서 §15가 권장한 "Pattern당
3~4개"보다 보수적으로 잡는다 — 12개 기존 패턴 + 4개 신규 패턴 = 16개 패턴 × 3~4 Variant는
48~64개를 한 번에 설계해야 해서 Roadmap의 "가장 작은 Vertical Slice" 원칙(§ARTICLE_SYSTEM_V2.md
§9)과 어긋난다. Variant 확장은 Block Component 구현(Phase 2) 이후, 실제 렌더링이 가능해진
다음에 진행한다.

### Naming 규칙

`{PATTERN_ID}-{A|B|C|D}` (예: `GUIDE_01-A`). Registry는 `article-patterns.json`과 같은
디렉터리에 `pattern-variants.json`으로 신설하고, 각 Pattern의 `variants` 배열로 참조한다.
DB `pattern_id` 컬럼은 기존과 같이 Pattern까지만 저장하고, Variant는 신규 `article_schema`
컬럼(§ARTICLE_SCHEMA.md) 안에 저장한다 — 기존 컬럼 의미를 바꾸지 않는다.

### Rotation

기존 `pickPattern()`의 "직전과 다른 것, 최근 5개 중 2회 이상 금지" 로직을 Variant 레벨에도
동일하게 적용한다(코드 재사용, 신규 로직 아님). 단, `schedule-state.json.history`가 현재
비어 있는 문제(§ARTICLE_SYSTEM_V2.md §2 발견 11)를 먼저 고쳐야 실효성이 있다 — Phase 0에
포함할 것을 권장.
