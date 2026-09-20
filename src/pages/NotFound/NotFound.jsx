import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="page">
      <p className="page__eyebrow">404</p>
      <h1 className="page__title">페이지를 찾을 수 없습니다.</h1>
      <Link className="page__link" to="/">대시보드로 돌아가기</Link>
    </section>
  )
}

export default NotFound
