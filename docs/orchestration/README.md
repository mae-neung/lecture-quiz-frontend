# AI 개발 오케스트레이션 사용법

이 저장소의 오케스트레이션은 여러 AI Agent가 실제 코드를 역할별로 작업하도록 만드는 협업 규칙이다. 별도의 대시보드나 백엔드를 실행하지 않는다.

## 요청하는 방법

일반 작업은 평소처럼 요청할 수 있다.

```text
로그인 페이지를 만들어줘.
```

역할을 나눈 실제 오케스트레이션을 원하면 요청에 이를 명시한다.

```text
로그인 페이지 작업을 Planner, Designer, Frontend, Reviewer로 나눠서 오케스트레이션해줘.
계획을 먼저 보여주고 승인받은 뒤 구현해줘.
```

작은 수정에는 모든 역할이 필요하지 않을 수 있다.

```text
이 버튼 버그를 Frontend와 Reviewer 역할로 나눠 수정해줘.
```

명확하고 되돌리기 쉬운 단일 파일·문서 수정은 경량 경로를 사용할 수 있다. Coordinator가 짧은 계획과 검증 방법을 기록하고 Planner·Designer를 생략한다. 단독 작업이면 별도 Agent 없이 처리하고 코드 변경 후 Review Gate를 자체 점검한다. 역할 분담을 요청했다면 `light_frontend`와 독립 `reviewer`를 사용한다. 의존성, 공용 API, UI 흐름, 빌드 설정, 보안·배포 영향이 있으면 표준 경로로 전환한다. 사용자가 지정한 역할은 생략하지 않는다.

## 기본 역할

| 역할 | 하는 일 | 주요 산출물 |
| --- | --- | --- |
| Coordinator | 범위 조정, Agent 배정, Gate 판단 | 진행 상황과 최종 결과 |
| Planner | 요구사항과 작업 순서 분석 | 구현 계획, 완료 조건 |
| Designer | 화면 구조와 사용자 흐름 설계 | UI 구조, 상태 목록 |
| Frontend | 실제 React 코드 구현 | 변경 코드, 검증 결과 |
| Reviewer | 요구사항·품질·위험 검토 | 문제 목록, 통과 여부 |

Coordinator는 역할 문서의 내용을 직접 실행하는 척하지 않는다. Agent 기능이 제공되는 환경에서는 역할별 Agent에게 실제로 위임하고 결과를 수집한다.

## 전체 흐름

```text
요청
→ Planner
→ Plan Gate
→ Designer (선택)
→ Frontend
→ Verification Gate
→ Reviewer
→ Review Gate
→ 완료 또는 수정 반복
```

Agent 사이의 결과 전달은 `handoff-template.md`, Gate 판정은 `gates.md`를 사용한다. Handoff에는 브랜치·HEAD·미커밋 변경과 검증 결과를 기록한다. 승인·권한·외부 상태로 진행이 멈추면 `needs-decision`으로 Coordinator에게 넘긴다.

UI·사용자 흐름을 바꾼 작업은 [UI 수동 점검표](ui-smoke-checklist.md)로 주요 라우트, 모바일 폭, 키보드 조작을 확인한다. 자동 E2E 도구는 기능이 늘어 필요해질 때 도입한다.

작업 강도 판정과 실제 Agent profile 선택은 [Model Routing](model-routing.md)을 따른다. Coordinator가 Agent 시작 전 `역할 → 강도 → profile`을 고르고, 시작 후 실제 모델·reasoning effort를 확인한다. Codex 실행 설정은 `.codex/agents/`에서 관리한다. 단일 Agent 작업은 강도만 판정하며, 라우팅 문서가 실행 중인 모델을 자동 변경하지는 않는다.

예를 들어 역할 분담을 요청한 한 문서의 명확한 수정은 `light_frontend`, 일반 React 구현은 `frontend`, 보안 위험이 있는 구현은 `frontend_high`가 담당한다. 역할 분담을 요청한 코드 변경 후에는 강도와 관계없이 `reviewer`가 검토한다. 단독 작업도 Review Gate는 통과해야 하지만 독립 Reviewer가 검토한 것으로 보고하지 않는다. 작업 중 범위나 위험이 커지면 다음 Agent 실행 전에 강도를 다시 판정한다.

## 현재 지원 범위

- 프론트엔드 요구사항 분석
- React 화면과 컴포넌트 구현
- Router와 상태 흐름 설계
- lint/test/typecheck/build 검증과 UI 변경 시 브라우저 점검
- 코드 리뷰와 수정 반복

실제 배포, 외부 서비스 변경, 비밀 정보 사용은 사용자의 별도 승인과 해당 도구 권한이 필요하다.
