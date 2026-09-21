import { Link, NavLink, Outlet } from 'react-router-dom'
import './AppLayout.css'

function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <Link className="app-header__brand" to="/">Frontend Template</Link>
        <nav aria-label="주요 메뉴">
          <NavLink end to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
