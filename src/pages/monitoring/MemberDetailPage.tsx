import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
 Zap, 
 CheckCircle2, 
 History,
 Workflow,
 ChevronLeft,
 ArrowRight,
 Clock,
 PieChart,
 Target
} from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Progress } from '@/shared/components/progress'
import { ScrollArea } from '@/shared/components/scroll-area'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { formatDistanceToNow, startOfDay, isSameDay, subDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/shared/utils'
import type { TrackedTask, AuditEntry } from '@/features/stories/types'

type ExtendedTask = TrackedTask & { storyCode: string }
type ExtendedLog = AuditEntry & { storyCode: string }

export function MemberDetailPage() {
 const { id } = useParams()
 const navigate = useNavigate()
 const { members } = useTeamStore()
 const { stories } = useStoriesStore()

 const member = useMemo(() => members.find(m => m.id === id), [members, id])

 const stats = useMemo(() => {
 if (!member) return null

 const today = startOfDay(new Date())
 const weekAgo = subDays(today, 7)
 
 let active: ExtendedTask | null = null
 let blocked: ExtendedTask | null = null
 let todaySeconds = 0
 let weekSeconds = 0
 let completedToday = 0
 let totalAssigned = 0
 const memberTasks: ExtendedTask[] = []
 const recentActivity: ExtendedLog[] = []

 for (const story of stories) {
 for (const log of story.auditLog) {
 if (log.performedBy === member.id) {
 recentActivity.push({ ...log, storyCode: story.code })
 }
 }

 for (const task of story.tasks) {
 if (task.assignedTo !== member.id) continue
 
 totalAssigned++
 const extended: ExtendedTask = { ...task, storyCode: story.code }
 memberTasks.push(extended)

 const logs = task.timeLogs || []
 for (const log of logs) {
 const logDate = new Date(log.startedAt)
 const start = logDate.getTime()
 const end = log.endedAt ? new Date(log.endedAt).getTime() : new Date().getTime()
 const duration = (end - start) / 1000

 if (isSameDay(logDate, today)) {
 todaySeconds += duration
 }
 if (logDate >= weekAgo) {
 weekSeconds += duration
 }
 }

 if (task.status === 'in_progress') active = extended
 if (task.status === 'blocked') blocked = extended
 if (task.status === 'completed' && isSameDay(new Date(task.updatedAt), today)) completedToday++
 }
 }

 return {
 activeTask: active,
 blockedTask: blocked,
 todayHours: Number((todaySeconds / 3600).toFixed(1)),
 weekHours: Number((weekSeconds / 3600).toFixed(1)),
 completedToday,
 totalAssigned,
 memberTasks: memberTasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
 recentActivity: recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15)
 }
 }, [member, stories])

 if (!member || !stats) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
 <h2 className="text-2xl font-semibold opacity-40">Talento no encontrado</h2>
 <Button onClick={() => { void navigate('/monitoring/live') }} className="rounded-xl font-semibold uppercase text-xs tracking-wide px-8">
 Regresar al Monitoreo
 </Button>
 </div>
 )
 }

 const loadFactor = Math.min(100, (stats.todayHours / 8) * 100)

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
 <div className="max-w-[1400px] mx-auto space-y-10">
 
 {/* Superior Navigation */}
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-4">
 <Breadcrumbs items={[{ label: 'Monitoreo', href: '/monitoring/live' }, { label: 'Bio-Sincronización', href: '/monitoring/live' }, { label: member.name }]} />
 <div className="flex items-center gap-6">
 <Button 
 variant="outline" 
 size="icon" 
 className="h-12 w-12 rounded-xl border-border/40 hover:bg-secondary/50 transition-all shrink-0"
 onClick={() => { void navigate('/monitoring/live') }}
 >
 <ChevronLeft className="h-6 w-6" />
 </Button>
 <div className="flex items-center gap-5">
 <div className="relative">
 <img src={member.avatarUrl} className="h-20 w-20 rounded-xl border-4 border-background shadow-2xl object-cover" alt="" />
 <div className={cn(
"absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-background shadow-lg",
 stats.activeTask ?"bg-emerald-500 animate-pulse" : (stats.blockedTask ?"bg-red-500" :"bg-slate-400")
 )} />
 </div>
 <div className="space-y-1">
 <h1 className="text-4xl font-semibold tracking-tight leading-none">{member.name}</h1>
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="bg-primary/5 border-primary/20 text-xs font-semibold px-3 py-0.5">
 {member.role}
 </Badge>
 <span className="text-xs font-bold text-muted-foreground opacity-60">{member.specialty}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <div className="px-6 py-3 bg-secondary/20 rounded-xl border border-border/40 backdrop-blur-sm">
 <p className="text-xs font-medium text-muted-foreground opacity-60">Status de Red</p>
 <div className="flex items-center gap-2">
 <div className={cn("h-2 w-2 rounded-full", member.active ?"bg-emerald-500" :"bg-slate-400")} />
 <span className="text-sm font-semibold uppercase">{member.active ? 'Online' : 'Offline'}</span>
 </div>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Column Left: Stats & Activity */}
 <div className="lg:col-span-2 space-y-8">
 
 {/* Core Metrics Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
 <Card className="rounded-xl border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all">
 <CardContent className="p-8 space-y-4">
 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
 <Clock className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground opacity-60">Invertido Hoy</p>
 <h3 className="text-4xl font-semibold lining-nums tabular-nums tracking-tighter">{stats.todayHours}h</h3>
 </div>
 <p className="text-xs font-bold text-primary italic tracking-tighter">Tiempo productivo real</p>
 </CardContent>
 </Card>

 <Card className="rounded-xl border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-emerald-500/30 transition-all">
 <CardContent className="p-8 space-y-4">
 <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
 <CheckCircle2 className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground opacity-60">Éxitos de Hoy</p>
 <h3 className="text-4xl font-semibold lining-nums tabular-nums tracking-tighter text-emerald-500">{stats.completedToday}</h3>
 </div>
 <p className="text-xs font-bold text-emerald-600 italic tracking-tighter">Tareas finalizadas hoy</p>
 </CardContent>
 </Card>

 <Card className="rounded-xl border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden group hover:border-amber-500/30 transition-all">
 <CardContent className="p-8 space-y-4">
 <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
 <Target className="h-6 w-6" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground opacity-60">Carga Semanal</p>
 <h3 className="text-4xl font-semibold lining-nums tabular-nums tracking-tighter text-amber-600">{stats.weekHours}h</h3>
 </div>
 <p className="text-xs font-bold text-amber-700 italic tracking-tighter">Ultimos 7 dias hábiles</p>
 </CardContent>
 </Card>
 </div>

 {/* Workflow Visualizer */}
 <Card className="rounded-2xl border-border/40 bg-card/30 backdrop-blur-md overflow-hidden min-h-[400px]">
 <CardContent className="p-10 space-y-10">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-semibold flex items-center gap-3">
 <Workflow className="h-5 w-5 text-primary" />
 Flujo de Ejecución Detallado
 </h2>
 <Badge variant="outline" className="rounded-full px-4 font-semibold uppercase text-xs border-border/40">
 {stats.memberTasks.length} Tareas Asignadas
 </Badge>
 </div>

 <ScrollArea className="h-[500px] pr-6">
 <div className="space-y-6">
 {stats.memberTasks.length > 0 ? (
 stats.memberTasks.map((task) => (
 <div key={task.id} className="group relative flex items-center gap-6 p-6 rounded-xl bg-background/40 border border-border/10 hover:border-primary/20 hover:bg-background/60 transition-all">
 <div className={cn(
"h-14 w-1 flex items-center justify-center rounded-full shrink-0",
 task.status === 'completed' ?"bg-emerald-500" : task.status === 'in_progress' ?"bg-amber-500" :"bg-slate-300"
 )} />
 <div className="flex-1 space-y-2">
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="bg-primary/5 text-xs font-semibold uppercase border-primary/20">{task.storyCode}</Badge>
 <span className="text-xs font-semibold uppercase text-muted-foreground opacity-40 italic">{format(new Date(task.updatedAt), 'PPP', { locale: es })}</span>
 </div>
 <h4 className="text-base font-bold leading-tight line-clamp-1">{task.title}</h4>
 </div>
 <div className="text-right shrink-0 space-y-1">
 <span className="text-sm font-semibold block tabular-nums text-primary">{Math.floor((task.timeSpent || 0) / 3600)}h {Math.floor(((task.timeSpent || 0) % 3600) / 60)}m</span>
 <span className="text-xs font-semibold uppercase text-muted-foreground opacity-40 tracking-wide">Invertidos</span>
 </div>
 <button
 onClick={() => { void navigate(`/editor/${task.storyId}/${task.id}`) }}
 className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
 >
 <ArrowRight className="h-4 w-4" />
 </button>
 </div>
 ))
 ) : (
 <div className="py-20 text-center space-y-4 opacity-30">
 <PieChart className="h-12 w-12 mx-auto text-muted-foreground" />
 <p className="text-sm font-semibold">Sin historial de tareas</p>
 </div>
 )}
 </div>
 </ScrollArea>
 </CardContent>
 </Card>

 </div>

 {/* Column Right: Live Context & History */}
 <div className="space-y-8">
 
 {/* Productividad Radar */}
 <Card className="rounded-xl border-primary/20 bg-primary/[0.02] overflow-hidden">
 <CardContent className="p-8 space-y-6">
 <div className="flex justify-between items-center">
 <h3 className="text-xs font-semibold text-primary/60">Productividad</h3>
 <Badge className="bg-primary text-white text-xs font-semibold px-2 py-0 border-none">{Math.round(loadFactor)}%</Badge>
 </div>
 <Progress value={loadFactor} className="h-4 bg-primary/10 rounded-full" />
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 rounded-xl bg-background/50 border border-border/40">
 <p className="text-xs font-semibold text-muted-foreground uppercase opacity-60">Capacidad</p>
 <p className="text-xl font-semibold">8h/día</p>
 </div>
 <div className="p-4 rounded-xl bg-background/50 border border-border/40">
 <p className="text-xs font-semibold text-muted-foreground uppercase opacity-60">Eficiencia</p>
 <p className="text-xl font-semibold">{(loadFactor * 0.9).toFixed(1)}%</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Espacio de Trabajo Activo */}
 <div className="space-y-4">
 <h3 className="text-xs font-semibold text-muted-foreground/40 pl-4">Espacio de Trabajo Activo</h3>
 {stats.activeTask ? (
 <Card className="rounded-xl border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden relative group">
 <div className="absolute top-0 right-0 p-6">
 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
 </div>
 <CardContent className="p-8 space-y-6">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Zap className="h-4 w-4 text-emerald-500" />
 <span className="text-xs font-medium text-emerald-600">Procesando Ahora</span>
 </div>
 <h4 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => { void navigate(`/editor/${stats.activeTask?.storyId ?? ''}/${stats.activeTask?.id ?? ''}`) }}>
 {stats.activeTask.title}
 </h4>
 </div>
 <div className="space-y-3">
 <div className="flex justify-between text-xs font-semibold uppercase">
 <span>Progreso Estimado</span>
 <span>{Math.min(100, Math.round(((stats.activeTask.timeSpent || 0) / (stats.activeTask.estimatedHours || 1) / 3600) * 100))}%</span>
 </div>
 <Progress value={((stats.activeTask.timeSpent || 0) / (stats.activeTask.estimatedHours || 1) / 3600) * 100} className="h-2 rounded-full" />
 </div>
 </CardContent>
 </Card>
 ) : (
 <div className="p-10 bg-secondary/10 rounded-xl border-2 border-dashed border-border/20 text-center space-y-3 grayscale opacity-50">
 <Clock className="h-10 w-10 mx-auto text-muted-foreground/40" />
 <p className="text-xs font-bold">Sin proceso activo detectado</p>
 </div>
 )}
 </div>

 {/* Registro de Auditoría */}
 <div className="space-y-4">
 <h3 className="text-xs font-semibold text-muted-foreground/40 pl-4">Registro Operativo Reciente</h3>
 <Card className="rounded-xl border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden">
 <CardContent className="p-6 space-y-6">
 {stats.recentActivity.map((log) => (
 <div key={log.id} className="flex gap-4 group/item">
 <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
 <History className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover/item:text-primary" />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold leading-tight">
 <span className="text-primary font-semibold mr-1.5">{log.storyCode}</span>
 {log.comment}
 </p>
 <p className="text-xs font-semibold text-muted-foreground/60 uppercase">
 {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: es })}
 </p>
 </div>
 </div>
 ))}
 <Button 
 variant="ghost" 
 className="w-full h-12 rounded-xl font-semibold text-xs text-muted-foreground hover:text-primary"
 onClick={() => { void navigate('/monitoring/activity', { state: { userId: id } }) }}
 >
 Ver Rastreo Completo
 </Button>
 </CardContent>
 </Card>
 </div>

 </div>

 </div>

 </div>

 <div className="fixed -bottom-48 -left-48 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 <div className="fixed -top-48 -right-48 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
