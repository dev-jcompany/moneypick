# MoneyPick Article 입력 프롬프트

> **DEPRECATED / LEGACY WORKFLOW**
> 신규 Article 작성의 기준 문서로 사용하지 않습니다. Article System V2 설계와 자동 Pipeline 규칙을 우선합니다.

> Article System V2 안내: 이 문서는 독립 저장 규칙이 아니라 관리자 작성 화면에 넣을 초안을 만드는 보조 문서다. 저장 시 `/api/articles`의 Article Generation Core가 유형, 패턴, 구조화 summary/FAQ, 관련 계산기, 공식 확인처, validation을 공통 적용한다.

## 사용 방법

1. 아래 프롬프트로 HTML 초안을 만든다.
2. 현재 관리자 기사 작성 화면에서 제목, 카테고리, slug, 설명과 본문 HTML을 입력한다.
3. 관리자가 입력한 값은 Core 생성값보다 우선한다.
4. 저장된 글은 반드시 검토한 뒤 발행한다.

## 작성 프롬프트

```text
MoneyPick 금융 정보 사이트의 Article 본문 HTML을 작성해 주세요.

규칙:
- 금융 초보자가 이해할 수 있는 한국어로 작성합니다.
- 검증되지 않은 금융·세금 수치를 임의로 계산하지 않습니다.
- 정책, 금리, 세율 등 변경 가능한 값은 기준일 또는 확인 필요 여부를 표시합니다.
- 공식 기관의 이름과 URL을 임의로 만들지 않습니다.
- 인라인 style, script, 이벤트 핸들러를 사용하지 않습니다.
- 아래 허용 구조를 사용한 순수 HTML만 출력합니다.

권장 구조:
<ul class="mp-summary">
  <li>독립적으로 이해되는 핵심 요약 1</li>
  <li>독립적으로 이해되는 핵심 요약 2</li>
  <li>독립적으로 이해되는 핵심 요약 3</li>
</ul>

<h2>소제목</h2>
<p>본문</p>
<div class="mp-point">핵심 포인트</div>
<div class="mp-warning"><strong>주의</strong><br>주의할 내용</div>

관련 계산기가 확실한 경우에만:
<a class="mp-calc-cta" href="/calculators/실제-slug">
  <strong>계산기 이름</strong>
  <span>직접 계산하기</span>
</a>

실제 관련 질문이 있는 경우에만:
<div class="mp-faq">
  <details>
    <summary>질문</summary>
    <p class="mp-faq-answer">답변</p>
  </details>
</div>

주제: [여기에 주제 입력]
```

## Core 처리 규칙

- `mp-summary`는 Legacy Article HTML compatibility format이며 `<ul class="mp-summary">`를 사용한다.
- V2에서는 향후 `SummaryBlock`으로 대체한다.
- `mp-faq`의 질문과 답변은 DB의 `faq jsonb`로 구조화된다.
- 명시적인 구조화 값이 없으면 lead와 본문에서 안전하게 보완한다.
- 관련 계산기와 공식 확인처는 기존 registry/engine을 재사용해 보완한다.
- 기존 `body_html` renderer와 sanitize 정책은 유지된다.
- 적절한 FAQ나 계산기가 없는 글에는 억지로 추가하지 않는다.
