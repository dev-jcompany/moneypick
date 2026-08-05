# 머니픽 자동 콘텐츠 생성 파이프라인

자동으로 금융 아티클을 생성·등록하는 파이프라인 구조와 운영 방법을 설명합니다.

---

## 전체 흐름

```
topics.json (예정 주제)
    ↓
scheduled-generator.mjs 실행
    ↓
[보조 데이터 준비]
  ① 기사 유형·패턴·제목 스타일 선택 (pattern-selector.mjs)
  ② 계산기 실제 계산값 주입 (calculators/engine.mjs)
  ③ 공식 확인처 매칭 (official-registry.mjs)
  ④ 내부링크 추천 후보 (link-cache.mjs)
    ↓
Claude API 호출 (system-prompt.md + 보조 데이터)
    ↓
JSON 출력 검증 (mp-summary, mp-faq, metaDescription 길이)
    ↓
공식 확인처 HTML을 bodyHtml 끝에 append
    ↓
썸네일 생성 (thumbnail-generator.mjs)
    ↓
관리자 API POST /api/admin/articles/draft
    ↓
link-cache.json 업데이트
schedule-state.json 업데이트
    ↓
관리자 검수 후 수동 발행
```

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `mcp/scheduled-generator.mjs` | 메인 생성 스크립트 |
| `mcp/system-prompt.md` | Claude 시스템 프롬프트 |
| `mcp/topics.json` | 생성 대상 주제 목록 |
| `mcp/schedule-state.json` | 생성 완료 이력·패턴 로테이션 |
| `mcp/article-patterns.json` | 유형별 섹션 구성 패턴 |
| `mcp/pattern-selector.mjs` | 기사 유형·패턴·제목스타일 선택 |
| `mcp/official-registry.mjs` | 공식 기관 레지스트리 + 매칭 |
| `mcp/link-cache.mjs` | 내부링크 캐시 로드/저장/매칭 |
| `mcp/link-cache.json` | 생성된 글의 slug·태그 캐시 |
| `mcp/backfill-link-cache.mjs` | DB 발행글 → link-cache 초기 구축 |
| `mcp/samples/` | Claude few-shot 예시 샘플 |
| `lib/calculators/engine.mjs` | 계산기 실제 계산 엔진 |

---

## 실행 방법

```bash
# 기본 실행 (6개 생성)
node mcp/scheduled-generator.mjs

# 옵션
--limit N      # 생성 개수 지정
--dry          # API 호출 없이 대상·설정만 출력
--debug        # 추천 점수 상세 출력
--model NAME   # 사용할 Claude 모델 지정

# 예시
node mcp/scheduled-generator.mjs --limit 3 --debug
node mcp/scheduled-generator.mjs --dry
```

---

## 공식 확인처 자동 연결 (v1)

### 개요
주제·태그 분석 → 관련 공식 기관 1~3개 선택 → Claude 프롬프트에 귀속 지침 주입 → 글 하단에 "공식 확인처" 섹션 자동 생성.

### 지원 기관 (10개)

| 기관 | 대상 주제 |
|------|-----------|
| 금융위원회 | DSR, 대출 규제, 금융정책 |
| 금융감독원 | 금융소비자, 금융상품, 대출금리 |
| 한국은행 | 기준금리, 금리 동향 |
| 국세청 | 종합소득세, 연말정산, 양도소득세 |
| 행정안전부 | 취득세, 자동차세, 지방세 |
| 국토교통부 | 청약, 주택 정책, 임대차 |
| 주택도시기금 | 버팀목, 디딤돌, 전세자금 |
| 고용노동부 | 실업급여, 고용보험, 퇴직금 |
| 국민연금공단 | 국민연금, 연금 수령액 |
| 국민건강보험공단 | 건강보험료, 피부양자 |

### 매칭 규칙
- 키워드 매칭 없으면 카테고리 일치만으로 포함하지 않음
- 최대 3개, 관련성 낮으면 빈 배열 허용
- 레지스트리 외 URL 사용 금지

### 렌더링
- CSS 클래스: `.mp-official-sources` (globals.css)
- 라이트/다크 모드 대응

---

## 내부링크 자동 추천 (v1)

### 개요
생성 성공한 글을 `link-cache.json`에 누적 저장. 다음 생성 시 태그·카테고리·계산기 기반으로 실존 slug를 Claude 프롬프트에 주입하여 `recommended` 배열의 404 방지.

### 추천 점수 알고리즘

| 조건 | 점수 |
|------|------|
| 카테고리 동일 | +3 |
| 태그 동일 | +5 / 태그 |
| 동일 계산기 slug | +4 / 계산기 |
| 최근 30일 게시글 | +1 |
| 조회수 > 0 | +2 |
| 현재 생성 글 | 제외 |

### link-cache.json 항목 구조

```json
{
  "slug": "stress-dsr-3-stage-guide",
  "title": "스트레스 DSR 3단계 완벽 정리",
  "categoryLabel": "대출연구소",
  "tags": ["DSR", "대출 규제"],
  "calcSlugs": ["dsr", "mortgage"],
  "views": 120,
  "publishedAt": "2026-08-01"
}
```

### 백필 (최초 1회 실행 권장)

```bash
# 발행된 글만
node mcp/backfill-link-cache.mjs

# draft 포함 전체
node mcp/backfill-link-cache.mjs --all
```

---

## recommended DB 저장 (v1)

### 개요
Claude가 생성한 `recommended` 배열의 slug를 `recommended_slugs TEXT[]` 컬럼에 저장. 향후 페이지 렌더링에서 활용 예정. 현재 페이지는 `getMoneypickArticlesByCategory`로 동적 로딩 유지.

### 관련 파일
- `supabase/moneypick_articles.sql` — 컬럼 추가 마이그레이션
- `lib/db.ts` — `ArticleSavePayload.recommended_slugs`
- `app/api/admin/articles/draft/route.ts` — `relatedSlugs` 파라미터 처리

---

## Claude 프롬프트 구조 (extraBlocks)

```
사용자 메시지 = buildUserPrompt(topic, siblings)
  + [patternBlock]      ← 기사 유형·패턴·제목 스타일
  + [scenario.block]    ← 계산기 실제 계산값 (있는 경우)
  + [sourcesBlock]      ← 공식 확인처 귀속 지침
  + [recommendedBlock]  ← 실제 발행 글 slug 목록
```

---

## bodyHtml 필수 구조

```html
<!-- 최상단 -->
<ul class="mp-summary">
  <li>핵심 1</li>
  <li>핵심 2</li>
  <li>핵심 3</li>
</ul>

<!-- 본문 (h2/h3, p, ul, table, mp-point, mp-warning) -->

<!-- 최하단 (Claude 생성) -->
<div class="mp-faq">
  <details><summary>질문</summary><p class="mp-faq-answer">답변</p></details>
</div>

<!-- 공식 확인처 (시스템 자동 append) -->
<div class="mp-official-sources">...</div>
```

---

## 운영 주의사항

1. **검수 필수**: 모든 글은 `draft` 상태로 저장. 관리자가 검수 후 수동 발행.
2. **`[확인 필요]` 마커**: Claude가 불확실한 수치에 표시. 발행 전 반드시 확인.
3. **link-cache 백필**: DB에 발행 글이 쌓인 후 백필 실행 시 추천 품질이 크게 향상됨.
4. **공식 URL 변경**: `mcp/official-registry.mjs`의 레지스트리만 수정. 본문 코드에 URL 직접 입력 금지.
5. **topics.json 관리**: 새 주제 추가 시 `archetype` 필드 필수. 없으면 생성 대상에서 제외.
