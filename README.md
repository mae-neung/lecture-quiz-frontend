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

> 현재 로그인과 자료 등록은 화면 체험을 위한 클라이언트 데모입니다. 실제 사용자 인증, API 통신, 파일 전송, 데이터 저장, 강의 분석과 문제 생성은 아직 제공하지 않습니다.

## 실행 방법

Node.js 24.15.0 이상과 pnpm 10이 필요합니다.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

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
