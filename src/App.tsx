import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { ProjectEditorPage } from './pages/editor/ProjectEditorPage'
import { MergeJobsPage } from './pages/MergeJobsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectEditorPage />} />
          <Route path="/merge-jobs" element={<MergeJobsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
