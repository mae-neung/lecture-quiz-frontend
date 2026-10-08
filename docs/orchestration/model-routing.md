# Frontend Model Routing

공통 강도 판정과 fallback은 전역 `AGENTS.md`를 따른다. 이 문서는 프론트엔드 작업에 사용할 profile만 정한다.

| 작업 | Profile |
| --- | --- |
| 좁은 읽기 중심 조사 | `light_explorer` |
| 기존 패턴 안의 작고 되돌리기 쉬운 UI 수정 | `light_frontend` |
| 일반 요구사항·구현 계획 | `planner` |
| 새 화면 구조·사용자 흐름·복합 상태 설계 | `designer` |
| 일반 React 구현·테스트·제한된 리팩터링 | `frontend` |
| 복잡하거나 고위험인 계획·UI 설계·구현 | `planner_high`, `designer_high`, `frontend_high` |
| 일반 코드 변경 리뷰 | `reviewer` |
| 고위험·중요 리뷰 | `reviewer_high` |

의존성, 공용 API, 인증·보안, 데이터 손실, 광범위 리팩터링, 빌드·배포 설정에 영향이 있거나 요구사항이 상충하면 즉시 high 경로를 사용한다. `light_frontend`가 새 UI 흐름이나 복잡한 상태를 발견하면 구현을 넓히지 않고 `designer` 또는 `frontend` 이상으로 재판정한다.

모델, reasoning effort와 권한은 profile TOML에서 관리하며 이 문서에 복제하지 않는다.
