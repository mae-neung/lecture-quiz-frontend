import { Link, NavLink, Outlet } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import { isApiMode } from '@/services/api'
import './AppLayout.css'

function AppLayout() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link className="app-header__brand" to="/" aria-label="아맞다시험 홈">
          <span className="app-header__brand-mark" aria-hidden="true">A!</span>
          <span>아맞다시험</span>
        </Link>
        <nav aria-label="주요 메뉴">
          <NavLink end to="/">홈</NavLink>
          <NavLink to="/upload">자료 등록</NavLink>
          <NavLink to={isApiMode ? '/library' : '/quiz'}>문제 풀이</NavLink>
          <NavLink to="/library">내 보관함</NavLink>
          {isApiMode && <NavLink to="/subjects">내 과목</NavLink>}
          {isApiMode && <NavLink to="/account">계정 관리</NavLink>}
          {isLoggedIn ? <Button variant="secondary" onClick={logout}>로그아웃</Button> : <NavLink to="/login">로그인</NavLink>}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
