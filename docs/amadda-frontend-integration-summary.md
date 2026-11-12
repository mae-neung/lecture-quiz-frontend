# 아맞다시험 프론트엔드 연동 요약

> 출처: Codex 세션 로그(`~/.codex/sessions/2026/10/19/`, 2026-10-19 ~ 2026-10-29) 복원 정리.
> 백엔드 API 상세는 [amadda-backend-api-analysis.md](amadda-backend-api-analysis.md) 참고.

## 1. 개요

- 프론트 저장소: [mae-neung/lecture-quiz-frontend](https://github.com/mae-neung/lecture-quiz-frontend)
- 로컬 경로: `C:/Users/Damie/Documents/ChatGPT/산학프로젝트`
- 공개 사이트: https://mae-neung.github.io/lecture-quiz-frontend/ (GitHub Pages, 해시 라우팅)
- 작업 브랜치: `codex/library-export` → `dev`, `main` 반영
- 스택: React + React Router + TypeScript + Vite, 테스트는 Vitest + Testing Library, 패키지 매니저 `pnpm`

## 2. 데모 모드 vs API 모드

앱은 환경변수 유무로 두 모드로 동작한다.

| 구분 | 조건 | 동작 |
| --- | --- | --- |
| 데모 모드 | `VITE_API_BASE_URL` 미설정 | 체험 계정 `test1234` / `test1234`로 로그인, 서버 호출 없음 |
| API 모드 | `VITE_API_BASE_URL` 설정 | 실제 Amadda 백엔드로 로그인·업로드·요약·문제 생성 |

로컬 API 모드 실행용 `.env.local` 예시:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_API_STORAGE_NAMESPACE=local-amadda
```

```bash
pnpm dev
```

- 테스트가 API 모드로 오염되지 않도록 `.env.test`를 추가해 테스트 환경은 데모 모드로 고정.
- `.env.local`, `.env.test`, Firebase 비밀 키는 모두 Git 제외.

## 3. 연동한 기능

- Firebase 이메일/비밀번호 로그인·로그아웃
- 회원가입 → 이메일 인증 안내 → 과목 생성 → 강의명 수정
- 파일 업로드(PDF·MP3·MP4) → 자료 요약 → 위키 문서 조회
- 객관식 5문제 생성·조회, 생성 문제를 기존 보관함·퀴즈 화면과 연결
- 과목 상세, 요약·문제·답안 관리(OX·객관식·단답형·서술형 입력/저장)
- 문제 삭제 및 연쇄 삭제 확인, 계정 탈퇴
- API 환경·사용자별 세션 및 보관함 격리
- 중복 생성 위험이 있는 비멱등 요청은 응답 유실 시 자동 재시도 차단

### 추가한 화면/라우트

| 화면 | 경로 |
| --- | --- |
| 회원가입 | `/#/signup` |
| 인증 메일 재전송 안내 | `/#/signup/check-email` |
| 내 과목(목록·생성·이름 변경·삭제) | `/#/subjects` |
| 과목 상세 허브 | `/#/subjects/:subjectId` |
| 위키 상세(요약·문제·답안) | `/#/subjects/:subjectId/wiki/:wikiId` |
| 계정 관리·탈퇴 | `/#/account` |

- 로그인 화면에 `계정 만들기`, 전역 메뉴에 `내 과목` 추가.
- 미인증 사용자 일괄 삭제 API는 서비스 레이어만 연결하고 일반 화면에는 노출하지 않음.

## 4. 연동 범위 진행

- Swagger 기준 업무 API 22개 전수 대조.
- 1차에서 13개 연결 → 과목 상세·요약 문서·문제/답안 관리·계정 관리 화면을 추가해 사용자 기능 전체를 실제 호출로 연결.
- 백엔드 미구현인 **URL 자료 업로드**는 숨기지 않고 서버 오류가 화면에 드러나게 처리.

## 5. 수정한 주요 계약 불일치

- 답안 조회/수정 URL이 Swagger와 달라 404 → 정확한 `/problems/...` 경로로 교정.
- 과목이 하나도 없을 때의 백엔드 `400`을 빈 목록으로 안전 해석.
- 위키 문서 조회 실패를 "문서 없음"으로 오인하지 않도록 분리.
- 과목 삭제 확인 문구에 서버 연쇄 삭제(요약·문제·답변/채점) 범위와 브라우저 보관함 잔존 여부 명시, 삭제 후 키보드 포커스 복구.
- 과목 생성→이름 저장 부분 실패 시 중복 과목이 생기지 않도록 재시도 체크포인트 도입.

## 6. 검증 결과

- `pnpm verify`(lint · TypeScript · production build · 테스트) 통과.
- 테스트 수 추이: 34 → 40 → 49(15개 파일) → 62 → **65개 통과**.
- 실제 백엔드 연동으로 로그인 → 빈 과목 → 생성 → 이름 변경 → 삭제, 과목/위키/문제/답안 1건 조회까지 확인(테스트 계정·데이터는 검토 후 삭제).
- 데스크톱(1232px)·모바일(390px) 실제 화면 검토 통과, 390px 가로 넘침 없음.
- 독립 Reviewer 게이트 `ready`.

## 7. 배포 기록

| 커밋 | 내용 | 반영 |
| --- | --- | --- |
| `12ba510` | 1차 API 연동 + 데모 유지, Pages 배포 | `main`, `dev` |
| `47e0775` | `feat: integrate remaining backend API screens` | `main`, `dev` |
| `7f2f2fe` | Pages 빌드 API 주소를 `http://127.0.0.1:8000`으로 고정 | `main`, `dev` |

- GitHub Pages는 정적 호스팅이라 기본은 **데모 모드**. 실제 API를 쓰려면 공개 HTTPS 백엔드 주소를 `VITE_API_BASE_URL`에 넣어 재배포해야 함.
- 임시로 Pages 빌드에 `127.0.0.1:8000`을 고정해둔 상태 → Pages를 연 PC에서 백엔드가 8000번으로 실행 중이어야 하고, 브라우저 로컬 네트워크 접근 허용 + 백엔드 CORS 설정이 필요.

## 8. 남은 이슈 / 참고

- 백엔드의 `user_id` 기반 인증(토큰 미검증), 빈 상태 `400` 반환, 가입 대기 평문 비밀번호 등은 **백엔드 쪽 문제**로 남아 있음(백엔드 문서 6장 참고).
- 요약·문제 생성은 실제 `GEMINI_API_KEY`가 있어야 동작.
- 320px에서 전역 `min-width` 때문에 약간의 가로 스크롤.
- 과목 전환 직후 로딩 전 이전 과목 폼이 잠깐 보일 수 있음 → `model.subject.subjectId === subjectId` 조건 추가 필요.
- 새로고침 시 작성 중 미저장 답안/체크포인트가 복구되지 않음(현재 보관함·풀이 기록은 `localStorage` 저장).
- 채팅에 노출된 Firebase 서비스 계정 키는 폐기 후 재발급(rotate) 권장.

## 9. 주요 파일

- `src/services/api.ts` — API 서비스 레이어
- `src/features/upload/useApiUpload.ts`, `src/features/upload/mapApiProblems.ts` — 업로드·문제 매핑
- `src/features/subjects/useSubjects.ts` — 과목 CRUD 훅
- `src/pages/` — `Login`, `Home`, `Upload`, `Signup`, `SignupCheckEmail`, `Subjects`, `SubjectHub`, `WikiDetail`, `Account`
- `src/router/AppRouter.tsx` — 라우팅
- `.env.example`, `README.md` — 연결 방법
