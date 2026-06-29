# 머니픽 아티클 HTML 작성 프롬프트 템플릿

아래 프롬프트를 Claude에 붙여넣고, 마지막 줄만 주제에 맞게 바꾸세요.

---

## 프롬프트 (복사해서 사용)

```
머니픽(moneypick) 금융 정보 사이트의 아티클 본문 HTML을 작성해줘.

## 규칙

- 독자: 금융 초보자. 어려운 용어는 쉽게 설명.
- 문체: 친근하고 간결하게. "~해요" 체.
- 길이: 소제목 4~6개, 전체 800~1200자 내외.
- 반드시 아래 HTML 구조와 클래스를 사용해야 해.
- prose 태그나 외부 스타일 없이 순수 HTML만 출력.

## 사용 가능한 HTML 클래스

### 핵심요약 박스 (글 상단에 1개)
<div class="mp-summary">
  <ul>
    <li>핵심 포인트 1</li>
    <li>핵심 포인트 2</li>
    <li>핵심 포인트 3</li>
  </ul>
</div>

### 소제목
<h2>소제목</h2>

### 본문 단락
<p>내용. <strong>굵게 강조</strong>도 사용 가능.</p>

### 목록
<ul>
  <li>항목 1</li>
  <li>항목 2</li>
</ul>

### 강조 박스 (핵심 포인트, 팁)
<div class="mp-point">
  중요한 내용을 한 문장으로 강조합니다.
</div>

### 주의 박스 (조심해야 할 내용)
<div class="mp-warning">
  <strong>⚠ 주의</strong><br>
  주의할 내용을 여기에 씁니다.
</div>

### 계산기 CTA (관련 계산기 연결)
<a class="mp-calc-cta" href="/calculators/계산기슬러그">
  <strong>계산기 제목</strong>
  <span>바로 계산해보기 →</span>
</a>

### FAQ 아코디언 (글 하단에 1개)
<div class="mp-faq">
  <details>
    <summary>자주 묻는 질문 1?</summary>
    <p class="mp-faq-answer">답변 내용.</p>
  </details>
  <details>
    <summary>자주 묻는 질문 2?</summary>
    <p class="mp-faq-answer">답변 내용.</p>
  </details>
</div>

## 계산기 슬러그 목록 (href에 사용)
- 전세대출: /calculators/jeonse-loan
- 주택담보대출: /calculators/mortgage
- 대환대출: /calculators/loan-refinancing
- DSR: /calculators/dsr
- 예금이자: /calculators/deposit
- 복리계산: /calculators/compound-interest
- 건강보험: /calculators/health-insurance
- 국민연금: /calculators/national-pension
- 취득세: /calculators/acquisition-tax
- 양도소득세: /calculators/capital-gains-tax
- 종합소득세: /calculators/comprehensive-income-tax
- 청약가점: /calculators/housing-subscription-score
- 전월세전환: /calculators/jeonse-monthly-conversion

## 출력 형식
- HTML 코드만 출력 (```html 블록 없이 순수 HTML)
- 위 클래스 외 추가 클래스/인라인 스타일 사용 금지

## 작성할 주제
[여기에 주제 입력 — 예: "DSR이란 무엇인가, 내 대출 한도 계산하는 법"]
```

---

## 예시 출력 (mortgage-transfer 기준)

```html
<div class="mp-summary">
  <ul>
    <li>금리 0.5%p만 낮아져도 3억 대출 기준 연 150만 원 절약</li>
    <li>대환대출 앱으로 은행 방문 없이 5분 만에 비교 가능</li>
    <li>중도상환수수료 확인 필수 — 아끼는 이자가 더 커야 이득</li>
  </ul>
</div>

<h2>갈아타기, 뭔가요?</h2>
<p>지금 받고 있는 대출을 더 좋은 조건의 다른 은행으로 바꾸는 걸 <strong>대환</strong>이라고 해요. 예전에는 직접 은행을 돌아다녀야 했지만, 이제는 앱 하나로 비교하고 갈아탈 수 있어요.</p>

<h2>갈아타면 진짜 이득일까요?</h2>
<p>금리가 낮아 보인다고 무조건 갈아타면 손해를 볼 수도 있어요. 갈아탈 때 드는 비용이 있기 때문이에요.</p>
<div class="mp-point">
  갈아타기 이득 = 아끼는 이자 − 중도상환수수료 − 부대비용
</div>

<a class="mp-calc-cta" href="/calculators/loan-refinancing">
  <strong>대환대출 절감액 계산기</strong>
  <span>갈아탔을 때 얼마나 아끼는지 바로 확인 →</span>
</a>

<div class="mp-faq">
  <details>
    <summary>전세대출도 갈아타기 되나요?</summary>
    <p class="mp-faq-answer">네, 가능해요. 전세대출도 대환대출 인프라를 통해 앱에서 비교하고 갈아탈 수 있어요.</p>
  </details>
  <details>
    <summary>갈아타기 신청하면 신용점수가 떨어지나요?</summary>
    <p class="mp-faq-answer">대출 조회 자체는 신용점수에 영향을 주지 않아요. 실제 대출 실행 시에만 소폭 반영될 수 있어요.</p>
  </details>
</div>
```

---

## 어드민 등록 방법

1. 위 프롬프트로 Claude가 HTML 생성
2. `/mp-console/articles/new` 접속
3. **제목, 카테고리, 슬러그** 입력 (1분)
4. **본문 HTML** 칸에 붙여넣기
5. **발행** 클릭
