# 로컬 개발환경 설정

## 요구사항

- Git
- Node.js 22
- npm 10 이상
- VS Code(권장)

## 설치와 실행

```bash
git clone https://github.com/dev-jcompany/moneypick.git
cd moneypick
cp .env.example .env.local
npm ci
npm run dev
```

Windows PowerShell에서는 `Copy-Item .env.example .env.local`을 사용합니다. `.env.local`에 개발용 값을 입력하고 `http://localhost:3000`을 엽니다.

## 검증

```bash
npm run lint
npm run build
```

`package-lock.json`은 커밋합니다. 의존성을 의도적으로 변경할 때만 `npm install PACKAGE_NAME`을 사용하고, 일반 재설치와 CI에서는 `npm ci`를 사용합니다.
