# 아맞다시험

강의 영상과 강의교안을 등록해 시험 대비 문제로 바꾸는 대학생용 학습 서비스의 프론트엔드 데모입니다.

## 현재 제공하는 기능

- 데모 계정 로그인
- 로그인 사용자만 접근할 수 있는 자료 등록 화면
- 강의 영상(`mp4`, `webm`, `mov`)과 강의교안(`pdf`, `ppt`, `pptx`) 입력 검증
- 선택한 파일의 이름, 유형, 크기를 보여주는 더미 등록 결과
- 데스크톱과 모바일 반응형 화면

체험 계정은 다음과 같습니다.

```text
아이디: test1234
비밀번호: test1234
```

> 기본값은 클라이언트 데모입니다. 환경 변수 `VITE_API_BASE_URL`을 설정하면 개발용 Amadda API 흐름을 사용할 수 있습니다. 백엔드의 인증·권한 검증이 미완성이므로 민감한 계정과 자료를 사용하지 마세요.

## 실행 방법

Node.js 24.15.0 이상과 pnpm 10이 필요합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 개발용 API 연결

`.env.local`에 다음 값을 설정하고 개발 서버를 다시 시작하세요.

```text
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_API_STORAGE_NAMESPACE=local-amadda
```

Vite는 `/api` 접두어를 제거해 백엔드에 전달합니다. 백엔드를 먼저 실행해야 합니다. API 모드에서는 이메일/비밀번호로 로그인하고 PDF·MP3·MP4 한 파일을 올립니다. 과목 생성, 이름 설정, 업로드, 요약, 첫 위키 문서 조회, 객관식 5문제 생성 및 조회 순서로 처리됩니다. 이름 설정·위키 조회·문제 조회·로컬 저장 단계에서 실패하면 이어서 시도할 수 있습니다. 과목 생성·업로드·요약·문제 생성 단계에서 응답이 유실되면 서버 처리 여부를 알 수 없어 자동 재시도가 중단됩니다. 이때 백엔드 상태를 확인한 뒤 페이지를 새로고침하세요. 새로고침하면 진행 체크포인트는 초기화됩니다.

문제 세트는 API 환경과 서버의 사용자 ID별로 이 브라우저의 localStorage에 분리 저장됩니다. API 로그인 세션도 환경별로 분리됩니다. 저장소 환경값은 `VITE_API_STORAGE_NAMESPACE`, 없으면 `VITE_API_PROXY_TARGET`, 그것도 없으면 `VITE_API_BASE_URL`입니다. 같은 `/api` 경로에서 백엔드를 바꾸는 경우 `VITE_API_STORAGE_NAMESPACE`를 환경마다 다르게 설정하세요. 원본 파일은 서버에 전송되며 브라우저에는 저장되지 않습니다. 서버 문제에는 해설이 없어 중립 안내 문구가 표시됩니다. 브라우저에 저장한 세트의 이름 변경·삭제는 로컬 세트에만 적용됩니다.

`VITE_API_BASE_URL`이 비어 있으면 `test1234` 데모 흐름이 그대로 동작합니다. 공개 GitHub Pages 배포도 기본적으로 이 데모 설정을 사용합니다.

## 검증

```bash
pnpm verify
```

이 명령은 lint, 테스트, TypeScript 검사와 Vite 프로덕션 빌드를 실행합니다.

## 기술 스택

- React 19
- TypeScript 5
- Vite 8
- React Router 7
- DEVUP UI
- Vitest와 Testing Library

## 배포

공개 사이트: [https://mae-neung.github.io/lecture-quiz-frontend/](https://mae-neung.github.io/lecture-quiz-frontend/)

`main` 브랜치에 변경이 올라오면 GitHub Actions가 전체 검증과 빌드를 실행한 뒤 GitHub Pages에 배포합니다. GitHub Pages에서 화면을 직접 새로고침해도 동작하도록 해시 라우팅을 사용합니다.

## 지속적 통합

GitHub Actions는 pull request와 `main`, `codex/**` 브랜치 push에서 의존성을 frozen lockfile로 설치한 뒤 `pnpm verify`를 실행합니다. 이 저장소는 배포 기준 브랜치가 `main`이고 별도 `dev` 브랜치가 없으므로, 템플릿의 `codex/** → dev` 자동 승격 워크플로는 적용하지 않습니다. 기능 브랜치는 검증 후 pull request로 `main`에 반영합니다.
