import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { useStoriesStore } from '@/features/stories/store'
import { useAuthStore } from '@/features/auth/store'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { useEpicsStore } from '@/features/epics/store'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/ui/tooltip'
import { BookOpen, Plus, PenLine, Sparkles, FolderKanban, Activity, PieChart as PieChartIcon, RefreshCcw, Zap, Timer, TrendingDown, BarChart3, Users, Layers, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, Legend } from 'recharts'
import { toast } from 'sonner'
import { format, subDays, isSameDay, startOfDay, addDays, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { generateSeedData } from '@/shared/utils/seed-data'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectValue, 
  SelectTrigger 
} from '@/shared/ui/select'

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export function Dashboard() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const { stories, syncTasksIds, setStories } = useStoriesStore()
  const { startNewTask } = useTasksStore()
  const { sprints, setSprints } = useSprintsStore()
  const { setMembers, getMemberById, members } = useTeamStore()
  const { setEpics } = useEpicsStore()
  
  const [dashboardView, setDashboardView] = useState<'general' | 'individual'>('general')
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')

  const handleSync = () => {
    syncTasksIds()
    toast.success('Sincronización completada', { description: 'Las tareas sin ID han sido reparadas.' })
  }

  const handleSeed = () => {
    if (confirm('¿Estás seguro? Esto borrará tus datos actuales y cargará la simulación de 1 mes con 15 desarrolladores.')) {
      const data = generateSeedData()
      setMembers(data.members)
      setStories(data.stories)
      setSprints(data.sprints)
      setEpics(data.epics)
      toast.success('Simulación cargada', { 
        description: 'Se han generado 20 miembros, Epics, 4 sprints y múltiples historias con tracking real de 1 mes.' 
      })
    }
  }

  const activeStories = useMemo(() => {
    const base = stories.filter(s => s.status === 'active')
    if (dashboardView === 'individual' && selectedMemberId) {
      return base.filter(s => s.tasks.some(t => t.assignedTo === selectedMemberId && t.status !== 'archived'))
    }
    return base
  }, [stories, dashboardView, selectedMemberId])

  const teamTasks = useMemo(() => stories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [stories])
  
  const individualTasks = useMemo(() => {
    if (!selectedMemberId) return []
    return teamTasks.filter(t => t.assignedTo === selectedMemberId)
  }, [teamTasks, selectedMemberId])

  const allTasksArray = useMemo(() => {
    if (dashboardView === 'individual' && selectedMemberId) return individualTasks
    return teamTasks
  }, [dashboardView, selectedMemberId, individualTasks, teamTasks])

  const totalTasksCount = useMemo(() => allTasksArray.length, [allTasksArray])

  const handleQuickTask = () => {
    startNewTask()
    void navigate('/editor')
  }

  // --- Analíticas Robustas ---
  const teamLoadData = useMemo(() => {
    const load: Record<string, number> = {}
    teamTasks.forEach(t => {
      if (t.assignedTo) {
        const member = getMemberById(t.assignedTo)
        if (member) {
          const hours = (t.timeSpent || 0) / 3600
          load[member.name] = (load[member.name] || 0) + hours
        }
      }
    })
    return Object.entries(load)
      .map(([name, Horas]) => ({ name, Horas: Number(Horas.toFixed(1)) }))
      .sort((a, b) => b.Horas - a.Horas)
      .slice(0, 8)
  }, [teamTasks, getMemberById])

  const teamSpecialtyData = useMemo(() => {
    const load: Record<string, number> = {}
    teamTasks.forEach(t => {
      if (t.assignedTo) {
        const member = getMemberById(t.assignedTo)
        if (member) {
          const spec = member.specialty || 'General'
          load[spec] = (load[spec] || 0) + (t.timeSpent || 0) / 3600
        }
      }
    })
    return Object.entries(load)
      .map(([name, Horas]) => ({ name, Horas: Number(Horas.toFixed(1)) }))
      .sort((a, b) => b.Horas - a.Horas)
  }, [teamTasks, getMemberById])

  const individualSpecialtyData = useMemo(() => {
    const load: Record<string, number> = {}
    individualTasks.forEach(t => {
      const hours = (t.timeSpent || 0) / 3600
      load[t.type] = (load[t.type] || 0) + hours
    })
    return Object.entries(load)
      .map(([name, Horas]) => ({ name, Horas: Number(Horas.toFixed(1)) }))
      .sort((a, b) => b.Horas - a.Horas)
  }, [individualTasks])

  const individualImpactData = useMemo(() => {
    if (!selectedMemberId) return []
    
    const teamTotalHours = teamTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
    const myHours = individualTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
    const avgHours = teamTotalHours / Math.max(1, members.length)

    return [
      { name: 'Mi Impacto', Horas: Number(myHours.toFixed(1)), fill: 'var(--primary)' },
      { name: 'Promedio Equipo', Horas: Number(avgHours.toFixed(1)), fill: 'var(--muted-foreground)' }
    ]
  }, [selectedMemberId, individualTasks, teamTasks, members.length])

  const currentMember = useMemo(() => {
    if (dashboardView === 'individual' && selectedMemberId) {
      return getMemberById(selectedMemberId)
    }
    return null
  }, [dashboardView, selectedMemberId, getMemberById])

  const pieData = useMemo(() => {
    const typeCount = allTasksArray.reduce<Record<string, number>>((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1
      return acc
    }, {})
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
  }, [allTasksArray])

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
    const total = sprintStories.reduce((acc: number, s) => acc + s.tasks.length, 0)
    if (total === 0) return 0
    const completed = sprintStories.reduce((acc: number, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0)
    return Math.round((completed / total) * 100)
  }, [activeSprint, stories])

  const daysLeft = useMemo(() => {
    if (!activeSprint) return 0
    const diff = new Date(activeSprint.endDate).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [activeSprint])

  // --- Daily Performance Logic ---
  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i)), [])

  const dailyPerformance = useMemo(() => {
    return last7Days.map(day => {
      const dayStart = startOfDay(day)
      let totalSeconds = 0

      stories.forEach(story => {
        story.tasks.forEach(task => {
          if (!task.timeLogs) return
          // Filter by member if in individual view
          if (dashboardView === 'individual' && selectedMemberId && task.assignedTo !== selectedMemberId) return

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
  }, [stories, dashboardView, selectedMemberId, last7Days])

  // --- Bio-Forecast Logic ---
  const bioForecast = useMemo(() => {
    if (!activeSprint || burndownData.length === 0) return null
    
    const completedStories = stories.filter(s => activeSprint.storyIds.includes(s.id) && s.tasks.every(t => t.status === 'completed'))
    const totalStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
    
    // Velocity calculation (Stories per day)
    const daysSinceStart = differenceInDays(new Date(), new Date(activeSprint.startDate)) || 1
    const velocity = completedStories.length / daysSinceStart
    
    const remainingStories = totalStories.length - completedStories.length
    const daysToFinish = velocity > 0 ? Math.ceil(remainingStories / velocity) : 99
    
    const predictedEndDate = addDays(new Date(), daysToFinish)
    const deadline = new Date(activeSprint.endDate)
    const isDelayLikely = predictedEndDate > deadline
    
    return {
      predictedEndDate,
      daysToFinish,
      isDelayLikely,
      velocity: velocity.toFixed(2),
      status: isDelayLikely ? 'danger' : (velocity > 0 ? 'healthy' : 'stagnant')
    }
  }, [activeSprint, burndownData, stories])

  const handleGenerateReport = () => {
    const today = new Date()
    const todaysWork = stories.flatMap(s => s.tasks.filter(t => 
      t.timeLogs?.some(log => isSameDay(new Date(log.startedAt), today))
    ))

    const report = `
# 🧪 BioTask Daily Lab Report - ${format(today, 'dd/MM/yyyy')}
---
## 🎯 Logros de Hoy
${todaysWork.length > 0 ? todaysWork.map(t => `- [${t.code || 'TASK'}] ${t.title} (${t.status.replace('_', ' ')})`).join('\n') : '- No hay actividad registrada hoy.'}

## 🚀 Próximos Pasos
- Continuar con el avance de las historias activas.
- Revisar cuellos de botella detectados por Bio-Forecast.

## 📊 Estado del Sprint
- **Progreso:** ${String(sprintProgress)}%
- **Pronóstico:** ${bioForecast?.isDelayLikely ? '🚩 Riesgo de Retraso' : '✅ En Tiempo'}
---
*Generado automáticamente por BioTask Synapse*
    `
    
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BioTask_Report_${format(today, 'yyyy-MM-dd')}.md`
    a.click()
    toast.success('Reporte generado', { description: 'El Lab Report ha sido descargado en formato Markdown.' })
  }

  const todayMetrics = useMemo(() => {
    const today = dailyPerformance[dailyPerformance.length - 1]
    const seconds = today.seconds
    const hours = today.hours
    
    let formattedTime = '0 min'
    if (seconds < 3600) {
      formattedTime = `${String(Math.floor(seconds / 60))} min`
    } else {
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      formattedTime = `${String(h)}h ${String(m)}m`
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

  // --- NUEVO: Métricas de Desviación para el Punto 1 del Roadmap ---
  const deviationMetrics = useMemo(() => {
    let totalEst = 0
    let totalReal = 0
    
    const typeDeviation: Record<string, { est: number, real: number }> = {
      'BE-': { est: 0, real: 0 },
      'FE-': { est: 0, real: 0 }
    }

    allTasksArray.forEach(task => { 
      const est = task.estimatedHours || 0
      const real = (task.timeSpent || 0) / 3600
      totalEst += est
      totalReal += real

      const prefix = (task as { techPrefix?: string }).techPrefix === 'BE-' ? 'BE-' : 'FE-'
      typeDeviation[prefix].est += est
      typeDeviation[prefix].real += real
    })

    const accuracy = totalEst > 0 ? Math.max(0, 100 - (Math.abs(totalReal - totalEst) / totalEst) * 100) : 100
    const status = totalReal > totalEst ? 'Excedido' : totalReal < totalEst * 0.8 ? 'Sub-estimado' : 'Saludable'
    
    return {
      totalEst: Number(totalEst.toFixed(1)),
      totalReal: Number(totalReal.toFixed(1)),
      accuracy: Math.round(accuracy),
      status,
      typeData: [
        { name: 'Backend', Estimado: Number(typeDeviation['BE-'].est.toFixed(1)), Real: Number(typeDeviation['BE-'].real.toFixed(1)) },
        { name: 'Frontend', Estimado: Number(typeDeviation['FE-'].est.toFixed(1)), Real: Number(typeDeviation['FE-'].real.toFixed(1)) }
      ]
    }
  }, [allTasksArray])
  

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              {dashboardView === 'general' ? 'Panel de Control' : `Vista: ${currentMember?.name || 'Miembro'}`}
            </h1>
            <div className="flex items-center gap-4 pl-11">
              <div className="flex bg-secondary/30 p-1 rounded-xl border border-primary/5">
                <Button 
                  variant={dashboardView === 'general' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg font-bold text-xs h-8 px-4"
                  onClick={() => { setDashboardView('general') }}
                >
                  General
                </Button>
                <Button 
                  variant={dashboardView === 'individual' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg font-bold text-xs h-8 px-4"
                  onClick={() => { setDashboardView('individual') }}
                >
                  Individual
                </Button>
              </div>

              {dashboardView === 'individual' && (
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger className="h-10 w-[220px] bg-card border-primary/10 rounded-xl font-bold text-xs shadow-sm">
                    <Users className="h-3.5 w-3.5 mr-2 text-primary" />
                    <SelectValue placeholder="Seleccionar Miembro" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id} className="text-xs font-bold font-mono">
                        {m.name} <span className="text-[9px] opacity-40 ml-1">({m.specialty})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button 
                onClick={handleGenerateReport}
                variant="outline"
                className="rounded-2xl font-bold h-12 px-6 border-primary/20 hover:bg-primary/5 gap-2 transition-all active:scale-95 shadow-lg shadow-primary/5"
            >
                <BookOpen className="h-4 w-4" /> Lab Report
            </Button>
            {role !== 'Editor' && (
              <>
                <TooltipProvider>
                  <ShadcnTooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 md:h-12 md:w-12 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        onClick={() => { handleSeed() }}
                      >
                        <Sparkles className="h-5 w-5 text-primary group-hover:scale-125 transition-transform" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-primary text-primary-foreground font-black border-none px-4 py-2">
                      Sembrar Datos Demo (4 Sprints, 20 Devs)
                    </TooltipContent>
                  </ShadcnTooltip>
                </TooltipProvider>

                <ShadcnTooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="lg" className="h-12 border-primary/10 hover:bg-primary/5 font-bold text-muted-foreground px-4" onClick={handleSync}>
                      <RefreshCcw className="h-5 w-5" />
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

        {/* Vital Status & Bio-Forecast Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-primary/20 bg-primary/5 backdrop-blur-xl relative overflow-hidden rounded-[2.5rem]">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8 relative">
                <div className="relative shrink-0">
                    <svg className="h-32 w-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" 
                            strokeDasharray={364.42}
                            strokeDashoffset={364.42 - (364.42 * sprintProgress) / 100}
                            className="text-primary transition-all duration-[2s] ease-out stroke-round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
                        <span className="text-3xl font-black">{sprintProgress}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Sincronía</span>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black px-2 py-0.5">Bio-Forecast Active</Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeSprint?.name || 'Cargando Sprint...'}</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight leading-none mb-2">Estado Vital del Sprint</h2>
                        <p className="text-sm text-muted-foreground font-medium max-w-md">
                            {bioForecast?.isDelayLikely 
                                ? `⚠️ Riesgo detectado. Al ritmo actual (${bioForecast.velocity} historias/día), el sprint podría exceder la fecha límite por ${String(Math.abs(differenceInDays(bioForecast.predictedEndDate, new Date(activeSprint?.endDate || ''))))} días.` 
                                : `✅ Ritmo óptimo. Se prevé que el sprint finalice en ${String(bioForecast?.daysToFinish || 0)} días, dentro de los parámetros esperados.`}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${bioForecast?.status === 'danger' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">{bioForecast?.status === 'danger' ? 'Retraso Crítico' : 'Flujo Saludable'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Próximo Hito</span>
                <p className="text-xl font-bold tracking-tight">Cierre de Sprint</p>
            </div>
            <div className="mt-4">
                <div className="flex items-baseline gap-2 leading-none">
                    <span className="text-6xl font-black text-foreground">{daysLeft}</span>
                    <span className="text-xl font-bold text-muted-foreground">días</span>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{activeSprint ? format(new Date(activeSprint.endDate), "eeee, dd 'de' MMMM", { locale: es }) : ''}</p>
            </div>
          </Card>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                {totalTasksCount}
                <FolderKanban className="h-8 w-8 text-blue-500/40" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground font-medium">Asociadas a historias activas</p>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br from-card to-orange-500/5 border-orange-500/10 shadow-sm`}>
            <CardHeader className="pb-2">
              <CardDescription className="font-bold uppercase tracking-wider text-xs text-orange-600">Precisión de Estimación</CardDescription>
              <CardTitle className={`text-4xl font-black flex items-center justify-between ${deviationMetrics.accuracy < 70 ? 'text-orange-600' : 'text-foreground'}`}>
                {deviationMetrics.accuracy}%
                <PieChartIcon className="h-8 w-8 opacity-40 text-orange-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-[10px] font-bold ${deviationMetrics.status === 'Excedido' ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'}`}>
                    {deviationMetrics.status}
                </Badge>
                <p className="text-[10px] text-muted-foreground font-medium">Global vs Jira Scope</p>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">

          <Card className="border-border/50 shadow-sm bg-card">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" /> Distribución
                </CardTitle>
                <CardDescription>Tipos de tareas</CardDescription>
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
                           /* eslint-disable-next-line @typescript-eslint/no-deprecated */
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
                  Sin tareas suficientes
                </div>
              )}
            </CardContent>
          </Card>

        {/* Graphics Section - Dynamically switched by view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
          {dashboardView === 'general' ? (
            <>
              {/* General View: Team Load Bar Chart */}
              <Card className="border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">Distribución de Carga</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Horas totales por desarrollador</p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-primary/40" />
                </div>
                <div className="h-[300px] w-full mt-4">
                  {teamLoadData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamLoadData} layout="vertical" margin={{ left: 40, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          style={{ fontSize: 10, fontWeight: 800, fill: 'var(--muted-foreground)' }} 
                          width={100}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                          contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }} 
                        />
                        <Bar dataKey="Horas" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs font-black uppercase tracking-widest border border-dashed border-border/50 rounded-3xl">
                      Sin datos de tiempo
                    </div>
                  )}
                </div>
              </Card>

              {/* General View: Specialty Distribution Pie Chart */}
              <Card className="border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">Fuerza por Especialidad</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Esfuerzo por capa tecnológica</p>
                  </div>
                  <PieChartIcon className="h-5 w-5 text-primary/40" />
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {teamSpecialtyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={teamSpecialtyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="Horas"
                          nameKey="name"
                        >
                          {teamSpecialtyData.map((_, index) => (
                            <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          content={({ payload }) => {
                            if (payload && payload.length) {
                              const data = payload[0].payload as { name: string, Horas: number }
                              return (
                                <div className="bg-card border border-border p-3 rounded-2xl shadow-xl">
                                  <p className="text-[10px] font-black text-primary uppercase mb-1">{data.name}</p>
                                  <p className="text-lg font-black">{data.Horas}h</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          align="center"
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', fontWeight: 800, paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 text-xs font-black uppercase tracking-widest border border-dashed border-border/50 rounded-3xl">
                      Sin datos técnicos
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Individual View: Comparative Impact Chart */}
              <Card className="border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">Impacto vs Media del Equipo</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Comparativa de horas históricas</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary/40" />
                </div>
                <div className="h-[300px] w-full mt-4">
                  {individualImpactData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={individualImpactData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                        />
                        <YAxis axisLine={false} tickLine={false} hide />
                        <RechartsTooltip 
                          content={({ payload }) => {
                            if (payload && payload.length) {
                               return (
                                 <div className="bg-card border border-border p-4 rounded-2xl shadow-2xl">
                                   <p className="text-2xl font-black text-primary">{String(payload[0].value)}h</p>
                                   <p className="text-[10px] font-black uppercase text-muted-foreground">Inversión total técnica</p>
                                 </div>
                               )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="Horas" radius={[12, 12, 0, 0]} barSize={60} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground/30 text-xs font-black uppercase tracking-widest border border-dashed border-border/50 rounded-3xl">
                      Esperando datos individuales
                    </div>
                  )}
                </div>
              </Card>

              {/* Individual View: Personal Specialty Balance */}
              <Card className="border-border/50 bg-card rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">Balance de Especialidad</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Enfoque técnico de {members.find(m => m.id === selectedMemberId)?.name.split(' ')[0]}</p>
                  </div>
                  <Layers className="h-5 w-5 text-primary/40" />
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {individualSpecialtyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={individualSpecialtyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="Horas"
                          nameKey="name"
                        >
                          {individualSpecialtyData.map((_, index) => (
                            <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          content={({ payload }) => {
                            if (payload && payload.length) {
                              const data = payload[0].payload as { name: string, Horas: number }
                              return (
                                <div className="bg-card border border-border p-3 rounded-2xl shadow-xl border-primary/20">
                                  <p className="text-[9px] font-black text-primary uppercase mb-1">{data.name}</p>
                                  <p className="text-lg font-black">{data.Horas}h <span className="text-[10px] text-muted-foreground font-bold">invertidas</span></p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend 
                          layout="vertical"
                          verticalAlign="middle" 
                          align="right"
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', fontWeight: 800, paddingLeft: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 text-xs font-black uppercase tracking-widest border border-dashed border-border/50 rounded-3xl">
                      Sin actividad registrada
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>

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
                      content={({ payload }) => {
                        if (payload.length) {
                          const data = payload[0].payload as { fullDate: string, hours: number }
                          return (
                            <div className="bg-card border border-border p-3 rounded-2xl shadow-2xl">
                              <p className="text-[9px] font-black text-primary uppercase mb-1">{data.fullDate}</p>
                              <p className="text-lg font-black">{String(data.hours)}h <span className="text-[10px] text-muted-foreground font-bold">trabajadas</span></p>
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
