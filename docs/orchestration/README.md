# 프론트엔드 오케스트레이션

이 디렉터리는 프론트엔드에만 필요한 profile 선택, UI Gate와 브라우저 점검을 정의한다.

## 기본 흐름

```text
Planner
→ 대표 페이지 1개로 3가지 방향 시안·프리뷰
→ 사용자 방향 선택
→ 선택안의 컬러·타이포그래피·기초 토큰 명세
→ 사용자 Design Foundation 승인
→ 선택된 대표 페이지 확정·검증
→ Reviewer
→ 나머지 페이지는 별도 후속 작업
```

3안은 동일한 대표 페이지 하나만 비교하며 다른 페이지를 미리 만들지 않는다. 정확한 팔레트와 타이포그래피는 방향이 선택된 뒤 해당 안에 대해서만 명세한다. 기존 패턴을 따르는 작은 UI 변경은 `light_frontend`를 사용할 수 있다.

## 프로젝트 문서

- [Model Routing](model-routing.md): 프론트엔드 profile 선택 기준
- [Frontend Gates](gates.md): 디자인·구현·검증 조건
- [UI 수동 점검표](ui-smoke-checklist.md): UI 변경의 scoped/full 브라우저 점검
