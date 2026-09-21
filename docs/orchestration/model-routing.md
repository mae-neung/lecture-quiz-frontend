# Model Routing

역할은 책임을, 작업 강도는 필요한 추론 수준을 뜻한다. Coordinator는 Agent를 시작하기 전에 작업 강도를 판정하고 현재 실행 환경에서 사용할 수 있는 모델을 확인한다.

## 강도별 기본 매핑

| 강도 | 기준 | 모델 | Reasoning effort |
| --- | --- | --- | --- |
| 경량 | 읽기 중심 탐색, 문서 정리, 오탈자, 명확한 단일 파일 작업 | `gpt-5.6-luna` | `low` 또는 `medium` |
| 표준 분석 | UI 설계, 코드 탐색, 여러 파일의 읽기 중심 분석 | `gpt-5.6-terra` | `medium` |
| 표준 구현 | 일반적인 React 구현, 테스트 작성, 제한된 리팩터링 | `gpt-5.6-sol` | `medium` |
| 고강도 | 아키텍처, 광범위 마이그레이션, 복잡한 장애, 보안·최종 중요 리뷰 | `gpt-6-astra` | `high` 또는 `xhigh` |

프로젝트의 역할별 기본값은 `.codex/agents/*.toml`이 실행 설정의 단일 원본이다. 역할 문서에는 모델 이름을 중복 기록하지 않는다. Custom Agent TOML에 지정된 `model`과 `model_reasoning_effort`는 Agent 생성 시 전달한 override보다 우선하므로, 기존 역할 profile을 다른 강도로 생성한다고 해서 모델이 바뀌지 않는다.

## 판정과 승격

다음 중 하나면 한 단계 높인다.

- 변경 범위가 여러 기능 또는 공용 기반 코드로 확장된다.
- 데이터 손실, 인증, 보안, 배포 차단 가능성이 있다.
- 같은 원인의 실패가 재현된다.
- Reviewer가 기능 또는 테스트의 차단 문제를 발견한다.
- 상충하는 요구사항을 해석해야 한다.

명확하고 반복 가능한 작업은 한 단계 낮출 수 있지만 Reviewer와 보안 검토는 위험도보다 낮추지 않는다.

## 실행 절차

1. Coordinator가 역할과 작업 강도를 각각 판정한다.
2. 역할의 기본 강도와 일치하면 `.codex/agents/<role>.toml` profile을 사용한다.
3. 더 높은 강도가 필요하면 해당 역할 지침을 프롬프트에 포함한 generic worker를 명시 모델과 reasoning effort로 생성하거나, 같은 역할을 위한 별도 고강도 profile이 존재하면 그것을 선택한다.
4. Custom Agent TOML의 모델을 spawn override로 바꾸려고 시도하지 않는다.
5. 실제 profile, 모델, reasoning effort, 승격 이유를 Handoff에 기록한다.

## Fallback

- 지정 모델을 현재 환경에서 사용할 수 없으면 같은 강도의 사용 가능한 모델을 선택한다.
- 같은 강도의 대체 모델이 없으면 한 단계 높은 모델을 사용한다.
- Coordinator는 선택한 강도, 실제 모델, reasoning effort와 fallback 이유를 Handoff에 기록한다.
- 모델을 바꾸기 위해 비밀 키나 계정별 설정을 저장소에 기록하지 않는다.

## 역할 기본값

- Planner: 표준 구현 수준에서 시작하고 복잡한 구조 결정은 고강도로 승격한다.
- Designer: 표준 분석을 사용한다.
- Frontend: 표준 구현을 사용한다.
- Reviewer: 고강도를 사용한다.
