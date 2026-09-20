# Orchestra Agent Guidelines

이 저장소는 React와 Vite 기반의 프론트엔드 작업 오케스트레이션 대시보드입니다.

## 기본 작업 원칙

- 작업을 시작하기 전에 목표, 입력, 완료 기준을 확인한다.
- 변경 전에는 필요한 파일과 기존 구조를 읽는다.
- 변경 후에는 가능한 범위에서 `pnpm lint`와 `pnpm build`를 실행한다.
- 완료 보고에는 변경 파일, 수행 내용, 검증 결과를 포함한다.
- 실제 API 키, 비밀 값, 모델 설정은 소스 코드나 Agent 문서에 기록하지 않는다.

## Agent 역할 문서

각 작업 단계는 `agents/` 아래의 역할 문서를 따른다.

| Agent ID | 역할 문서 |
| --- | --- |
| `agent-planning` | `agents/planner.md` |
| `agent-design` | `agents/designer.md` |
| `agent-frontend` | `agents/frontend.md` |
| `agent-review` | `agents/reviewer.md` |
| `agent-support` | `agents/support.md` |

## 오류 처리와 재시도

- 오류가 발생하면 Agent, 작업, 오류 요약, 마지막 오류를 Log에 기록한다.
- 최초 시도 후 같은 작업은 최대 2회만 재시도한다. 총 시도 횟수는 최대 3회다.
- 재시도 전에는 원인을 확인하고, 같은 입력을 무작정 반복하지 않는다.
- 2회 재시도 후에도 실패하면 즉시 중단한다.
- 실패한 Step과 Workflow는 `failed` 상태로 기록한다.
- 실패 후에는 다음 Step을 자동으로 시작하지 않는다.
- 더 이상 자동 시도하지 않고 아래 형식의 오류 결과를 반환한다.

```text
상태: failed
Agent: <agent id 또는 이름>
작업: <step 제목>
시도 횟수: 3회
오류 요약: <짧은 설명>
마지막 오류: <원문 또는 안전하게 정리한 메시지>
권장 다음 조치: <사람이 확인할 내용>
```
