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
import { SprintPlannerPage } from '@/pages/SprintPlannerPage'
import { TeamPage } from '@/pages/TeamPage'
import { EpicsPage } from '@/pages/EpicsPage'
import { MainLayout } from '@/shared/ui/main-layout'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'border border-border bg-card/80 backdrop-blur-md text-foreground shadow-2xl rounded-2xl p-4 font-bold',
          duration: 4000,
        }}
        richColors
        closeButton
      />
      <TooltipProvider>
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
                
                {/* Rutas exclusivas de Administrador (dentro del mismo layout) */}
                <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                  <Route path="stories" element={<StoriesPage />} />
                  <Route path="epics" element={<EpicsPage />} />
                  <Route path="stories/:id" element={<StoryDetailPage />} />
                  <Route path="sprints" element={<SprintsPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="board" element={<BoardPage />} />
                  <Route path="planner" element={<SprintPlannerPage />} />
                  <Route path="team" element={<TeamPage />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </div>
  )
}

export default App
