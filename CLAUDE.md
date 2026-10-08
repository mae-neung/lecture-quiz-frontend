# Claude Repository Instructions

이 저장소에서 작업하기 전에 활성화된 전역 Agent 지침을 따르고 루트 `AGENTS.md`를 읽어 프로젝트별 기술·구조·검증 규칙을 적용한다. 루트 `AGENTS.md`는 이 저장소의 프로젝트 규칙에 대한 단일 원본이다.

사용자가 Agent 분할 또는 오케스트레이션을 요청하면 다음 프로젝트 문서를 함께 읽고 활성화된 전역 역할 지침과 Agent profile을 적용한다.

- `docs/orchestration/README.md`
- `docs/orchestration/gates.md`

역할별 결과는 활성화된 전역 Agent 지침의 Handoff 규칙에 따라 다음 역할에 전달한다. 프로젝트별 profile 선택 정책은 `docs/orchestration/model-routing.md`를 단일 원본으로 사용하며, 비밀 키나 계정별 모델 설정은 저장소에 기록하지 않는다.
