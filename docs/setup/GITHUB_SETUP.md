# GitHub 설정

## 권장 저장소 구조

세 서비스는 독립 저장소로 유지합니다.

| 서비스 | 권장 저장소 | 현재 로컬 폴더 | 상태 |
| --- | --- | --- | --- |
| 더채움넷 | `thechaeumnet` | `09_thechaeumnet` | Git 초기화됨, 원격 없음 |
| MoneyPick | `moneypick` | `07_moneypick` | `origin` 연결됨 |
| CalcLab | `calclab` 또는 기존 `calcmoeum` | `06_calcmoeum` | `origin` 연결됨 |

독립 저장소는 서비스별 이력, 이슈, Codespace, CI와 접근 권한을 분리합니다. 세 서비스가 공통 패키지 때문에 항상 함께 변경되는 상황이 반복될 때만 monorepo를 다시 검토합니다.

## 최초 업로드

GitHub에서 비어 있는 비공개 저장소를 만든 뒤 해당 프로젝트 폴더에서 실행합니다. GitHub 화면에서 README나 `.gitignore`를 미리 생성하지 마세요.

```bash
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

기존 기본 브랜치가 `master`라면 그대로 사용하거나, 팀이 합의한 뒤 `git branch -m master main`으로 변경하고 GitHub 기본 브랜치도 바꿉니다.

## 업로드 전 확인

```bash
git status --short --branch
git remote -v
git ls-files .env .env.local
git diff --check
npm ci
npm run lint
npm run build
```

환경 파일이 `git ls-files` 결과에 나오면 푸시하지 말고 추적 해제와 비밀값 교체를 먼저 수행합니다. GitHub에는 코드, 문서와 lockfile만 올리고 생성물, 로그, 개인 설정과 실제 비밀값은 올리지 않습니다.

## ChatGPT Work 연계

저장소를 GitHub에 푸시한 뒤 ChatGPT의 GitHub 연결에서 해당 저장소 접근을 허용합니다. 작업 요청에는 저장소, 기준 브랜치와 검증 명령을 명시합니다. 변경은 작업 브랜치와 Pull Request로 검토하고 GitHub 기본 브랜치를 단일 원본으로 취급합니다.
