# Amadda 백엔드 API 분석 및 연동 문서

## 1. 분석 기준

- 대상 저장소: [newbie423/Amadda](https://github.com/newbie423/Amadda)
- 기준 브랜치: `main`
- 기준 커밋: [`472f4bbfbf119d33bd869ecd1f1674bdcfab132d`](https://github.com/newbie423/Amadda/tree/472f4bbfbf119d33bd869ecd1f1674bdcfab132d)
- 커밋 시각: 2026-10-19 10:28:14 KST
- API 진입점: [`AmaddaBackend/main.py`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/main.py)
- 분석 방식: 라우트, Pydantic 요청 모델, 컨트롤러, 저장 엔티티, 포함된 HTML 요청 클라이언트를 정적 대조했다. 실제 Firebase/Gemini 자격 증명이 없어 외부 서비스까지 연결하는 통합 테스트는 수행하지 않았다.

현재 라우트는 업무 API 22개와 테스트 HTML을 반환하는 루트 1개로 구성된다. 가장 중요한 결론은 **인증·인가가 구현되어 있지 않아 `user_id`를 아는 요청자가 해당 사용자의 데이터를 조회·수정·삭제할 수 있다는 점**이다. 현재 상태로 인터넷에 공개 배포하면 안 된다.

## 2. 기본 주소와 요청 링크

저장소에 포함된 HTML 클라이언트의 기본 주소는 다음과 같다.

```text
http://127.0.0.1:8000
```

따라서 실제 요청 링크는 `기본 주소 + 경로`다. 예를 들어 로그인 요청 링크는 `http://127.0.0.1:8000/users/login`이다. 운영 환경에서는 기본 주소만 HTTPS 도메인으로 교체한다.

FastAPI가 기본 제공하는 문서 링크는 애플리케이션이 정상 기동했을 때 다음과 같다.

| 용도 | 로컬 링크 |
| --- | --- |
| Swagger UI | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |
| OpenAPI JSON | `http://127.0.0.1:8000/openapi.json` |
| 테스트 HTML | `http://127.0.0.1:8000/` |

`GET /`는 `way = 1`로 고정되어 사용자 계정 테스트 페이지만 반환한다. 과목·위키·문제 HTML 파일은 별도 라우트가 없다.

### 공통 JSON 요청 헤더

파일 업로드를 제외한 모든 업무 API는 JSON 본문을 사용한다.

```http
Content-Type: application/json
```

인증 헤더는 현재 사용하지 않는다. 이는 사용 방법이 아니라 반드시 수정해야 할 보안 결함이다.

### 공통 응답

애플리케이션 코드가 정상 처리한 성공 응답은 모두 HTTP `200`이며 다음 구조다.

```json
{
  "success": true,
  "message": "처리 결과 메시지",
  "data": null
}
```

데이터가 있는 API는 `data` 내부에 API별 키를 둔다. 라우트 내부에서 잡힌 예외는 모두 HTTP `400`으로 변환된다.

```json
{
  "success": false,
  "message": "예외 문자열",
  "data": null
}
```

요청 본문이 Pydantic 모델과 맞지 않으면 라우트 진입 전에 FastAPI 기본 HTTP `422` 응답이 반환되므로 위 공통 오류 형식과 다르다.

## 3. 전체 API 목록

### 3.1 사용자 계정 API

출처: [`main.py#L95-L211`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/main.py#L95-L211)

| 기능 | 메서드 | 요청 경로 | JSON 본문 | 성공 시 `data` | 주의사항 |
| --- | --- | --- | --- | --- | --- |
| 회원가입 | `POST` | `/users/signup` | `{"email":"user@example.com","password":"secret","password_check":"secret"}` | `null` | Firebase Auth 계정과 Firestore User를 만들고 인증 메일을 보낸다. |
| 로그인 | `POST` | `/users/login` | `{"email":"user@example.com","password":"secret"}` | `{"user_id":"<firebase uid>"}` | 이메일 인증이 완료되어야 한다. ID 토큰은 클라이언트에 반환하지 않는다. |
| 인증 메일 재전송 | `POST` | `/users/resend-email-verification` | `{"email":"user@example.com"}` | `null` | 서버 메모리/파일에 남은 가입 대기 정보가 필요하다. |
| 로그아웃 | `POST` | `/users/logout` | `{"user_id":"<uid>"}` | `null` | 실제 세션 폐기가 아니라 해당 사용자의 서버 프로세스 캐시만 제거한다. |
| 회원탈퇴 | `DELETE` | `/users/delete` | `{"user_id":"<uid>"}` | `null` | Firebase Auth 및 연관 Firestore 데이터를 연쇄 삭제한다. 인증 확인이 없다. |
| 미인증 계정 정리 | `POST` | `/users/delete-unverified` | `{"elapsed_second":300.0}` | `null` | 기본값 300초. 전역 파괴 작업인데 관리자 인증이 없다. 구현상 Firebase Auth 계정은 삭제하지 않는다. |

예시:

```bash
curl -X POST "http://127.0.0.1:8000/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### 3.2 과목 API

출처: [`main.py#L222-L307`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/main.py#L222-L307)

| 기능 | 메서드 | 요청 경로 | JSON 본문 | 성공 시 `data` | 주의사항 |
| --- | --- | --- | --- | --- | --- |
| 전체 과목 조회 | `POST` | `/subjects/get-all` | `{"user_id":"<uid>"}` | `{"subjects":[Subject, ...]}` | `subject_number` 오름차순으로 정렬한다. |
| 과목 생성 | `POST` | `/subjects/create` | `{"user_id":"<uid>"}` | `{"subject":Subject}` | 이름이 빈 과목을 생성하며 번호는 현재 개수 + 1이다. |
| 과목 수정 | `PATCH` | `/subjects/update` | `{"user_id":"<uid>","subject_id":"<id>","new_datas":{"subject_name":"자료구조","subject_number":1}}` | `null` | 사실상 허용 필드는 `subject_name`, `subject_number`지만 API 모델은 임의 객체다. |
| 과목 삭제 | `DELETE` | `/subjects/delete` | `{"user_id":"<uid>","subject_id":"<id>"}` | `null` | 위키·문제·답변·채점 데이터까지 연쇄 삭제하고 뒤 과목 번호를 당긴다. |

`Subject`의 현재 반환 구조는 다음과 같다. `document_id`는 Firestore 내부 식별자이지만 현재 응답에서 제거되지 않는다.

```json
{
  "owner_user_id": "<uid>",
  "subject_id": "<uuid>",
  "owned_wiki_document_ids": [],
  "subject_number": 1,
  "subject_name": "",
  "document_id": "<firestore document id>"
}
```

### 3.3 강의자료 및 위키 API

출처: [`main.py#L321-L490`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/main.py#L321-L490)

| 기능 | 메서드 | 요청 경로 | 본문 | 성공 시 `data` | 구현 상태/주의사항 |
| --- | --- | --- | --- | --- | --- |
| 파일 업로드·텍스트 추출 | `POST` | `/lecture-materials/upload` | `multipart/form-data`: `user_id`, `subject_id`, 반복 `files`, 반복 `file_types` | `null` | 지원 형식은 `pdf`, `mp3`, `mp4`. 각 파일과 `file_types`의 순서가 대응해야 한다. 요청은 처리가 끝난 뒤 응답한다. |
| URL 업로드 | `POST` | `/lecture-materials/upload-urls` | `{"user_id":"<uid>","subject_id":"<id>","urls":["https://..."]}` | 설계상 `{"failed_urls":[]}` | **미구현**. 현재 항상 HTTP 400과 `아직 구현되지 않았습니다`를 반환한다. |
| 업로드 상태 | `POST` | `/lecture-materials/is-uploading` | `{"user_id":"<uid>","subject_id":"<id>"}` | `{"is_uploading":true}` | 해당 프로세스 메모리에 상태가 없으면 `false`가 아니라 HTTP 400이다. |
| 업로드 자료 요약 | `POST` | `/lecture-materials/summarize` | `{"user_id":"<uid>","subject_id":"<id>"}` | `null` | 대기 텍스트를 Gemini로 요약하고 첫 번째 위키 문서에 누적한다. |
| 요약 완료 상태 | `POST` | `/lecture-materials/is-summarized` | `{"user_id":"<uid>","subject_id":"<id>"}` | `{"is_summarized":true}` | 상태는 프로세스 메모리에만 존재한다. |
| 전체 위키 문서 조회 | `POST` | `/wiki-documents/get-all` | `{"user_id":"<uid>","subject_id":"<id>"}` | `{"wiki_documents":[WikiDocument, ...]}` | 현재 과목당 첫 위키 문서를 요약 대상으로 사용한다. |

파일 업로드 예시:

```bash
curl -X POST "http://127.0.0.1:8000/lecture-materials/upload" \
  -F "user_id=<uid>" \
  -F "subject_id=<subject-id>" \
  -F "files=@lecture.pdf" \
  -F "file_types=pdf" \
  -F "files=@recording.mp3" \
  -F "file_types=mp3"
```

`WikiDocument` 반환 구조:

```json
{
  "owner_user_id": "<uid>",
  "owner_subject_id": "<subject-id>",
  "wiki_document_id": "<uuid>",
  "owned_problem_ids": [],
  "wiki_document_content": "누적 요약 본문",
  "document_id": "<firestore document id>"
}
```

### 3.4 문제 및 답변 API

출처: [`main.py#L505-L657`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/main.py#L505-L657)

| 기능 | 메서드 | 요청 경로 | JSON 본문 | 성공 시 `data` | 주의사항 |
| --- | --- | --- | --- | --- | --- |
| 문제 생성 | `POST` | `/problems/create` | `{"user_id":"<uid>","subject_id":"<id>","wiki_document_id":"<id>","generate_rule":GenerateRule}` | `null` | Gemini 생성과 DB 저장이 모두 끝난 뒤 응답한다. |
| 문제 생성 상태 | `POST` | `/problems/is-creating` | `{"user_id":"<uid>","subject_id":"<id>","wiki_document_id":"<id>"}` | `{"is_creating":true}` | 상태는 프로세스 메모리 값이다. |
| 전체 문제 조회 | `POST` | `/problems/get-all` | `{"user_id":"<uid>","subject_id":"<id>","wiki_document_id":"<id>"}` | `{"problems":[Problem, ...]}` | 정렬을 명시적으로 수행하지 않는다. |
| 전체 사용자 답변 조회 | `POST` | `/problems/get-all-user-answers` | `{"user_id":"<uid>","subject_id":"<id>","wiki_document_id":"<id>"}` | `{"user_answers":[UserAnswer, ...]}` | 위키 문서 기준 필터다. |
| 사용자 답변 수정 | `PATCH` | `/problems/user-answers/update` | `{"user_id":"<uid>","subject_id":"<id>","user_answer_id":"<id>","new_datas":{"user_answer":"답","user_answer_state":"answered"}}` | `null` | 값 타입과 상태 enum 검증이 없다. ID가 포함된 키는 거부한다. |
| 문제 삭제 | `DELETE` | `/problems/delete` | `{"user_id":"<uid>","subject_id":"<id>","problem_id":"<id>"}` | `null` | 연결된 답변·채점도 삭제하고 뒤 문제 번호를 당긴다. |

`GenerateRule` 규칙:

```json
{
  "total_count": 10,
  "problem_type_counts": {
    "ox": 2,
    "select": 4,
    "short": 3,
    "long": 1
  },
  "difficulty": "medium",
  "focus_keywords": ["가야", "고대 기록 매체"],
  "coverage": "balanced"
}
```

- `total_count`: 1 이상의 정수
- `problem_type_counts`: `ox`, `select`, `short`, `long`을 모두 포함하며 각 값은 0 이상의 정수, 합계는 `total_count`와 동일
- `difficulty`: `easy`, `medium`, `hard` 중 하나
- `focus_keywords`: 빈 배열 또는 공백이 아닌 문자열 배열
- `coverage`: `balanced` 또는 `focused`

`Problem` 반환 구조:

```json
{
  "owner_user_id": "<uid>",
  "owner_subject_id": "<subject-id>",
  "owner_wiki_document_id": "<wiki-id>",
  "problem_id": "<uuid>",
  "owned_user_answer_id": "<uuid>",
  "owned_grade_id": "<uuid>",
  "problem_type": "select",
  "problem_number": 1,
  "problem_question": "질문",
  "problem_correct_answer": "정답",
  "problem_options": ["보기 1", "보기 2"],
  "document_id": "<firestore document id>"
}
```

`UserAnswer` 반환 구조:

```json
{
  "owner_user_id": "<uid>",
  "owner_subject_id": "<subject-id>",
  "owner_wiki_document_id": "<wiki-id>",
  "owner_problem_id": "<problem-id>",
  "user_answer_id": "<uuid>",
  "user_answer": "",
  "user_answer_state": "not_answered",
  "document_id": "<firestore document id>"
}
```

채점(`Grade`) 데이터는 문제 생성 시 내부적으로 함께 만들어지지만 현재 공개 API가 없다.

## 4. 프론트엔드 권장 호출 순서

```text
회원가입 → 이메일 인증 → 로그인(user_id 획득)
  → 과목 생성
  → 강의자료 파일 업로드
  → 강의자료 요약
  → 위키 문서 조회(wiki_document_id 획득)
  → 문제 생성
  → 문제/답변 조회
  → 답변 수정
```

현재 구현에서 로그인 응답은 `user_id`만 반환한다. 보안 수정 후에는 로그인 클라이언트가 Firebase ID 토큰을 보유하고 모든 보호 API에 `Authorization: Bearer <id_token>`을 보내며, 서버가 검증된 토큰의 UID를 사용해야 한다. 요청 본문의 `user_id`를 권한 판단에 사용하면 안 된다.

## 5. 백엔드가 호출하는 외부 서비스

### Firebase Identity Toolkit

출처: [`firebase_signup_and_login.py#L41-L162`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/firebase_signup_and_login.py#L41-L162)

| 내부 기능 | 메서드 | 외부 요청 링크 | 본문 핵심 |
| --- | --- | --- | --- |
| 가입 직후 토큰 발급, 로그인 | `POST` | `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=<FIREBASE_CLIENT_KEY>` | `email`, `password`, `returnSecureToken` |
| 인증 메일 전송 | `POST` | `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=<FIREBASE_CLIENT_KEY>` | `requestType=VERIFY_EMAIL`, `idToken` |

Firebase Admin SDK는 사용자 생성·조회·삭제와 Firestore CRUD를 수행한다. SDK가 내부적으로 선택하는 실제 전송 URL은 코드에 고정되어 있지 않으므로 이 문서에서 임의로 특정하지 않는다.

### Gemini

- PDF는 로컬 OCR 처리 후 텍스트를 얻는다.
- MP3는 Gemini Files API 업로드 후 `gemini-3.5-transcribe` 상호작용으로 전사한다.
- MP4는 로컬 FFmpeg로 MP3를 만든 뒤 같은 전사 흐름을 사용한다.
- 위키 요약과 문제 생성은 `gemini-3.5-flash-lite`를 사용한다.
- Gemini SDK가 구성하는 실제 HTTPS 요청 링크는 소스에 직접 선언되어 있지 않다.

## 6. 코드 검토 결과

### Critical — 인증·인가 부재로 전체 사용자 데이터가 IDOR에 노출됨

모든 보호 대상 API가 클라이언트가 보낸 `user_id`를 그대로 신뢰한다. `Authorization` 헤더, Firebase ID 토큰 검증, 인증 사용자와 리소스 소유자의 일치 확인이 없다. UID를 알거나 추측·유출받은 공격자는 다른 사용자의 과목, 위키, 문제와 답변을 읽거나 수정·삭제할 수 있고 회원탈퇴까지 호출할 수 있다.

조치:

1. Firebase ID 토큰을 검증하는 FastAPI dependency를 만든다.
2. 보호 API의 `user_id`를 본문에서 제거하고 검증된 토큰의 `uid`만 사용한다.
3. 모든 하위 리소스 조회·수정·삭제에서 소유권을 다시 확인한다.
4. `/users/delete-unverified`는 공개 API에서 제거하고 인증된 관리자 작업 또는 스케줄러로 옮긴다.

### Critical — 가입 대기 파일에 비밀번호와 ID 토큰을 평문 직렬화함

[`amadda_user_account_controller.py#L48-L96`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/amadda_user_account_controller.py#L48-L96)은 비밀번호와 Firebase ID 토큰을 `pending_validate_emails.pkl`에 저장하며 시작 시 `pickle.load`로 읽는다. 파일 유출 시 자격 증명이 노출되고, 파일을 변조할 수 있는 주체가 있다면 pickle 역직렬화 과정에서 임의 코드 실행 위험도 생긴다.

조치: 비밀번호를 저장하지 말고 Firebase 사용자 생성 시각과 UID만 신뢰 가능한 저장소에 보관한다. pickle을 제거하고 만료 계정 정리는 Firebase Admin API 기준으로 수행한다.

### High — 미인증 계정 정리가 실제 Firebase Auth 계정을 삭제하지 않음

[`delete_unvalid_emails_uid`](https://github.com/newbie423/Amadda/blob/472f4bbfbf119d33bd869ecd1f1674bdcfab132d/AmaddaBackend/amadda_user_account_controller.py#L152-L174)는 저장된 비밀번호로 로그인한 뒤 Firestore 애플리케이션 데이터만 삭제하고 `FirebaseSignUpAndLogin.delete(uid)`를 호출하지 않는다. Firebase Auth 계정은 남으므로 같은 이메일로 재가입할 수 없고, 이미 이메일 인증했지만 아직 로그인하지 않은 사용자도 대기 목록에 남아 애플리케이션 데이터가 삭제될 수 있다.

### High — 장시간 동기 호출이 `async` 서버 이벤트 루프를 막음

문제 생성은 동기 Gemini 호출을 `async` 메서드 안에서 직접 실행하고, 위키 요약도 동기 LLM 호출을 직접 반복한다. 가입·로그인도 동기 `httpx.post`와 Firebase Admin 호출을 사용한다. 한 요청이 진행되는 동안 같은 프로세스의 상태 확인 및 다른 요청이 지연될 수 있어 `/problems/is-creating`의 실효성이 낮다.

조치: 외부 동기 호출을 `asyncio.to_thread` 또는 비동기 클라이언트로 분리하고, 긴 작업은 durable queue/background worker와 작업 ID 기반 상태 API로 전환한다.

### High — 진행 상태와 잠금이 프로세스 메모리에만 존재함

강의자료 상태, 문제 생성 상태, `asyncio.Lock`이 모두 단일 프로세스 메모리다. 재시작하면 상태가 사라지고, 다중 worker에서는 worker마다 서로 다른 상태와 잠금을 갖는다. 코드 자체도 잠금이 현재 프로세스에서만 유효함을 명시한다.

조치: Redis/DB 기반 작업 상태와 분산 잠금을 사용하고 상태 응답에 `queued/running/succeeded/failed`와 오류 정보를 포함한다.

### High — 업로드 제한과 서버 측 파일 검증이 없음

서버는 `file_types`라는 클라이언트 문자열만 신뢰하며 실제 MIME/파일 시그니처, 파일 크기, 파일 수, PDF 페이지 수, 미디어 재생 시간을 제한하지 않는다. 전체 파일을 메모리로 읽고 OCR·FFmpeg·Gemini 호출을 수행하므로 비용 및 자원 고갈 공격에 취약하다.

### High — 다단계 쓰기 작업에 트랜잭션/보상 처리가 없음

회원가입, 과목·문제 생성, 연쇄 삭제가 여러 Firebase Auth/Firestore 작업으로 나뉘며 중간 실패 시 일부 데이터만 반영될 수 있다. 문제 생성 중 저장 오류가 나면 일부 문제만 남고 생성 상태 플래그가 `True`로 고정될 수 있다. 과목 번호와 문제 번호도 `현재 개수 + 1` 및 순차 재번호 방식이라 동시 요청에서 충돌할 수 있다.

### Medium — 오류 상태와 응답 계약이 일관되지 않음

모든 잡힌 예외를 HTTP `400`으로 내려 인증 오류, 미존재, 충돌, 외부 서비스 장애와 서버 버그를 구분할 수 없다. 예외 문자열을 그대로 노출하며, Pydantic 검증 오류는 별도 `422` 형식이다.

권장 매핑 예: 잘못된 입력 `400/422`, 미인증 `401`, 권한 없음 `403`, 미존재 `404`, 충돌 `409`, 요청 제한 `429`, 외부 서비스/서버 장애 `500/502/503`.

### Medium — 느슨한 `new_datas` 계약과 프론트 타입 불일치

과목 및 답변 수정은 `dict[str, Any]`를 받아 값 타입과 허용 enum을 검증하지 않는다. 포함된 과목 HTML 클라이언트는 `subject_number` 입력값을 숫자로 변환하지 않고 문자열로 보낸다. 기존 정수와 문자열이 섞이면 과목 정렬에서 타입 오류가 날 수 있다.

조치: `SubjectUpdate`, `UserAnswerUpdate`, `GenerateRule`을 명시적 Pydantic 모델로 만들고 `extra="forbid"`, 숫자 범위와 상태 enum을 지정한다.

### Medium — URL 업로드 API가 공개 계약에 있지만 미구현

`POST /lecture-materials/upload-urls`와 테스트 UI가 존재하지만 컨트롤러는 항상 `아직 구현되지 않았습니다`를 발생시킨다. 구현 전까지 OpenAPI와 프론트에서 숨기거나 `501 Not Implemented`로 명확히 응답해야 한다. 구현 시에는 SSRF 방어, 허용 스킴/도메인, 사설 IP 차단, 리다이렉트·크기·시간 제한이 필요하다.

### Medium — 신규 체크아웃 실행 문서가 부족함

README에 기동 설명이 없고 `.env.example`도 없다. 코드는 저장소 루트 기준 `AmaddaBackend/.env`, `GEMINI_API_KEY`, 그리고 고정 경로의 Firebase 서비스 계정 JSON을 요구한다. 또한 상대 경로를 사용하므로 실행 디렉터리가 달라지면 서비스 계정과 HTML 파일을 찾지 못한다.

### Low — 내부 저장소 필드가 API 응답에 노출됨

과목·위키·문제·답변 조회는 캐시 객체를 그대로 반환해 Firestore `document_id`와 관계 배열까지 노출한다. 직접적인 권한 상승 수단은 아니어도 API 계약을 저장 구조와 강하게 결합한다. 응답 DTO로 필요한 필드만 반환하는 편이 안전하다.

## 7. 연동 전 우선순위

1. **배포 차단:** 인증·인가 및 관리자 작업 분리 전에는 외부 공개 금지.
2. **자격 증명 제거:** 비밀번호/ID 토큰 pickle 저장 제거, 기존 파일이 있다면 안전하게 폐기하고 관련 계정 자격 증명 회전 검토.
3. **계정 정리 수정:** Firebase Auth와 Firestore의 일관된 삭제 및 보상 흐름 구현.
4. **명시적 DTO:** 모든 수정/생성 요청과 응답 스키마 확정, 오류 계약 통일.
5. **비동기 작업화:** 업로드·요약·문제 생성에 작업 ID, durable 상태, 재시도/취소 정책 도입.
6. **업로드 보안:** 크기·형식·페이지/재생시간·동시성·비용 제한.
7. **트랜잭션과 테스트:** 부분 실패/동시성 테스트, API 통합 테스트, 보안 테스트 추가.
8. **운영 문서:** `.env.example`, 서비스 계정 주입 방식, 로컬 실행/배포/헬스체크 문서 추가.

## 8. 검증 기록

- `main.py`의 모든 FastAPI 데코레이터와 요청 모델을 대조했다.
- 네 개 HTML 테스트 클라이언트의 `fetch` 경로, 메서드, JSON/FormData를 라우트와 대조했다.
- 컨트롤러 및 Firebase 캐시 계층에서 반환 엔티티와 삭제 관계를 확인했다.
- Python 구문 검증: `python -m compileall -q AmaddaBackend` 통과.
- 미실행: 실제 서버 기동, Firebase/Gemini 호출, OpenAPI 런타임 확인. 사유는 서비스 계정 JSON 및 API 키가 분석 환경에 없고 외부 데이터 변경 가능성이 있기 때문이다.