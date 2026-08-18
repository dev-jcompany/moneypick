# Article Schema 초안 · Legacy 호환 전략 · Article Agent V2 역할

> 상태 (2026-08-18): Phase 1 기반 구현 완료. `ArticleSchemaV2` envelope, 최소 runtime validator,
> legacy fallback 규칙과 nullable Production `article_schema` 컬럼이 적용되었다. V2 Renderer는 다음 Phase 범위다.

[← ARTICLE_SYSTEM_V2.md](./ARTICLE_SYSTEM_V2.md)

원 작업지시서 §21~22, §24에 대한 설계와 Phase 1 구현 상태를 기록한다.
Production migration은 `supabase/migrations/20260818_add_article_schema.sql`로 적용되었다.

## 1. 저장 위치 결정

세 가지 선택지를 검토했다.

| 옵션 | 설명 | 채택 여부 |
| --- | --- | --- |
| A. `body_html`을 완전히 대체 | 기존 컬럼 제거, 전면 JSON 전환 | ❌ 기각 — 기존 145건+ 콘텐츠와 5개 생성 경로 전부를 한 번에 바꿔야 함, 리스크 큼 |
| B. 기존 죽은 컬럼(`summary`, `faq`) 재활용 | 이미 있는 `text[]`/`jsonb` 컬럼에 구조 데이터를 넣음 | ❌ 기각 — 두 컬럼 모두 이름과 목적이 좁게 고정돼 있어(요약 배열, FAQ 배열) 전체 Schema(type/pattern/variant/blocks)를 담기엔 형태가 안 맞음. §ARTICLE_SYSTEM_V2.md 발견 2 |
| **C. 신규 nullable 컬럼 추가** | `article_schema jsonb null` 컬럼 신설, `body_html`은 계속 유지(Schema가 있으면 body_html은 Schema로부터 렌더 시점에 파생 생성하거나 캐시로 병행 저장) | ✅ 채택 |

C를 선택한 이유: 기존 컬럼·경로를 하나도 깨지 않는다. `article_schema`가 `NULL`이면 100%
기존 동작(legacy HTML 렌더)이고, 값이 있으면 V2 렌더러가 사용한다. 롤백이 언제든 가능하다
(컬럼을 무시하기만 하면 됨).

## 2. Article Schema 초안 (TypeScript)

```ts
// 신규 컬럼 moneypick_articles.article_schema 에 저장될 JSON의 타입.
// 기존 ArticleBlock(components/moneypick/types.ts)을 확장한다.

type ContentType =
  | 'GUIDE' | 'COMPARISON' | 'CASE_STUDY' | 'CHECKLIST'
  | 'CALCULATOR_FOCUSED' | 'POLICY_CHANGE' | 'HOW_TO' | 'TIPS_LIST';
  // CONTENT_TYPES_AND_PATTERNS.md §2

interface ArticleSchemaV2 {
  version: 2;
  contentType: ContentType;
  pattern: string;         // 예: 'COMPARISON_01' — 기존 article-patterns.json 키 그대로 재사용
  variant: string;         // 예: 'A'
  blocks: ArticleBlockV2[];
}

// 기존 8종 + 신규 3종(우선 구현분, BLOCK_SYSTEM.md §2)만 우선 정의.
// 기존 8종은 components/moneypick/types.ts의 ArticleBlock과 필드 호환.
type ArticleBlockV2 =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'checklist'; title: string; items: string[] }
  | { type: 'point'; text: string }
  | { type: 'warning'; title?: string; text: string }
  | { type: 'example'; text: string }
  | { type: 'calculator'; items: { label: string; href: string; caption?: string }[] } // ← 배열로 변경, slice(0,1) 버그 수정
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'summary'; variant: 'S1' | 'S2'; items: string[] }               // 신규, 우선 구현
  | { type: 'table'; variant: 'T1'; caption?: string; headers: string[]; rows: string[][] } // 신규, 우선 구현
  | { type: 'officialSources'; variant: 'O1'; agencyIds: string[] };          // 신규, 우선 구현
  // 나머지 Block(comparison/scenario/eligibility/steps/timeline/prosCons/updateInfo)은
  // BLOCK_SYSTEM.md §2의 "신규 12종" 표에 정의만 해 두고, Phase 2 이후 실제 구현 시 여기에 추가한다.
```

`calculator` Block을 배열로 바꾼 것은 §ARTICLE_SYSTEM_V2.md 발견 6(3개 요구, 1개만 노출)을
Schema 레벨에서 원천적으로 막기 위함이다 — 렌더러가 "1개만 보여준다"는 선택을 할 수 없도록
데이터 형태 자체를 여러 개로 강제한다.

`officialSources.agencyIds`는 `mcp/official-registry.mjs`의 `OFFICIAL_AGENCIES[].id`를
그대로 참조한다(예: `['fsc', 'fss']`) — 기관 정보(이름/URL/설명)를 Schema에 중복 저장하지
않고 항상 레지스트리에서 조회한다. 레지스트리가 갱신되면 과거 글도 자동 반영된다.

## 3. Schema Validator

기존 `mcp/scheduled-generator.mjs`의 `validate()`(REQUIRED 필드 체크, metaDescription
길이, mp-summary/mp-faq 정규식 체크)를 확장한다. Schema 도입 후에는 정규식 체크 대신
JSON 구조 체크로 대체한다:

