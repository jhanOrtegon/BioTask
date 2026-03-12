import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { useStoriesStore } from '@/features/stories/store'
import { useAuthStore } from '@/features/auth/store'
import { useTasksStore } from '@/features/tasks/store'
import { BookOpen, FileText, Plus, PenLine, Sparkles, FolderKanban, Activity, PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export function Dashboard() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const { stories } = useStoriesStore()
  const { startNewTask } = useTasksStore()

  const activeStories = stories.filter(s => s.status === 'active')
  const totalTasks = stories.reduce((acc, story) => acc + story.tasks.filter(t => t.status !== 'archived').length, 0)

  const handleQuickTask = () => {
    startNewTask() // Sin plantilla
    void navigate('/editor')
  }

  // --- Analíticas ---
  // 1. Distribución de Tipos de Tareas
  const allTasksArray = stories.flatMap(s => s.tasks.filter(t => t.status !== 'archived'))

  const typeCount = allTasksArray.reduce<Record<string, number>>((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(typeCount).map(([name, value]) => ({ name, value }))

  const barData = activeStories.slice(0, 5).map(story => {
    const totalSpentSeconds = story.tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0)
    const totalEstimatedHours = story.tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)

    return {
      name: story.code,
      Invertido: Number((totalSpentSeconds / 3600).toFixed(1)),
      Estimado: Number(totalEstimatedHours.toFixed(1))
    }
  })

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Panel de Control
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl pl-11">
              Bienvenido a BioTask Standard Edition. Gestiona tus historias de Jira y redacta tareas técnicas estructuradas.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            {role !== 'Editor' && (
              <>
                <Button variant="outline" size="lg" className="h-12 border-primary/20 hover:bg-primary/5 font-bold" onClick={handleQuickTask}>
                  <PenLine className="mr-2 h-5 w-5" /> Tarea Rápida
                </Button>
                <Button size="lg" className="h-12 shadow-lg shadow-primary/20 font-bold" onClick={() => { void navigate('/stories') }}>
                  <Plus className="mr-2 h-5 w-5" /> Nueva Historia
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-wider text-xs">Historias Activas</CardDescription>
              <CardTitle className="text-4xl font-black flex items-center justify-between">
                {activeStories.length}
                <BookOpen className="h-8 w-8 text-primary/40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-medium">En tu backlog actual</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-wider text-xs">Tareas Activas</CardDescription>
              <CardTitle className="text-4xl font-black flex items-center justify-between">
                {totalTasks}
                <FolderKanban className="h-8 w-8 text-blue-500/40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-medium">Asociadas a historias activas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-wider text-xs">Plantillas Disponibles</CardDescription>
              <CardTitle className="text-4xl font-black flex items-center justify-between">
                Gestionar
                <FileText className="h-8 w-8 text-emerald-500/40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="p-0 h-auto text-xs text-emerald-500 font-bold" onClick={() => { void navigate('/templates') }}>
                Ver biblioteca
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analíticas Gráficas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" /> Distribución de Tareas
                </CardTitle>
                <CardDescription>Tipos de tareas activas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          // eslint-disable-next-line @typescript-eslint/no-deprecated
                          <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                        itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground/50 text-sm font-medium border border-dashed border-border/50 rounded-lg">
                  No hay tareas suficientes
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" /> Tiempos Invertidos
                </CardTitle>
                <CardDescription>Horas gastadas vs. estimadas</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                      />
                      <Bar dataKey="Invertido" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="Estimado" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground/50 text-sm font-medium border border-dashed border-border/50 rounded-lg">
                  No hay historias activas
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Historias Recientes */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Historias Recientes
            </h2>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground" onClick={() => { void navigate('/stories') }}>
              Ver todas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeStories.slice(0, 4).map(story => (
              <Card key={story.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { void navigate(`/stories/${story.id}`) }}>
                <CardContent className="p-5 flex gap-4 items-start">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="font-mono text-xs font-bold text-primary">{story.code.split('-')[1] || '01'}</span>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">{story.code}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-full">{story.module}</span>
                    </div>
                    <p className="font-bold text-sm truncate">{story.title}</p>
                    <p className="text-xs text-muted-foreground pt-1">{story.tasks.filter(t => t.status !== 'archived').length} tareas activas</p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeStories.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center p-12 border border-dashed rounded-xl border-border/50 bg-muted/10">
                <BookOpen className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-foreground">No tienes historias activas</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Comienza creando una nueva User Story para agrupar tus tareas.</p>
                {role !== 'Editor' && <Button size="sm" onClick={() => { void navigate('/stories') }}>Nueva Historia</Button>}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
