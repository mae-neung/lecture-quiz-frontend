import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout/AppLayout'
import About from '@/pages/About/About'
import Home from '@/pages/Home/Home'
import NotFound from '@/pages/NotFound/NotFound'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
