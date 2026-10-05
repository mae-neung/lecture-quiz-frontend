import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import './Home.css'

function Home() {
  const { isLoggedIn } = useAuth()

  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__copy">
          <p className="page__eyebrow">시험기간을 덜 막막하게</p>
          <h1>강의 하나 넣으면,<br /><span>시험 대비 문제가 한눈에.</span></h1>
          <p className="home__lead">밀린 강의 영상과 쌓인 교안을 올려 보세요. 아맞다시험이 복습할 내용을 문제로 정리하는 학습 흐름을 준비하고 있어요.</p>
          <Link className="home__link" to={isLoggedIn ? '/upload' : '/login'}>
            {isLoggedIn ? '강의 자료 등록하기' : '데모로 먼저 써보기'}
            <span aria-hidden="true">→</span>
          </Link>
          <p className="home__notice">데모에서는 로그인과 자료 등록 화면만 체험할 수 있으며, 실제 파일은 전송되거나 저장되지 않습니다.</p>
        </div>
        <div className="home__planner" aria-label="아맞다시험 학습 플래너 예시">
          <div className="home__planner-binding" aria-hidden="true"><i /><i /><i /><i /></div>
          <div className="home__planner-head">
            <span>10월 중간고사</span>
            <span>D-12</span>
          </div>
          <p>오늘의 시험 준비</p>
          <div className="home__planner-task">
            <span aria-hidden="true">✓</span>
            <div><small>자료 등록</small><strong>데이터 분석 3주차</strong></div>
          </div>
          <div className="home__planner-task is-next">
            <span aria-hidden="true">2</span>
            <div><small>다음 할 일</small><strong>핵심 개념 문제 풀기</strong></div>
          </div>
          <div className="home__planner-note">“교수님이 강조한 부분부터!”</div>
        </div>
      </section>

      <section className="home__flow" aria-labelledby="study-flow-title">
        <div className="home__section-heading">
          <p className="page__eyebrow">STUDY FLOW</p>
          <h2 id="study-flow-title">시험 공부, 두 단계면 시작돼요.</h2>
        </div>
        <ol className="home__steps">
          <li>
            <span className="home__step-number">01</span>
            <div><strong>강의 자료 등록</strong><p>영상이나 PDF·PPT 교안을 선택해요.</p></div>
            <span className="home__step-state">지금 체험 가능</span>
          </li>
          <li className="is-upcoming">
            <span className="home__step-number">02</span>
            <div><strong>문제로 연습하기</strong><p>생성된 문제를 풀며 시험 범위를 점검해요.</p></div>
            <span className="home__step-state">준비 중</span>
          </li>
        </ol>
      </section>
    </div>
  )
}

export default Home
