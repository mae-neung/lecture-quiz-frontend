# Frontend Template

React와 Vite 기반의 재사용 가능한 프론트엔드 시작 템플릿입니다.

## 시작하기

```bash
npm install
npm run dev
```

개발 서버 주소는 터미널에 표시됩니다. 일반적으로 `http://localhost:5173`입니다.

## 명령어

| 명령어 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 배포용 파일 생성 |
| `npm run preview` | 배포용 빌드를 로컬에서 미리 보기 |
| `npm run lint` | 코드 품질 검사 |

## 폴더 구조

```text
src/
├── components/  # 여러 화면에서 재사용하는 UI 컴포넌트
├── features/    # 로그인, 상품 목록처럼 기능별 코드 묶음
├── hooks/       # 재사용하는 React Hook
├── pages/       # 페이지 단위 화면
├── services/    # API 호출 등 외부 시스템 통신
├── utils/       # 날짜·문자열 처리 같은 순수 유틸리티
├── App.jsx      # 현재 최상위 화면 컴포넌트
└── main.jsx     # React 앱의 진입점
```

빈 폴더의 `.gitkeep` 파일은 Git이 폴더 구조를 유지하도록 하기 위한 자리표시자입니다. 해당 폴더에 실제 파일을 추가하면 삭제해도 됩니다.
