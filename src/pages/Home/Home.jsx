import { Link } from 'react-router-dom'
import './Home.css'

const foundations = [
  'React 19과 Vite 8',
  'React Router 기본 구성',
  'pnpm 패키지 관리',
  'AI Agent 작업 규칙',
]

function Home() {
  return (
    <section className="page home">
      <p className="page__eyebrow">Starter</p>
      <h1 className="page__title">프론트엔드 작업을 시작하는 기본 템플릿</h1>
      <p className="page__description">
        화면 코드는 단순하게 유지하고, 저장소의 AI Agent가 계획·구현·검토 역할을 나눠 작업할 수 있도록 구성합니다.
      </p>

      <ul className="home__foundations">
        {foundations.map((foundation) => <li key={foundation}>{foundation}</li>)}
      </ul>

      <Link className="home__link" to="/about">템플릿 구조 보기</Link>
    </section>
  )
}

export default Home
