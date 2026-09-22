# Model Routing

역할은 책임을, 작업 강도는 필요한 추론 수준을 뜻한다. 이 규칙은 Coordinator가 Agent를 **시작하기 전에** 적용하는 실행 절차다. 문서나 TOML만으로 실행 중인 Agent의 모델이 자동 변경되지는 않는다. 사용자가 Agent 분할을 요청하지 않은 단일 Agent 작업에서는 불필요한 Agent를 생성하지 않고 강도 판정만 기록한다.

## 1. 입력과 강도 판정

Coordinator는 목표·변경 범위·제외 범위·완료 조건·검증 방법을 확인한 뒤 역할과 강도를 별도로 정한다. 여러 조건이 겹치면 가장 높은 위험 조건을 우선한다. 단순한 파일 개수만으로 강도를 정하지 않는다.

| 강도 | 적용 조건 | 기본 모델 / reasoning effort |
| --- | --- | --- |
| 경량 탐색 | 명확하고 좁은 읽기 중심 조사 | `gpt-5.6-luna` / `low` |
| 경량 수정 | 명확하고 되돌리기 쉬운 단일 파일 수정. 의존성·공용 API·UI 흐름·빌드 설정·보안·배포 영향이 없어야 함 | `gpt-5.6-luna` / `medium` |
| 표준 분석 | UI 설계, 여러 파일의 읽기 중심 분석, 일반적인 구현 계획 | `gpt-5.6-terra` / `medium` (Designer 기준) |
| 표준 구현 | 일반적인 React 구현, 테스트 작성, 제한된 리팩터링 | `gpt-5.6-sol` / `medium` |
| 고강도 | 아키텍처, 광범위 마이그레이션, 복잡한 장애, 인증·보안·데이터 손실·배포 위험, 상충하는 요구사항, 중요 리뷰 | `gpt-6-astra` / `high` |

Planner의 표준 기본값은 계획 수립을 위해 `gpt-5.6-sol` / `high`이며 Reviewer는 위험도와 관계없이 `gpt-6-astra` / `high`를 유지한다. 이 역할별 예외를 경량 작업이라는 이유로 낮추지 않는다.

## 2. 실제 Agent 선택

| 역할과 강도 | 실행할 Agent profile | 권한 |
| --- | --- | --- |
| 경량 읽기 중심 탐색 | `light_explorer` | read-only |
| 경량 단일 파일 수정 | `light_frontend` | workspace-write |
| 표준 계획 | `planner` | read-only |
| 표준 UI 설계 | `designer` | read-only |
| 표준 구현 | `frontend` | workspace-write |
| 고강도 계획 | `planner_high` | read-only |
| 고강도 UI 설계 | `designer_high` | read-only |
| 고강도 구현 | `frontend_high` | workspace-write |
| 코드 변경 후 리뷰 및 중요 리뷰 | `reviewer` | read-only |

역할별 실행 설정의 단일 원본은 `.codex/agents/*.toml`이다. 탐색처럼 표에 없는 표준 읽기 작업은 내장 `explorer`에 `gpt-5.6-terra` / `medium`을 명시한다. 역할을 알 수 없는 임의 Agent를 기본값만 믿고 시작하지 않는다. Agent 도구가 없으면 같은 판정·계획·검증·리뷰 단계를 순차 수행하고 실제 모델 전환이 없었다고 기록한다.

Codex Custom Agent TOML에 설정된 `model`과 `model_reasoning_effort`가 생성 요청의 override보다 우선한다. 따라서 기존 profile에 다른 모델을 넘겨 강도를 바꾸려 하지 말고, 위 profile 자체를 선택한다. 일반 Agent에 명시 모델을 사용하는 예외가 필요하면 역할 지침·권한·선택 근거를 Handoff에 적고, 읽기 전용 역할에 쓰기 권한을 주지 않는다.

## 3. 실행 전 확인과 재판정

1. Coordinator가 `역할 → 강도 → profile → 예상 모델·reasoning effort`를 기록하고, 현재 환경에서 profile과 모델을 사용할 수 있는지 확인한다.
2. 선택한 Agent에게 목표, 허용 파일, 제외 범위, 완료 조건, 검증 방법과 선행 Handoff를 전달한다.
3. Agent가 실제로 시작된 뒤 선택한 profile·모델·reasoning effort를 확인한다. 예상과 다르면 구현 전에 멈춰 경로를 다시 고른다.
4. 범위가 여러 기능·공용 기반 코드로 커지거나, 같은 원인의 실패가 재현되거나, Reviewer가 차단 문제를 찾으면 **다음 시도 또는 다음 Agent 시작 전에** 재판정한다. 읽기 작업은 경량→표준 분석, 수정 작업은 경량→표준 구현, 표준 작업은 고강도로 승격한다. 인증·보안·데이터 손실·배포 위험은 중간 단계를 거치지 않고 즉시 고강도로 판정한다.
5. 승격 후에는 원인과 변경된 범위를 새 Agent에게 전달한다. 이전 검증 결과를 새 변경본의 통과 근거로 재사용하지 않는다. 작업 중 조용히 강도를 낮추지 않는다.

## 4. Fallback과 기록

- 지정 모델·profile을 사용할 수 없으면 같은 강도의 사용 가능한 대안을 확인한다. 없으면 한 단계 높은 모델을 명시적으로 선택한다. 고강도 모델도 사용할 수 없다면 낮은 모델로 조용히 대체하지 않고 `needs-decision`으로 중단한다.
- 실행 환경에 따라 모델 가용성이 달라질 수 있다. 가용성을 확인하지 못했으면 예상 모델을 실제 사용 모델로 보고하지 않는다.
- Handoff에는 최초 강도, 최종 강도, 선택한 profile, 실제 모델·reasoning effort, 판정·승격·fallback 근거를 남긴다. 비밀 키나 계정별 설정은 저장소에 기록하지 않는다.

## 판정 예시

| 요청 | 판정과 실행 경로 |
| --- | --- |
| 한 문서의 명확한 오탈자 수정 | 경량 수정 → `light_frontend`; 코드가 바뀌었다면 `reviewer` 검토 |
| 여러 화면의 사용자 흐름 설계 | 표준 분석 → `designer`; 상태·접근성 위험이 복잡하면 `designer_high`로 승격 |
| 일반 React 기능과 테스트 추가 | 표준 계획 `planner` → 표준 구현 `frontend` → `reviewer` |
| 인증 흐름 또는 데이터 손실 위험을 가진 변경 | 즉시 고강도 `planner_high` → `frontend_high` → `reviewer` |

이 표는 Agent 사용이 요청된 경우의 경로 예시다. 실제 Agent 분할 여부와 Gate는 `AGENTS.md`와 `gates.md`를 따른다.
