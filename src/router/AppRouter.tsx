import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from '@/features/auth/AuthProvider'
import RequireDemoLogin from '@/features/auth/RequireDemoLogin'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import About from '@/pages/About/About'
import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'
import Library from '@/pages/Library/Library'
import LibraryDetail from '@/pages/LibraryDetail/LibraryDetail'
import NotFound from '@/pages/NotFound/NotFound'
import Quiz from '@/pages/Quiz/Quiz'
import Upload from '@/pages/Upload/Upload'
import Signup from '@/pages/Signup/Signup'
import SignupCheckEmail from '@/pages/SignupCheckEmail/SignupCheckEmail'
import Subjects from '@/pages/Subjects/Subjects'
import SubjectHub from '@/pages/SubjectHub/SubjectHub'
import WikiDetail from '@/pages/WikiDetail/WikiDetail'
import Account from '@/pages/Account/Account'
import { isApiMode } from '@/services/api'

function AppRouter() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={isApiMode ? <Signup /> : <Navigate to="/login" replace />} />
            <Route path="signup/check-email" element={isApiMode ? <SignupCheckEmail /> : <Navigate to="/login" replace />} />
            <Route element={<RequireDemoLogin />}>
              <Route path="upload" element={<Upload />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="quiz/:id" element={<Quiz />} />
              <Route path="library" element={<Library />} />
              <Route path="library/:id" element={<LibraryDetail />} />
              <Route path="subjects" element={isApiMode ? <Subjects /> : <Navigate to="/upload" replace />} />
              <Route path="subjects/:subjectId" element={isApiMode ? <SubjectHub /> : <Navigate to="/upload" replace />} />
              <Route path="subjects/:subjectId/wiki/:wikiId" element={isApiMode ? <WikiDetail /> : <Navigate to="/upload" replace />} />
              <Route path="account" element={isApiMode ? <Account /> : <Navigate to="/upload" replace />} />
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
