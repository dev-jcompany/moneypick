# MoneyPick

MoneyPick은 Next.js 기반의 금융 정보·계산기 서비스입니다. GitHub를 단일 원본으로 사용하며 로컬 PC와 GitHub Codespaces에서 같은 방식으로 개발할 수 있습니다.

## 빠른 시작

필수 환경은 Node.js 22와 npm입니다.

```bash
cp .env.example .env.local
npm ci
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 실제 비밀값은 `.env.local`에만 저장하고 Git에 커밋하지 마세요.

## 검증

```bash
npm run lint
npm run build
```

## Codespaces

GitHub 저장소의 **Code → Codespaces → Create codespace on master**를 선택합니다. 컨테이너가 만들어지면 `npm ci`가 자동 실행됩니다. 터미널에서 `npm run dev`를 실행하면 3000번 포트가 자동 전달됩니다.

자세한 절차는 [`docs/setup`](docs/setup/) 문서를 참고하세요.

## 주요 문서

- [GitHub 설정](docs/setup/GITHUB_SETUP.md)
- [Codespaces 설정](docs/setup/CODESPACES_SETUP.md)
- [로컬 설정](docs/setup/LOCAL_SETUP.md)
- [개발 가이드](docs/setup/DEVELOPMENT_GUIDE.md)
