# Frontend Template

React, TypeScript, Vite, React Router 기반의 재사용 가능한 프론트엔드 시작 템플릿입니다.

이 저장소의 오케스트레이션은 웹 애플리케이션 기능이 아닙니다. Codex나 Claude 같은 AI Agent가 기획·설계·구현·검토 역할을 나눠 **실제 저장소 코드를 작업하기 위한 규칙**입니다.

## 시작하기

Node.js 24.15.0 이상과 pnpm 10을 사용합니다.

```bash
node --version
pnpm install
pnpm dev
```

개발 서버 주소는 일반적으로 `http://localhost:5173`입니다.

## 명령어

| 명령어 | 용도 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm lint` | 코드 품질 검사 |
| `pnpm test` | 회귀 테스트 단발 실행 |
| `pnpm test:watch` | 변경을 감시하며 테스트 실행 |
| `pnpm typecheck` | strict TypeScript 타입 검사 |
| `pnpm build` | 타입 검사 후 배포용 파일 생성 |
| `pnpm verify` | lint, test, 타입 검사와 배포 빌드 전체 실행 |
| `pnpm preview` | 배포용 빌드 미리 보기 |

## AI 오케스트레이션 사용법

오케스트레이션을 사용하려면 AI에게 역할 분담을 명시해서 요청합니다.

```text
로그인 페이지 작업을 Planner, Designer, Frontend, Reviewer로 나눠서 오케스트레이션해줘.
계획을 먼저 보여주고 승인받은 뒤 구현해줘.
```

그러면 지원되는 환경에서 다음 흐름으로 실제 작업을 진행합니다.

```text
Planner
→ Plan Gate
→ Designer (UI 작업일 때)
→ Frontend Implementer
→ lint/test/build Gate
→ Reviewer
→ 완료 또는 수정
```

작은 작업은 필요한 역할만 지정할 수 있습니다.

```text
이 버튼 오류를 Frontend와 Reviewer 역할로 나눠 수정해줘.
```

관련 문서:

- [AGENTS.md](AGENTS.md): 전체 저장소의 공통 규칙
- [CLAUDE.md](CLAUDE.md): Claude용 진입 안내
- [오케스트레이션 사용법](docs/orchestration/README.md)
- [Gate 기준](docs/orchestration/gates.md)
- [Agent Handoff 형식](docs/orchestration/handoff-template.md)
- [모델 라우팅 기준](docs/orchestration/model-routing.md)
- 개인 Custom Agent는 `~/.codex/agents/`에서 공통 관리

AI 도구마다 자동으로 읽는 안내 파일은 다릅니다. Codex 계열은 `AGENTS.md`, Claude Code는 `CLAUDE.md`를 진입점으로 사용하도록 구성했습니다. 그 외 도구에서는 루트 `AGENTS.md`를 먼저 읽도록 요청하세요.

## 기본 라우트

| 주소 | 화면 |
| --- | --- |
| `/` | 템플릿 시작 화면 |
| `/about` | 폴더 구조 안내 |
| 그 외 | 404 화면 |

## 폴더 구조

```text
src/
├── components/  # 여러 화면에서 재사용하는 UI
├── features/    # 기능 단위의 화면·상태·로직
├── hooks/       # 재사용하는 React Hook
├── layouts/     # 여러 페이지가 공유하는 화면 구조
├── pages/       # URL에 연결되는 페이지
├── router/      # React Router 설정
├── services/    # API 등 외부 시스템 통신
├── utils/       # React에 의존하지 않는 공통 함수
├── App.tsx
└── main.tsx
```

빈 폴더의 `.gitkeep` 파일은 Git이 기본 구조를 유지하기 위한 자리표시자입니다. 실제 파일이 추가되면 삭제해도 됩니다.

## 코드 작성 기준

- `@/`는 `src/`를 가리키는 경로 별칭입니다.
- 공용 UI는 `components/`, 기능 전용 코드는 `features/<feature>/`에 둡니다.
- 신규 공용 UI는 DEVUP UI와 루트 `devup.json`의 디자인 토큰을 우선 사용합니다.
- 신규 애플리케이션 코드와 테스트는 `.ts` 또는 `.tsx`로 작성합니다.
- `any`로 타입 오류를 우회하지 않고 명시적 타입이나 `unknown` narrowing을 우선합니다.
- 페이지는 화면 조립에 집중하고 API 통신과 복잡한 로직은 분리합니다.
- 패키지는 pnpm으로만 관리합니다.
- 작업 중에는 변경 위험과 영향 범위에 맞는 검증을 수행하고, PR 생성·업로드 전에는 최종 변경본으로 `pnpm verify`를 실행합니다. 이 명령은 lint, test와 타입 검사를 포함한 build를 순서대로 수행합니다.

## 지속적 통합

GitHub Actions는 pull request와 `dev`, `prod` 브랜치 push에서 의존성을 frozen lockfile로 설치한 뒤 `pnpm verify`를 실행합니다.

## 환경 변수

프로젝트별 설정은 `.env.example`을 복사해 `.env`에 작성합니다.

```powershell
Copy-Item .env.example .env
```

브라우저에서 읽는 환경 변수는 `VITE_`로 시작해야 합니다. API 비밀번호나 비밀 키는 프론트엔드 환경 변수에 넣지 않습니다.
