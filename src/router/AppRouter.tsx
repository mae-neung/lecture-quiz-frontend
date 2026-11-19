import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthProvider from '@/features/auth/AuthProvider'
import RequireDemoLogin from '@/features/auth/RequireDemoLogin'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import About from '@/pages/About/About'
import Home from '@/pages/Home/Home'
import Login from '@/pages/Login/Login'
import NotFound from '@/pages/NotFound/NotFound'
import Quiz from '@/pages/Quiz/Quiz'
import Upload from '@/pages/Upload/Upload'
import Signup from '@/pages/Signup/Signup'
import SignupCheckEmail from '@/pages/SignupCheckEmail/SignupCheckEmail'
import Subjects from '@/pages/Subjects/Subjects'
import SubjectHub from '@/pages/SubjectHub/SubjectHub'
import SubjectQuiz from '@/pages/SubjectQuiz/SubjectQuiz'
import WikiDetail from '@/pages/WikiDetail/WikiDetail'
import Account from '@/pages/Account/Account'
import { isApiMode } from '@/services/api'

// Vite base(배포 시 '/<repo>/', 개발·테스트 시 '/')에서 basename을 끌어온다.
// 루트가 아니면 끝 슬래시를 떼어 react-router basename 규칙에 맞춘다.
const rawBase = import.meta.env.BASE_URL
const basename = rawBase === '/' ? rawBase : rawBase.replace(/\/$/, '')

function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={isApiMode ? <Signup /> : <Navigate to="/login" replace />} />
            <Route path="signup/check-email" element={isApiMode ? <SignupCheckEmail /> : <Navigate to="/login" replace />} />
            <Route element={<RequireDemoLogin />}>
              <Route path="upload" element={<Upload />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="subjects" element={isApiMode ? <Subjects /> : <Navigate to="/upload" replace />} />
              <Route path="subjects/:subjectId" element={isApiMode ? <SubjectHub /> : <Navigate to="/upload" replace />} />
              <Route path="subjects/:subjectId/quiz" element={isApiMode ? <SubjectQuiz /> : <Navigate to="/upload" replace />} />
              <Route path="subjects/:subjectId/wiki/:wikiId" element={isApiMode ? <WikiDetail /> : <Navigate to="/upload" replace />} />
              <Route path="account" element={isApiMode ? <Account /> : <Navigate to="/upload" replace />} />
            </Route>
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AppRouter
