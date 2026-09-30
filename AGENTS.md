# Frontend Project Guidelines

전역 Agent 운영 규칙과 Custom Agent는 `~/.codex/AGENTS.md`, `~/.codex/agents/*.toml`에서 관리한다. 이 파일은 이 저장소에만 해당하는 기술·구조·검증 규칙을 정의한다.

## 프로젝트 기반

React 19, TypeScript 5, Vite 8, React Router, pnpm 10, Node.js 24.15.0 이상, Oxlint, DEVUP UI를 사용한다. 패키지 명령은 pnpm만 사용하며 npm 또는 yarn 잠금 파일을 만들지 않는다.

## 프로젝트 역할 경로

표준 경로는 Planner → Designer(새 화면 구조·사용자 흐름·복합 상태 설계 시) → Frontend Implementer → Verification → Reviewer다. 명확하고 되돌리기 쉬운 작은 UI 수정은 `light_frontend`, 읽기 중심 조사는 `light_explorer`를 사용할 수 있다. 인증·보안, 데이터 손실, 공용 API, 광범위 리팩터링, 빌드·배포 변경은 high 역할과 `reviewer_high`가 맡는다. 세부 Gate와 라우팅 기준은 `docs/orchestration/`을 따른다.

## 코드 규칙

- 컴포넌트 이름과 파일명은 PascalCase를 사용한다.
- Hook은 `use`로 시작하고 `src/hooks/` 또는 기능 폴더에 둔다.
- 페이지는 화면 조립을 담당하고 복잡한 비즈니스 로직을 직접 소유하지 않는다.
- 공용 UI는 `src/components/`, 기능 전용 코드는 `src/features/<feature>/`에 둔다.
- API 통신은 `src/services/` 또는 기능별 service 모듈로 분리한다.
- React에 의존하지 않는 함수는 `src/utils/`에 둔다.
- 상태 객체와 배열을 직접 변경하지 않는다.
- 기존 경로 별칭 `@/`와 현재 파일 구조를 우선 사용한다.
- 신규 애플리케이션 코드와 테스트는 `.ts` 또는 `.tsx`로 작성한다.
- `any`로 타입 오류를 우회하지 않고 명시적 타입이나 `unknown` narrowing을 우선한다.
- 신규 공용 UI와 스타일은 DEVUP UI와 `devup.json`의 토큰을 우선 사용한다.
- reset, 문서 레이아웃, 기존 화면의 점진 이전에는 일반 CSS를 사용할 수 있다.
- 요청하지 않은 라이브러리를 임의로 추가하지 않는다.
- 비밀 키나 인증 정보는 브라우저 코드와 Agent 문서에 기록하지 않는다.

## 검증

```bash
pnpm verify
```

개발 중에는 변경 범위에 맞춰 `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build` 중 필요한 항목을 실행한다. PR 생성·업로드 또는 최종 반영 요청 시 최종 코드에서 `pnpm verify`를 실행한다. UI·사용자 흐름 변경은 `docs/orchestration/ui-smoke-checklist.md`에 따라 수동 브라우저 점검을 추가한다. 실행하지 않은 검증은 성공으로 보고하지 않는다.
