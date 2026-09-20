# Frontend Template

React와 Vite 기반의 재사용 가능한 프론트엔드 시작 템플릿입니다.

이 프로젝트는 pnpm을 패키지 관리자로 사용합니다. 설치는 `pnpm install`로 진행합니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

개발 서버 주소는 터미널에 표시됩니다. 일반적으로 `http://localhost:5173`입니다.

## 명령어

| 명령어 | 용도 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 배포용 파일 생성 |
| `pnpm preview` | 배포용 빌드를 로컬에서 미리 보기 |
| `pnpm lint` | 코드 품질 검사 |

## 폴더 구조

```text
src/
├── components/  # 여러 화면에서 재사용하는 UI 컴포넌트 (Button 예시 포함)
├── features/    # 로그인, 상품 목록처럼 기능별 코드 묶음
├── hooks/       # 재사용하는 React Hook
├── pages/       # 페이지 단위 화면
├── router/      # URL과 페이지를 연결하는 React Router 설정
├── layouts/     # 여러 페이지가 함께 쓰는 화면 뼈대
├── services/    # API 호출 등 외부 시스템 통신
├── utils/       # 날짜·문자열 처리 같은 순수 유틸리티
├── App.jsx      # 현재 최상위 화면 컴포넌트
└── main.jsx     # React 앱의 진입점
```

빈 폴더의 `.gitkeep` 파일은 Git이 폴더 구조를 유지하도록 하기 위한 자리표시자입니다. 해당 폴더에 실제 파일을 추가하면 삭제해도 됩니다.

## 코드 작성 방식

- `@/`는 `src/`를 가리키는 경로 별칭입니다. 예: `@/components/Button/Button`
- 한 컴포넌트의 JSX와 CSS는 같은 폴더에 둡니다.
- 공용 컴포넌트는 `components/`, 특정 기능에서만 쓰는 컴포넌트는 해당 `features/` 내부에 둡니다.

## 현재 라우트

| 주소 | 화면 |
| --- | --- |
| `/` | 대시보드 |
| `/workflows` | 워크플로우 목록 |
| `/workflows/:workflowId` | 워크플로우 단계 상세 |
| `/runs` | 실행 기록 |
| `/settings` | 설정 |

## 오케스트레이션 모델

이 템플릿은 다음 세 단위를 구분합니다.

| 단위 | 의미 | 예시 |
| --- | --- | --- |
| Workflow | 여러 단계가 이어진 하나의 작업 흐름 | 랜딩 페이지 제작 |
| Step | Workflow 안의 개별 작업 | 요구사항 분석, 화면 구현 |
| Run | Workflow를 한 번 실행한 이력 | `run-2026-09-20-003` |

상태는 `waiting`(대기), `running`(진행 중), `completed`(완료), `failed`(실패) 네 가지입니다. 상태의 표시 문구와 색상은 `src/features/workflows/`에서 한곳에 관리합니다.

## 목업 데이터

백엔드 연결 전에는 [mockWorkflows.js](src/features/workflows/data/mockWorkflows.js)의 Agent, Workflow, Step, Run, Log 목업 데이터를 사용합니다. 실제 API를 연결할 때는 화면 컴포넌트가 아니라 `services/`에 데이터 요청 코드를 추가하고, 동일한 데이터 형태를 반환하도록 바꾸는 것을 권장합니다.

현재 화면은 `WorkflowProvider`가 데이터를 공유하고 브라우저의 `localStorage`에 저장합니다. 그래서 다음 단계에서 상태를 변경하면 새로고침 뒤에도 결과가 유지됩니다.

상세 화면의 실행 제어는 학습용 시뮬레이션입니다. 실행 시작, 단계 완료, 실패 처리는 `WorkflowProvider`의 행동 함수가 담당하며, 이후 실제 API 호출로 교체할 부분입니다.

## 환경 변수

프로젝트별 설정은 `.env.example`을 복사해 `.env`에 작성합니다. `.env`는 Git에 포함되지 않습니다.

```bash
Copy-Item .env.example .env
```

Vite에서 브라우저 코드로 읽을 값은 반드시 `VITE_`로 시작해야 합니다. 이 값은 사용자에게 노출될 수 있으므로 API 비밀번호나 비밀 키는 절대 넣지 않습니다.
