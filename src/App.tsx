import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/ui/ProtectedRoute'
import { GuestRoute } from '@/features/auth/ui/GuestRoute'
import { LoginPage } from '@/pages/LoginPage'
import { Dashboard } from '@/pages/Dashboard'
import { EditorPage } from '@/pages/EditorPage'
import { TemplatesPage } from '@/pages/TemplatesPage'
import { StoriesPage } from '@/pages/StoriesPage'
import { StoryDetailPage } from '@/pages/StoryDetailPage'
import { BoardPage } from '@/pages/BoardPage'
import { TasksPage } from '@/pages/TasksPage'
import { SprintsPage } from '@/pages/SprintsPage'
import { MainLayout } from '@/shared/ui/main-layout'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'border border-border bg-card text-foreground shadow-xl',
          duration: 3500,
        }}
        richColors
        closeButton
      />
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Rutas compartidas (Admin y Editor) */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador', 'Editor']} />}>
            <Route element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="editor" element={<EditorPage />} />
              <Route path="editor/:storyId/:taskId" element={<EditorPage />} />
            </Route>
          </Route>

          {/* Rutas exclusivas de Administrador */}
          <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
            <Route element={<MainLayout />}>
              <Route path="stories" element={<StoriesPage />} />
              <Route path="stories/:id" element={<StoryDetailPage />} />
              <Route path="sprints" element={<SprintsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="board" element={<BoardPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
