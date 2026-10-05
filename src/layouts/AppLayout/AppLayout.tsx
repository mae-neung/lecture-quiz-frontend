import { Link, NavLink, Outlet } from 'react-router-dom'
import Button from '@/components/Button/Button'
import { useAuth } from '@/features/auth/useAuth'
import './AppLayout.css'

function AppLayout() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <div className="app-layout">
      <header className="app-header">
        <Link className="app-header__brand" to="/">배움문제</Link>
        <nav aria-label="주요 메뉴">
          <NavLink end to="/">홈</NavLink>
          <NavLink to="/upload">자료 등록</NavLink>
          <NavLink to="/about">About</NavLink>
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
