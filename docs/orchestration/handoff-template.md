# Agent Handoff Template

역할 사이의 결과를 넘길 때 아래 형식을 사용한다.

```markdown
## Handoff

- From: <현재 역할>
- To: <다음 역할>
- Status: ready | needs-decision | failed
- Workload tier: light | standard-analysis | standard-implementation | high
- Model: <실제 사용 모델>
- Reasoning effort: low | medium | high | xhigh | max | ultra
- Routing note: <선택·승격·fallback 근거>
- Branch / HEAD: <브랜치와 커밋 SHA; 코드 변경 전이면 기준 SHA>
- Worktree / owner: <clean 또는 dirty와 변경 파일·담당 Agent>

### 목표

<이번 작업이 달성해야 할 결과>

### 확인한 내용

- <읽은 파일, 실행한 명령, 확인한 근거>

### 수행 내용 또는 제안

- <현재 역할이 완료한 작업>

### 산출물

- <계획, 설계, 변경 파일, 검토 결과>

### 검증 근거

| 명령 또는 점검 | 결과 | 실행 환경·근거 |
| --- | --- | --- |
| <예: pnpm test 또는 UI smoke> | pass / fail / not-run | <Node 버전, 테스트 수, 로그·링크 또는 미실행 이유> |

### 미확정 사항과 위험

- <없으면 없음>

### 다음 작업

- <다음 역할이 수행할 구체적인 작업>
- <needs-decision이면 막힌 명령·시도 횟수·마지막 상태·승인/외부 조치의 담당자>

### 완료 조건

- <통과해야 하는 조건>
```

Handoff에는 비밀 키, 비밀번호, 인증 토큰, 불필요한 개인정보를 포함하지 않는다.
코드 변경이 없으면 변경 파일과 검증 항목에 `해당 없음`을 적는다. 변경이 있으면 HEAD만으로 미커밋 작업을 식별할 수 없으므로 작업 트리 상태와 변경 파일을 함께 적는다. 다음 Agent는 실제 HEAD·작업 트리와 Handoff가 다르면 근거를 다시 확인한다.
승인 대기, 권한 부족, 응답 중단 또는 외부 상태 대기는 실패로 추정하지 않고 `needs-decision`으로 반환한다. 같은 입력으로 대기나 재시도를 반복하지 않는다.
