# Frontend Project Guidelines

공통 운영·검증·Handoff 규칙과 Custom Agent 설정은 전역에서 관리한다. 이 파일에는 이 저장소의 기술·구조·실행 규칙만 둔다.

## 프로젝트 기반

React 19, TypeScript 5, Vite 8, React Router, pnpm 10, Node.js 24.15.0 이상, Oxlint, DEVUP UI를 사용한다. 패키지 명령은 pnpm만 사용하며 npm 또는 yarn 잠금 파일을 만들지 않는다.

## 프로젝트 역할 경로

프론트엔드 구현은 `light_frontend`, `frontend`, `frontend_high` 중 위험과 영향 범위에 맞는 profile을 사용한다. 새 화면 구조·사용자 흐름·복합 상태는 Designer를 거치며, 세부 선택 기준은 `docs/orchestration/model-routing.md`를 따른다.

새 디자인의 순서는 `대표 페이지 1개로 3안 비교 → 사용자 방향 선택 → 선택안의 Design Foundation 명세·승인 → 선택된 대표 페이지 확정 → 나머지 페이지 후속 작업`으로 고정한다. 3안 비교와 foundation 승인 단계에서는 다른 페이지를 작업하지 않는다.

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
- 신규 애플리케이션 스타일은 CSS-in-JS를 원칙으로 작성한다. DEVUP UI가 제공하는 스타일 방식과 `devup.json`의 토큰을 우선 사용하며, 동일 목적의 별도 스타일 라이브러리를 임의로 추가하지 않는다.
- 새 시각 디자인이나 design foundation 변경은 사용자에게 승인받은 컬러·타이포그래피·기초 UI 토큰만 구현한다.
- `devup.json`의 컬러는 용도 기반 semantic token으로 정의하고 라이트·다크 모드에서 동일한 토큰 집합을 1:1로 제공한다. 컴포넌트에 임의의 색상 값을 직접 추가하지 않는다.
- 타이포그래피는 승인된 역할, font family와 fallback, 크기, 굵기, line-height를 사용한다.
- 전역 reset, 문서 중심 레이아웃, 외부 스타일 연동, 기존 CSS 화면의 점진 이전에는 일반 CSS를 사용할 수 있다. 이 원칙만을 이유로 요청 범위 밖의 기존 CSS를 일괄 변환하지 않는다.

## 검증

```bash
pnpm verify
```

개발 중에는 변경 범위에 맞춰 `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build` 중 필요한 항목을 실행한다. 전체 PR Gate는 `pnpm verify`이며, UI·사용자 흐름 변경은 `docs/orchestration/ui-smoke-checklist.md`의 수동 점검을 추가한다.
