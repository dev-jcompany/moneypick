# Display System · Thumbnail System · Rotation Engine 설계

[← ARTICLE_SYSTEM_V2.md](./ARTICLE_SYSTEM_V2.md)

원 작업지시서 §18~20에 대한 설계.

## 1. 현재 상태 (근거: ARTICLE_SYSTEM_V2.md §1.9, §1.10)

- 홈 섹션 구성: `Hero → CategoryCards → PostsSection → CalculatorCards → RecommendedPosts →
  BottomSection` ([app/page.tsx](../../app/page.tsx)) — 섹션 구성 자체는 이미 다양하다.
- 카드 컴포넌트: [PostCard.tsx](../../components/PostCard.tsx) **1종뿐**이며, DB의
  `moneypick_articles`가 아니라 정적 시드 데이터(`src/types.Post`)에 바인딩되어 있다.
  `PostsSection`, `RecommendedPosts`가 모두 이 하나의 카드를 재사용한다.
- 썸네일: 생성 경로에 따라 3가지 다른 로직(§ARTICLE_SYSTEM_V2.md §1.9) — archetype 기반
  24종 SVG(자동생성 전용) / category 1종 SVG(fallback) / 없음(수동).

## 2. Card Variant 설계

원 작업지시서 §18의 8개 후보(Standard/Large/Compact/Ranking/Number/Comparison/Brief/Image
Focus)를 모두 채택하지 않는다. 현재 `PostCard`가 이미 갖춘 요소(썸네일, 카테고리 배지, 날짜,
제목, 요약 2줄)를 기준으로, Content Type과 자연스럽게 짝지어지는 4종만 우선 정의한다.

| Card Variant | 적합 Content Type | 기존 PostCard 대비 차이 |
| --- | --- | --- |
| `standard` | 범용(기존 PostCard와 동일) | 없음 — 현재 컴포넌트를 그대로 V1으로 채택 |
| `number` | CALCULATOR_FOCUSED, POLICY_CHANGE | 카드 상단에 heroStat(핵심 숫자)을 크게 노출 |
| `comparison` | COMPARISON | "A vs B" 형태로 2분할 |
| `ranking` | 향후 랭킹형 콘텐츠 대비 예약(현재 랭킹 콘텐츠 없음) | 순번 배지 |

**초기 구현 범위: `standard`(기존 유지) + `number` 2종만.** 나머지는 실제 콘텐츠 수요가
생긴 뒤 추가한다 — 지금 랭킹형 콘텐츠가 전혀 없는 상태에서 `ranking` Variant를 먼저 만드는
것은 원 작업지시서 §31 "가장 작은 Vertical Slice" 원칙에 어긋난다.

## 3. 메인/카테고리 노출 개선

현재 홈 섹션 구성 자체는 나쁘지 않으므로 구조를 갈아엎지 않는다. 대신:

- `PostsSection`/`RecommendedPosts`가 `moneypick_articles`(DB)를 조회하도록 데이터 소스만
  교체한다(카드 디자인은 그대로, Phase 6). 현재 정적 데이터에 묶여 있어 자동 생성된 145건의
  실제 콘텐츠가 홈에 전혀 노출되지 않고 있을 가능성이 있다 — 이 부분은 이번 조사에서
  `app/page.tsx`가 어떤 데이터 소스를 쓰는지까지는 전수 확인하지 않았으므로, Phase 6 착수
  시 재확인 필요(확인되지 않은 부분은 명시한다).
- 카테고리 페이지(`app/[categoryEn]/page.tsx`)는 이번 조사에서 상세 검토하지 않았다 —
  Phase 6에서 함께 조사·설계한다.

## 4. Thumbnail System 통합

현재 3개로 갈라진 썸네일 로직을 **1개로 통합**한다.

- 기준 재료를 `archetype`(구, 8종)에서 `Content Type`(신, 8종, §CONTENT_TYPES_AND_PATTERNS.md)
  으로 교체한다 — 타입 개수가 동일(8종)하므로 `mcp/thumbnail-generator.mjs`의 기존 24개
  SVG 템플릿(타입당 3개)을 그대로 재사용할 수 있다. 새로 그릴 필요 없음.
- `topic-selection-policy.md`가 제안한 `moneyAction`(받기/아끼기/피하기/결정하기)을 색상
  보조 신호로 추가 검토한다 — 단, `moneyAction` 자체가 아직 미구현(§ARTICLE_SYSTEM_V2.md
  발견 10)이므로 이 부분은 topic-selection-policy.md 구현이 선행돼야 한다. Phase 7 이후로
  분리한다.
- `lib/article-thumbnail.ts`(fallback)와 `mcp/thumbnail-generator.mjs`(자동생성 전용)를
  하나의 모듈로 합치고, 관리자 수동 작성 경로(경로 1)에도 "자동 썸네일 생성" 버튼을 추가해
  세 경로 모두 같은 결과를 내도록 한다.

## 5. 반복 방지 Rotation/Variation Engine

원 작업지시서 §20의 점수 구조를 그대로 채택하되, 이미 구현된 `pickPattern`/`pickTitleStyle`
로직(§CONTENT_TYPES_AND_PATTERNS.md §5)을 확장하는 형태로 설계한다 — 새 엔진을 처음부터
만들지 않는다.

```
Selection Score =
    콘텐츠 적합도       (Pattern이 Content Type에 맞는가 — article-patterns.json이 이미 타입별로
                          패턴을 분리해 놓았으므로 항상 만족, 가중치 없음)
  + 다양성 점수         (최근 5개 이력에 이 Pattern/Variant/Card Variant가 없으면 +)
  + 최근 미사용 보너스   (schedule-state.json.history 기준 미사용 기간에 비례)
  - 최근 반복 패널티     (최근 5개 중 2회 이상 사용 시 후보에서 제외 — 기존 pickPattern 로직 그대로)
```

정확한 가중치는 구현 단계(Phase 5)에서 결정한다. 이번 설계에서 고정하는 것은 구조뿐이다.

**선행 조건**: 이 엔진이 실효성을 가지려면 `schedule-state.json.history`가 실제로 채워져야
한다(§ARTICLE_SYSTEM_V2.md 발견 11 — 현재 비어 있는 것으로 확인됨). Rotation Engine 확장
작업 전에 이 부분이 정상 동작하는지 먼저 확인/수정한다.