```
- contentType이 8종 중 하나인가
- pattern이 해당 contentType의 allowed pattern 후보에 존재하는가
- blocks[0]이 summary 타입인가(현재 "최상단 mp-summary" 규칙 계승)
- blocks에 faq 타입이 최소 1개 있는가(현재 "최하단 mp-faq" 규칙 계승)
- calculator Block이 있다면 items.length >= 3
```

기존 정규식 기반 체크가 하던 일을 그대로 구조 체크로 옮기는 것이므로 검증 엄격도는 떨어지지
않는다.

## 4. Legacy 호환 전략

```
article_schema IS NULL  (기존 145건+ 전부, 그리고 V2 적용 전 신규 글)
        ↓
   Legacy 경로: body_html → sanitizePostHtml() → dangerouslySetInnerHTML
   (MoneyPickArticle.tsx 현재 로직 그대로, 변경 없음)

article_schema IS NOT NULL  (V2 적용 후 신규 글만)
        ↓
   V2 경로: article_schema.blocks → <Block v2 컴포넌트> 조립 렌더
   (body_html은 SEO/RSS 등 HTML 문자열이 필요한 곳을 위해 저장 시점에 blocks로부터
    파생 생성해 병행 저장 — 별도 렌더 로직 불필요, 기존 sanitize 경로 재사용 가능)
```

권장 방향(원 작업지시서 §22가 제안한 "점진적 전환"): **기존 기사는 즉시 마이그레이션하지
않는다. 신규 기사부터 V2를 적용한다.** 이유:

- 기존 145건+ 글을 일괄 변환하려면 HTML → Block 역파싱이 필요한데, 자유 형식 HTML(특히
  관리자 수동 작성분)은 파싱 규칙이 깨지기 쉽다.
- Legacy 렌더 경로를 없앨 이유가 없다 — `article_schema` 컬럼이 nullable인 한 legacy와
  V2는 영구 공존 가능하며, 유지 비용은 "분기 하나" 수준이다.
- 검색엔진에 이미 색인된 기존 글의 URL·구조를 변경 없이 유지할 수 있다.

legacy renderer 유지 기간은 **명시적 종료 시점을 두지 않는다.** V2 Block 구현이 충분히
성숙하고(Phase 2~3), 관리자 폼이 V2 작성을 기본값으로 유도하기 시작한 뒤(Phase 4), 실제
신규 글 비중이 legacy를 앞서는 시점에 재논의한다.

기존 글의 V2 전환 가능성: 자동 생성 파이프라인(경로 4)이 만든 글은 `mp-summary`/`mp-faq`
형식이 일관돼 있어(validate()가 강제) 향후 반자동 변환기를 만들 수 있다. 관리자 수동
작성분(경로 1·2)은 형식이 자유로워 자동 변환이 어렵다 — 필요하면 재작성 대상으로만 분류
권장.

## 5. Article Agent V2 역할

원 작업지시서 §24의 역할 정의를 실제 코드에 대응시킨다. **모두 기존 모듈의 확장이며, 신규
Agent를 만들지 않는다.**

```
Topic (topics.json)                        [기존] 그대로
   ↓
Search Intent (moneyAction)                [신규] topic-selection-policy.md 구현 필요, 별도 트랙
   ↓
Content Type                               [확장] pattern-selector.mjs의 selectArticleType()
   ↓                                              에 HOW_TO/TIPS_LIST 키워드만 추가
Pattern 후보                               [기존] article-patterns.json
   ↓
Variation Engine                           [확장] pickPattern()/pickTitleStyle()에
   ↓                                              Variant 레벨 회전 추가
Block Composition                          [신규] Content Type→Block 조합 규칙, 이 문서 §2
   ↓
Calculator / Source                        [확장] engine.mjs 키워드 매핑을 4개→16개 계산기로 확대,
   ↓                                              official-registry.mjs는 변경 없음
AI Content Generation                      [개편] system-prompt.md가 HTML 대신 Block JSON을
   ↓                                              출력하도록 프롬프트 재작성(원칙 A 적용)
Schema Validation                          [확장] 이 문서 §3
   ↓
Draft Save                                 [기존] app/api/admin/articles/draft/route.ts에
                                                   article_schema 필드 저장 추가
```

**기존 `scheduled-generator.mjs`를 폐기하지 않고 확장한다.** 근거:
`ARTICLE_SYSTEM_V2.md` §1.4에서 확인했듯 이 스크립트는 이미 pattern-selector/calculator
engine/official registry/link cache/thumbnail generator/재시도·크레딧 부족 처리(2026-08-17
보안 Sprint에서 하드닝 완료)까지 갖춘, 운영 이력 145건의 검증된 파이프라인이다. 새 Agent를
만들면 이 모든 걸 다시 구현해야 하고 두 파이프라인이 병존하며 또 다른 SSOT 위반을 만든다.

경로 1(관리자 수동)·경로 3(Claude Desktop MCP)은 Agent가 아니라 "사람이 직접/도구로 저장"하는
경로이므로 Article Agent V2 범위 밖이다. 다만 Phase 4에서 관리자 폼에 Content Type/Pattern
선택 UI가 추가되면, 이 두 경로도 최소한 `article_schema.contentType`/`pattern`은 채울 수
있게 된다(AI 자동 추천 + Override, 원 작업지시서 §23 방향과 일치).
