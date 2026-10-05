import { HashRouter, Route, Routes } from 'react-router-dom'
import AuthProvider from '@/features/auth/AuthProvider'
import RequireDemoLogin from '@/features/auth/RequireDemoLogin'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import About from '@/pages/About/About'
import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'
import NotFound from '@/pages/NotFound/NotFound'
import Upload from '@/pages/Upload/Upload'

function AppRouter() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route element={<RequireDemoLogin />}>
              <Route path="upload" element={<Upload />} />
            </Route>
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default AppRouter
