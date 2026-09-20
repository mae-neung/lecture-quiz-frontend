import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashboardLayout from '@/layouts/DashboardLayout/DashboardLayout'
import Dashboard from '@/pages/Dashboard/Dashboard'
import NotFound from '@/pages/NotFound/NotFound'
import Runs from '@/pages/Runs/Runs'
import Settings from '@/pages/Settings/Settings'
import Workflows from '@/pages/Workflows/Workflows'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="runs" element={<Runs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
