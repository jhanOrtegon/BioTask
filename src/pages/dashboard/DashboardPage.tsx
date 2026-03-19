import { useMemo } from 'react'
import { 
 TrendingDown, Zap, Activity, Sparkles, 
 BookOpen, BarChart2, AlertCircle, Timer
} from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { useDashboardLogic } from './hooks/useDashboardLogic'
import { DashboardHeader } from './components/DashboardHeader'
import { SprintPulseWidget } from './components/SprintPulseWidget'
import { DistributionChart } from './components/DistributionChart'
import { PerformanceTimeline } from './components/PerformanceTimeline'
import { LoadAnalysisChart } from './components/LoadAnalysisChart'
import { Card, CardContent } from '@/shared/components/card'
import { Progress } from '@/shared/components/progress'
import type { TodayMetrics } from './types'

export function Dashboard() {
 const {
 role,
 activeStories,
 totalTasksCount,
 pieData,
 teamLoadData,
 activeSprint,
 burndownData,
 sprintProgress,
 daysLeft,
 dailyPerformance,
 systemForecast,
 deviationMetrics,
 todayPerformance,
 blockedTasks,
 topPerformers,
 handleSync,
 handleSeed,
 handleQuickTask,
 handleGenerateReport,
 navigate
 } = useDashboardLogic()

 const todayMetrics: TodayMetrics = useMemo(() => {
 const { hours, seconds } = todayPerformance
 
 let formattedTime = '0 min'
 if (seconds < 3600) {
 formattedTime = `${String(Math.floor(seconds / 60))} min`
 } else {
 const h = Math.floor(seconds / 3600)
 const m = Math.floor((seconds % 3600) / 60)
 formattedTime = `${String(h)}h ${String(m)}m`
 }

 let status = 'Sin actividad'
 let icon = <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
 let color = 'text-muted-foreground'

 if (hours > 6) {
 status = 'Productividad máxima'
 icon = <Zap className="h-3.5 w-3.5 text-emerald-500" />
 color = 'text-emerald-500'
 } else if (hours > 3) {
 status = 'Enfoque sostenido'
 icon = <Activity className="h-3.5 w-3.5 text-primary" />
 color = 'text-primary'
 } else if (hours > 0) {
 status = 'En movimiento'
 icon = <Sparkles className="h-3.5 w-3.5 text-amber-500" />
 color = 'text-amber-500'
 }

 return { hours, status, icon, color, formattedTime }
 }, [todayPerformance])

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
 <div className="max-w-[1400px] mx-auto w-full space-y-6 pb-16">
 
 <DashboardHeader 
 role={role}
 onGenerateReport={handleGenerateReport}
 onSeed={handleSeed}
 onSync={handleSync}
 onQuickTask={handleQuickTask}
 onNewStory={() => { void navigate('/stories') }}
 />

 {/* ── KPIs Compactos ── */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
 {/* Historias */}
 <Card className="group hover:border-primary/20 transition-colors">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-medium text-muted-foreground mb-1">Historias Activas</p>
 <p className="text-2xl font-bold">{activeStories.length}</p>
 </div>
 <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center">
 <BookOpen className="h-4 w-4 text-primary" />
 </div>
 </CardContent>
 </Card>

 {/* Tareas */}
 <Card className="group hover:border-primary/20 transition-colors">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-medium text-muted-foreground mb-1">Tareas Activas</p>
 <p className="text-2xl font-bold">{totalTasksCount}</p>
 </div>
 <div className="h-9 w-9 rounded-lg bg-blue-500/8 flex items-center justify-center">
 <BarChart2 className="h-4 w-4 text-blue-500" />
 </div>
 </CardContent>
 </Card>

 {/* Precisión */}
 <Card className={`group hover:border-primary/20 transition-colors ${deviationMetrics.accuracy < 70 ? 'border-amber-500/20' : ''}`}>
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-medium text-muted-foreground mb-1">Precisión Estimación</p>
 <div className="flex items-center gap-2">
 <p className={`text-2xl font-bold ${deviationMetrics.accuracy < 70 ? 'text-amber-600' : ''}`}>{deviationMetrics.accuracy}%</p>
 <Badge variant="outline" className={`text-xs ${deviationMetrics.status === 'Excedido' ? 'border-destructive/30 text-destructive' : 'border-emerald-500/30 text-emerald-600'}`}>
 {deviationMetrics.status}
 </Badge>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Tiempo hoy */}
 <Card className="group hover:border-primary/20 transition-colors">
 <CardContent className="p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] font-medium text-muted-foreground mb-1">{todayMetrics.status}</p>
 <div className="flex items-center gap-2">
 <p className={`text-2xl font-bold ${todayMetrics.color}`}>{todayMetrics.formattedTime}</p>
 {todayMetrics.icon}
 </div>
 </div>
 <div className="h-9 w-9 rounded-lg bg-emerald-500/8 flex items-center justify-center">
 <Timer className="h-4 w-4 text-emerald-500" />
 </div>
 </CardContent>
 </Card>
 </div>

 {/* ── Sprint + Bloqueos / Top Performers ── */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 {/* Sprint Status */}
 {activeSprint && (
 <Card className="lg:col-span-2 overflow-hidden border-primary/15">
 <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
 {/* Ring */}
 <div className="relative shrink-0">
 <svg className="h-28 w-28 transform -rotate-90">
 <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-muted/30" />
 <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="7" fill="transparent" 
 strokeDasharray={301.59}
 strokeDashoffset={301.59 - (301.59 * sprintProgress) / 100}
 className="text-primary transition-all duration-[2s] ease-out"
 strokeLinecap="round"
 />
 </svg>
 <div className="absolute inset-0 flex items-center justify-center flex-col leading-none">
 <span className="text-2xl font-bold">{sprintProgress}%</span>
 <span className="text-xs font-medium text-muted-foreground mt-0.5">Avance</span>
 </div>
 </div>

 {/* Info */}
 <div className="flex-1 space-y-3">
 <div className="flex items-center gap-2 flex-wrap">
 <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
 Sprint Activo
 </Badge>
 <span className="text-xs font-medium text-muted-foreground">{activeSprint.name}</span>
 </div>
 <div>
 <h2 className="text-xl font-bold tracking-tight mb-1">Estado del Sprint</h2>
 <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
 {systemForecast?.isDelayLikely 
 ? `Riesgo detectado. Al ritmo actual (${systemForecast.velocity} historias/día), el sprint podría exceder la fecha límite.` 
 : `Ritmo óptimo. Se prevé que el sprint finalice en ${String(systemForecast?.daysToFinish || 0)} días, dentro de los parámetros esperados.`}
 </p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1.5">
 <div className={`h-2 w-2 rounded-full ${systemForecast?.status === 'danger' ? 'bg-destructive' : 'bg-emerald-500'}`} />
 <span className="text-xs font-medium">{systemForecast?.status === 'danger' ? 'Retraso crítico' : 'Flujo saludable'}</span>
 </div>
 <span className="text-xs text-muted-foreground">
 {daysLeft} días restantes
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Bloqueos + Team Pulse */}
 <div className="space-y-4">
 {/* Bloqueos */}
 <Card className={`overflow-hidden ${blockedTasks.length > 0 ? 'border-destructive/20' : ''}`}>
 <CardContent className="p-5 space-y-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <AlertCircle className="h-4 w-4 text-destructive/70" />
 <h3 className="text-xs font-semibold text-muted-foreground">Bloqueos</h3>
 </div>
 <span className="text-lg font-bold">{blockedTasks.length}</span>
 </div>
 <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
 {blockedTasks.length > 0 ? (
 blockedTasks.slice(0, 3).map(t => (
 <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer text-[11px]" onClick={() => { void navigate(`/tasks/${t.id}`) }}>
 <span className="font-medium line-clamp-1 flex-1">{t.title}</span>
 <Badge variant="outline" className="text-xs border-destructive/20 text-destructive ml-2 shrink-0">{t.code || 'TASK'}</Badge>
 </div>
 ))
 ) : (
 <p className="text-[11px] text-muted-foreground/50 text-center py-3">Sin bloqueos activos</p>
 )}
 </div>
 </CardContent>
 </Card>

 {/* Top Performers */}
 <Card className="overflow-hidden">
 <CardContent className="p-5 space-y-3">
 <div className="flex items-center gap-2">
 <Zap className="h-4 w-4 text-primary/70" />
 <h3 className="text-xs font-semibold text-muted-foreground">Rendimiento del Equipo</h3>
 </div>
 <div className="space-y-3">
 {topPerformers.length > 0 ? (
 topPerformers.slice(0, 3).map((p, i) => (
 <div key={p.id} className="space-y-1">
 <div className="flex items-center justify-between text-[11px]">
 <div className="flex items-center gap-2">
 <span className="text-muted-foreground/40 text-xs font-medium w-4">{i+1}.</span>
 <span className="font-medium">{p.member?.name || 'Desconocido'}</span>
 </div>
 <span className="text-primary font-semibold text-xs">{p.hours}h</span>
 </div>
 <Progress value={(p.hours / 8) * 100} className="h-1" />
 </div>
 ))
 ) : (
 <p className="text-[11px] text-muted-foreground/50 text-center py-3">Calculando rendimiento...</p>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>

 {/* ── Burndown Chart ── */}
 {activeSprint && (
 <SprintPulseWidget 
 activeSprint={activeSprint}
 daysLeft={daysLeft}
 sprintProgress={sprintProgress}
 burndownData={burndownData}
 />
 )}

 {/* ── Charts Grid ── */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <DistributionChart data={pieData} />
 <PerformanceTimeline data={dailyPerformance} />
 </div>

 <LoadAnalysisChart 
 teamLoadData={teamLoadData}
 />

 </div>
 </div>
 )
}

