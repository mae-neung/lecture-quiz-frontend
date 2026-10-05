import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import './Home.css'

function Home() {
  const { isLoggedIn } = useAuth()

  return (
    <section className="page home">
      <div className="home__copy">
        <p className="page__eyebrow">나만의 강의 학습 공간</p>
        <h1>강의 자료에서<br />문제 풀이까지</h1>
        <p>강의 영상과 교안을 등록하고, 학습 문제를 만드는 과정을 시작해 보세요.</p>
        <Link className="home__link" to={isLoggedIn ? '/upload' : '/login'}>
          {isLoggedIn ? '강의 자료 등록하기' : '데모 로그인 시작하기'}
        </Link>
        <p className="home__notice">현재는 로그인과 자료 등록 화면을 체험할 수 있습니다.</p>
      </div>
      <div className="home__preview" aria-hidden="true">
        <div className="home__preview-top"><span>LECTURE / 01</span><span>● ● ●</span></div>
        <div className="home__preview-icon">▶</div>
        <div className="home__preview-card">
          <span>강의 자료</span>
          <strong>새로운 학습을 시작하세요</strong>
          <i />
        </div>
      </div>
    </section>
  )
}

export default Home
