# Codespaces 설정

## 시작

1. GitHub 저장소에서 **Code**를 누릅니다.
2. **Codespaces** 탭에서 **Create codespace**를 선택합니다.
3. 컨테이너 생성과 `npm ci` 완료를 기다립니다.
4. `.env.example`을 복사해 `.env.local`을 만들고 필요한 값을 입력합니다.
5. `npm run dev`를 실행합니다.
6. 안내되는 3000번 포트 미리보기를 엽니다.

Codespace는 Node.js 22, GitHub CLI, ESLint, Prettier, Tailwind CSS, EditorConfig 확장을 사용합니다. 의존성은 lockfile 기준의 `npm ci`로 자동 설치됩니다.

## 비밀값

실제 키를 파일에 커밋하지 않습니다. 저장소의 **Settings → Secrets and variables → Codespaces**에서 비밀값을 등록하면 새 Codespace에 환경 변수로 주입할 수 있습니다. 공개 가능한 기본값만 `.env.example`에 기록합니다.

## 무료 사용량 관리

사용하지 않는 Codespace는 중지하고 오래된 Codespace는 삭제합니다. GitHub의 현재 무료 제공량과 과금 설정은 계정의 Billing 화면에서 확인합니다.

## 문제 해결

- 설치 실패: `node --version`이 22인지 확인합니다.
- 포트가 안 보임: **Ports** 탭에서 3000번 포트를 추가하고 Private로 유지합니다.
- 설정 변경 미반영: **Codespaces: Rebuild Container**를 실행합니다.
