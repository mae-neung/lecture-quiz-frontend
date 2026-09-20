import { NavLink, Outlet } from 'react-router-dom'
import './DashboardLayout.css'

const navigationItems = [
  { to: '/', label: '대시보드', end: true },
  { to: '/workflows', label: '워크플로우' },
  { to: '/runs', label: '실행 기록' },
  { to: '/settings', label: '설정' },
]

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a className="sidebar__brand" href="/">
          <span className="sidebar__brand-mark" aria-hidden="true">O</span>
          <span>Orchestra</span>
        </a>

        <nav className="sidebar__nav" aria-label="주요 메뉴">
          {navigationItems.map(({ to, label, end }) => (
            <NavLink
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
              end={end}
              key={to}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="sidebar__footer">Workflow orchestration</p>
      </aside>

      <div className="dashboard-layout__content">
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout
