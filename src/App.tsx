import { lazy, Suspense, type ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { GuestRoute } from '@/features/auth/components/GuestRoute'
import { MainLayout } from '@/shared/components/main-layout'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/shared/components/tooltip'
import { LoadingScreen } from '@/shared/components/loading-screen'

// Helper para Lazy Loading con tipado estricto (sin any)
const lazyPage = <T extends Record<string, ComponentType<unknown>>>(
  importFn: () => Promise<T>,
  name: string
) => {
  return lazy(async () => {
    const module = await importFn();
    return { default: module[name] };
  });
};

// Lazy Loading de Páginas (Carga real bajo demanda)
const LoginPage = lazyPage(() => import('@/pages/login/LoginPage'), 'LoginPage')
const Dashboard = lazyPage(() => import('@/pages/dashboard/DashboardPage'), 'Dashboard')
const EditorPage = lazyPage(() => import('@/pages/editor/EditorPage'), 'EditorPage')
const TemplatesPage = lazyPage(() => import('@/pages/templates/TemplatesPage'), 'TemplatesPage')
const StoriesPage = lazyPage(() => import('@/pages/stories/StoriesPage'), 'StoriesPage')
const StoryDetailPage = lazyPage(() => import('@/pages/story-detail/StoryDetailPage'), 'StoryDetailPage')
const BoardPage = lazyPage(() => import('@/pages/board/BoardPage'), 'BoardPage')
const TasksPage = lazyPage(() => import('@/pages/tasks/TasksPage'), 'TasksPage')
const SprintsPage = lazyPage(() => import('@/pages/sprints/SprintsPage'), 'SprintsPage')
const SprintPlannerPage = lazyPage(() => import('@/pages/planner/SprintPlannerPage'), 'SprintPlannerPage')
const TeamPage = lazyPage(() => import('@/pages/team/TeamPage'), 'TeamPage')
const EpicsPage = lazyPage(() => import('@/pages/epics/EpicsPage'), 'EpicsPage')
const AnalyticsPage = lazyPage(() => import('@/pages/analytics/AnalyticsPage'), 'AnalyticsPage')
const HealthPage = lazyPage(() => import('@/pages/analytics/HealthPage'), 'HealthPage')
const LoadPage = lazyPage(() => import('@/pages/analytics/LoadPage'), 'LoadPage')
const PerformancePage = lazyPage(() => import('@/pages/analytics/PerformancePage'), 'PerformancePage')
const OperationalPulsePage = lazyPage(() => import('@/pages/monitoring/OperationalPulsePage'), 'OperationalPulsePage')
const MemberDetailPage = lazyPage(() => import('@/pages/monitoring/MemberDetailPage'), 'MemberDetailPage')
const ActivityLogPage = lazyPage(() => import('@/pages/monitoring/ActivityLogPage'), 'ActivityLogPage')
const ActivityDetailPage = lazyPage(() => import('@/pages/monitoring/ActivityDetailPage'), 'ActivityDetailPage')
const TaskDetailPage = lazyPage(() => import('@/pages/tasks/TaskDetailPage'), 'TaskDetailPage')
const TaskFormPage = lazyPage(() => import('@/pages/tasks/TaskFormPage'), 'TaskFormPage')
const WikiPage = lazyPage(() => import('@/pages/wiki/WikiPage'), 'WikiPage')
const SecurityPage = lazyPage(() => import('@/pages/settings/SecurityPage'), 'SecurityPage')

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'border border-border/60 bg-card/90 backdrop-blur-lg text-foreground shadow-lg rounded-xl p-4 font-medium',
          duration: 4000,
        }}
        richColors
        closeButton
      />
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
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
                  <Route path="wiki" element={<WikiPage />} />
 
                  {/* Rutas exclusivas de Administrador (dentro del mismo layout) */}
                  <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                    <Route path="stories" element={<StoriesPage />} />
                    <Route path="epics" element={<EpicsPage />} />
                    <Route path="stories/:id" element={<StoryDetailPage />} />
                    <Route path="sprints" element={<SprintsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="tasks/new" element={<TaskFormPage />} />
                    <Route path="tasks/:id" element={<TaskDetailPage />} />
                    <Route path="tasks/:id/edit" element={<TaskFormPage />} />
                    <Route path="board" element={<BoardPage />} />
                    <Route path="planner" element={<SprintPlannerPage />} />
                    <Route path="team" element={<TeamPage />} />
                    
                    {/* Rutas de Monitoreo */}
                    <Route path="monitoring/live" element={<OperationalPulsePage />} />
                    <Route path="monitoring/live/:id" element={<MemberDetailPage />} />
                    <Route path="monitoring/activity" element={<ActivityLogPage />} />
                    <Route path="monitoring/activity/:id" element={<ActivityDetailPage />} />

                    {/* Rutas de Configuración y Seguridad */}
                    <Route path="settings/security" element={<SecurityPage />} />
 
                    {/* Rutas de Reportes */}
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="analytics/health" element={<HealthPage />} />
                    <Route path="analytics/load" element={<LoadPage />} />
                    <Route path="analytics/performance" element={<PerformancePage />} />
                  </Route>
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </div>
  )
}

export default App
