# 개발 가이드

## 작업 흐름

1. 기본 브랜치를 최신 상태로 갱신합니다.
2. `feature/설명`, `fix/설명`, `docs/설명` 형태의 작업 브랜치를 만듭니다.
3. 기능과 무관한 대규모 포맷 변경을 섞지 않습니다.
4. lint와 build를 통과시킵니다.
5. 변경 이유와 검증 결과를 Pull Request에 기록합니다.
6. 리뷰 후 기본 브랜치에 병합합니다.

## 표준

- Node.js: `.nvmrc`의 22
- 패키지 관리자: npm과 `package-lock.json`
- 언어: TypeScript 우선
- 정적 검사: ESLint 9와 Next.js 설정
- 들여쓰기/줄바꿈: 공백 2칸, LF
- 포맷터: Prettier 확장은 제공하지만 의존성이 추가되기 전까지 자동 저장 포맷은 끕니다.

현재 TypeScript와 ESLint 설정은 유지합니다. Prettier를 강제하려면 별도 변경으로 `prettier`를 devDependency에 고정하고 전체 코드 포맷 영향을 먼저 검토합니다.

## 환경 변수와 보안

- 공개 가능한 값에만 `NEXT_PUBLIC_` 접두사를 사용합니다.
- 서비스 역할 키, 관리자 키와 비밀번호는 서버 코드와 secret 저장소에서만 사용합니다.
- 실제 `.env*`, 인증서, 로그와 DB 덤프를 커밋하지 않습니다.
- 키가 Git 이력에 들어가면 즉시 폐기하고 재발급합니다.

## CI 완료 기준

Pull Request와 기본 브랜치 푸시에서 `npm ci`, `npm run lint`, `npm run build`를 순서대로 실행합니다. 배포는 포함하지 않습니다.
