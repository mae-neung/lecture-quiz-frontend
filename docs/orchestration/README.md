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

Agent 사이의 결과 전달은 `handoff-template.md`, Gate 판정은 `gates.md`를 사용한다.

작업 강도별 모델과 reasoning effort 선택은 [Model Routing](model-routing.md)을 따른다. Codex 역할별 기본 설정은 `.codex/agents/`에서 관리한다.

## 현재 지원 범위

- 프론트엔드 요구사항 분석
- React 화면과 컴포넌트 구현
- Router와 상태 흐름 설계
- lint/build/test 검증
- 코드 리뷰와 수정 반복

실제 배포, 외부 서비스 변경, 비밀 정보 사용은 사용자의 별도 승인과 해당 도구 권한이 필요하다.
