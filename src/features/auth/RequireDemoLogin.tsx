import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

function RequireDemoLogin() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />
  }

  return <Outlet />
}

export default RequireDemoLogin
