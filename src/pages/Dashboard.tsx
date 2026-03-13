import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { useStoriesStore } from '@/features/stories/store'
import { useAuthStore } from '@/features/auth/store'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { BookOpen, Plus, PenLine, Sparkles, FolderKanban, Activity, PieChart as PieChartIcon, RefreshCcw, Zap, Timer, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { toast } from 'sonner'
import { format, subDays, isSameDay, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export function Dashboard() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const { stories, syncTasksIds } = useStoriesStore()
  const { startNewTask } = useTasksStore()
  const { sprints } = useSprintsStore()

  const handleSync = () => {
    syncTasksIds()
    toast.success('Sincronización completada', { description: 'Las tareas sin ID han sido reparadas.' })
  }

  const activeStories = useMemo(() => stories.filter(s => s.status === 'active'), [stories])
  const totalTasks = useMemo(() => stories.reduce((acc, story) => acc + story.tasks.filter(t => t.status !== 'archived').length, 0), [stories])

  const handleQuickTask = () => {
    startNewTask()
    void navigate('/editor')
  }

  // --- Analíticas ---
  const allTasksArray = useMemo(() => stories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [stories])

  const pieData = useMemo(() => {
    const typeCount = allTasksArray.reduce<Record<string, number>>((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1
      return acc
    }, {})
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
  }, [allTasksArray])

  const barData = useMemo(() => {
    return activeStories.slice(0, 5).map(story => {
      const totalSpentSeconds = story.tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0)
      const totalEstimatedHours = story.tasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)

      return {
        name: story.code,
        Invertido: Number((totalSpentSeconds / 3600).toFixed(1)),
        Estimado: Number(totalEstimatedHours.toFixed(1))
      }
    })
  }, [activeStories])

  // --- Sprint Pulse Logic ---
  const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])
  
  const burndownData = useMemo(() => {
    if (!activeSprint) return []
    
    const start = new Date(activeSprint.startDate)
    const end = new Date(activeSprint.endDate)
    const today = new Date()
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const sprintStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
    const totalEstimated = sprintStories.reduce((acc, s) => acc + s.tasks.reduce((tAcc, t) => tAcc + (t.estimatedHours || 0), 0), 0)
    
    const data = []
    for (let i = 0; i < totalDays; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        const ideal = Math.max(0, totalEstimated - (totalEstimated / (totalDays - 1)) * i)
        
        let real: number | null = null
        if (d <= today || (d.toDateString() === today.toDateString())) {
            const completedSoFar = sprintStories.reduce((acc, s) => 
                acc + s.tasks.filter(t => t.status === 'completed' && new Date(t.updatedAt) <= d).reduce((tAcc, t) => tAcc + (t.estimatedHours || 0), 0)
            , 0)
            real = Math.max(0, totalEstimated - completedSoFar)
        }

        data.push({
            name: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
            Ideal: Number(ideal.toFixed(1)),
            Real: real !== null ? Number(real.toFixed(1)) : undefined
        })
    }
    return data
  }, [activeSprint, stories])

  const sprintProgress = useMemo(() => {
    if (!activeSprint) return 0
    const sprintStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
    const total = sprintStories.reduce((acc, s) => acc + s.tasks.length, 0)
    if (total === 0) return 0
    const completed = sprintStories.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0)
    return Math.round((completed / total) * 100)
  }, [activeSprint, stories])

  const daysLeft = useMemo(() => {
    if (!activeSprint) return 0
    const diff = new Date(activeSprint.endDate).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [activeSprint])

  // --- Daily Performance Logic ---
  const dailyPerformance = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))
    
    return last7Days.map(day => {
      const dayStart = startOfDay(day)
      let totalSeconds = 0

      stories.forEach(story => {
        story.tasks.forEach(task => {
          if (!task.timeLogs) return
          task.timeLogs.forEach(log => {
            if (!log.startedAt || !log.endedAt) return
            const start = new Date(log.startedAt)
            if (isSameDay(start, dayStart)) {
              const end = new Date(log.endedAt)
              totalSeconds += (end.getTime() - start.getTime()) / 1000
            }
          })
        })
      })

      return {
        name: format(day, 'EEE', { locale: es }),
        fullDate: format(day, 'dd MMM', { locale: es }),
        hours: Number((totalSeconds / 3600).toFixed(2)),
        seconds: totalSeconds
      }
    })
  }, [stories])

  const todayMetrics = useMemo(() => {
    const today = dailyPerformance[dailyPerformance.length - 1]
    const seconds = today?.seconds || 0
    const hours = today?.hours || 0
    
    let formattedTime = '0 min'
    if (seconds < 3600) {
      formattedTime = `${Math.floor(seconds / 60)} min`
    } else {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      formattedTime = `${h}h ${m}m`
    }

    let status = 'Modo Calma'
    let icon = <TrendingDown className="h-4 w-4 text-muted-foreground" />
    let color = 'text-muted-foreground'

    if (hours > 6) {
      status = 'Productividad Máxima'
      icon = <Zap className="h-4 w-4 text-emerald-500" />
      color = 'text-emerald-500'
    } else if (hours > 3) {
      status = 'Enfoque Sostenido'
      icon = <Activity className="h-4 w-4 text-blue-500" />
      color = 'text-blue-500'
    } else if (hours > 0) {
      status = 'En Movimiento'
      icon = <Sparkles className="h-4 w-4 text-amber-500" />
      color = 'text-amber-500'
    }

    return { hours, status, icon, color, formattedTime }
  }, [dailyPerformance])


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
                <ShadcnTooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="lg" className="h-12 border-primary/10 hover:bg-primary/5 font-bold text-muted-foreground" onClick={handleSync}>
                      <RefreshCcw className="mr-2 h-4 w-4" /> Sincronizar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">Reparar IDs de tareas dañados</TooltipContent>
                </ShadcnTooltip>

                <ShadcnTooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="lg" className="h-12 border-primary/20 hover:bg-primary/5 font-bold" onClick={handleQuickTask}>
                      <PenLine className="mr-2 h-5 w-5" /> Tarea Rápida
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">Crear tarea sin plantilla</TooltipContent>
                </ShadcnTooltip>

                <ShadcnTooltip>
                  <TooltipTrigger asChild>
                    <Button size="lg" className="h-12 shadow-lg shadow-primary/20 font-bold" onClick={() => { void navigate('/stories') }}>
                      <Plus className="mr-2 h-5 w-5" /> Nueva Historia
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="font-bold">Empezar un nuevo flujo de historias</TooltipContent>
                </ShadcnTooltip>
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

          <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-sm overflow-hidden group">
            <CardHeader className="pb-2 text-right">
              <CardDescription className="font-bold uppercase tracking-wider text-[10px] text-emerald-600/70">Hoy: {todayMetrics.status}</CardDescription>
              <CardTitle className={`text-4xl font-black flex items-center justify-end gap-3 ${todayMetrics.color}`}>
                {todayMetrics.formattedTime}
                <Timer className="h-8 w-8 opacity-40 group-hover:rotate-12 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-right">
              <p className="text-xs text-muted-foreground font-medium flex items-center justify-end gap-1.5">
                {todayMetrics.icon} Invertido hoy
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sprint Pulse Widget (Premium) */}
        {activeSprint && (
          <Card className="border-primary/30 border-2 shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[2rem] animate-in zoom-in duration-500">
            <div className="flex flex-col lg:flex-row h-full">
              {/* Info Panel */}
              <div className="lg:w-1/3 p-8 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-r border-border/50">
                <div className="flex items-center gap-2 mb-6">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-widest px-3 py-1">Sprint Pulse</Badge>
                  <Badge variant="outline" className="animate-pulse border-emerald-500/50 text-emerald-500 text-[10px] font-bold">LIVE</Badge>
                </div>
                
                <h2 className="text-3xl font-black tracking-tight mb-2 leading-tight">{activeSprint.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-8">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{daysLeft} días restantes</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progreso de Historias</span>
                      <span className="text-sm font-black text-primary">{sprintProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                      <div className="h-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all duration-1000" style={{ width: `${String(sprintProgress)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/50 p-4 rounded-2xl border border-border/50">
                      <span className="block text-[9px] font-black text-muted-foreground uppercase mb-1">Cierre</span>
                      <span className="text-sm font-bold">{new Date(activeSprint.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="bg-card/50 p-4 rounded-2xl border border-border/50">
                        <span className="block text-[9px] font-black text-muted-foreground uppercase mb-1">Meta</span>
                        <span className="text-sm font-bold line-clamp-1">{activeSprint.goal || 'MVP Release'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 rounded-xl font-bold gap-2 text-sm shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                    onClick={() => { void navigate('/board') }}
                  >
                    <FolderKanban className="h-5 w-5" /> Abrir Tablero
                  </Button>
                </div>
              </div>

              {/* Chart Panel */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h3 className="text-lg font-black flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-primary" /> Burndown Chart
                     </h3>
                     <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Quema de horas vs. Línea de Enfoque</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-4 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Real</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-4 bg-muted-foreground/30 rounded-full" />
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ideal</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 min-h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                      <XAxis 
                        dataKey="name" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fill: 'var(--muted-foreground)', fontWeight: 700 }}
                        unit="h"
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 800 }}
                        labelStyle={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 900, marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Real" 
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorReal)" 
                        isAnimationActive={true}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Ideal" 
                        stroke="var(--muted-foreground)" 
                        strokeWidth={2}
                        strokeDasharray="8 8" 
                        fill="transparent" 
                        opacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        )}

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
                      <RechartsTooltip
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
                      <RechartsTooltip
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

        {/* Productivity Pulse - New creative section */}
        <Card className="border-border/50 shadow-xl bg-card overflow-hidden rounded-[2.5rem]">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="md:w-1/3 p-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Pulso de Productividad</span>
              </div>
              
              <h3 className="text-2xl font-black tracking-tighter mb-4 leading-tight">
                Tu ritmo de <br /> trabajo semanal
              </h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <span className="block text-[9px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Promedio Diario</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black">
                      {(dailyPerformance.reduce((acc, d) => acc + d.hours, 0) / 7).toFixed(1)}h
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">/ día</span>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <span className="block text-[9px] font-black text-primary/60 uppercase mb-1 tracking-widest">Día más Activo</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-primary">
                      {dailyPerformance.reduce((prev, current) => (prev.hours > current.hours) ? prev : current).name}
                    </span>
                    <span className="text-xs font-bold text-primary/60">
                      ({dailyPerformance.reduce((prev, current) => (prev.hours > current.hours) ? prev : current).hours}h)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 min-h-[300px]">
              <div className="flex items-center justify-between mb-10 px-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Histórico 7 días</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <div className="h-1.5 w-6 bg-primary rounded-full" />
                     <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Horas Reales</span>
                  </div>
                </div>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyPerformance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontWeight: 800 }}
                      dy={10}
                    />
                    <YAxis 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted-foreground)', fontWeight: 800 }}
                      unit="h"
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as { fullDate: string, hours: number }
                          return (
                            <div className="bg-card border border-border p-3 rounded-2xl shadow-2xl">
                              <p className="text-[9px] font-black text-primary uppercase mb-1">{data.fullDate}</p>
                              <p className="text-lg font-black">{data.hours}h <span className="text-[10px] text-muted-foreground font-bold">trabajadas</span></p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="var(--primary)" 
                      strokeWidth={5}
                      fillOpacity={1} 
                      fill="url(#pulseGradient)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

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
