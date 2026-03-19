import { useMemo } from 'react'
import { 
 Zap, 
 CheckCircle2, 
 AlertCircle, 
 TrendingUp, 
 Calendar,
 History,
 Workflow
} from 'lucide-react'
import { 
 Sheet, 
 SheetContent, 
} from '@/shared/components/sheet'
import { Badge } from '@/shared/components/badge'
import { Progress } from '@/shared/components/progress'
import { ScrollArea } from '@/shared/components/scroll-area'
import { Separator } from '@/shared/components/separator'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { formatDistanceToNow, startOfDay, isSameDay, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/shared/utils'
import type { TrackedTask, AuditEntry } from '@/features/stories/types'

interface MemberMonitoringSheetProps {
 memberId: string | null
 open: boolean
 onOpenChange: (open: boolean) => void
}

type ExtendedTask = TrackedTask & { storyCode: string }
type ExtendedLog = AuditEntry & { storyCode: string }

export function MemberMonitoringSheet({ memberId, open, onOpenChange }: MemberMonitoringSheetProps) {
 const { members } = useTeamStore()
 const { stories } = useStoriesStore()

 const member = useMemo(() => members.find(m => m.id === memberId), [members, memberId])

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
 // Collect member logs from audit log
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

 // Time tracking
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
 recentActivity: recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)
 }
 }, [member, stories])

 if (!member || !stats) return null

 const loadFactor = Math.min(100, (stats.todayHours / 8) * 100)

 return (
 <Sheet open={open} onOpenChange={onOpenChange}>
 <SheetContent className="sm:max-w-xl p-0 border-l border-border/40 bg-background/95 backdrop-blur-xl">
 <ScrollArea className="h-full">
 <div className="p-8 space-y-10">
 
 {/* Profile Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-5">
 <div className="relative">
 <img src={member.avatarUrl} className="h-20 w-20 rounded-xl border-4 border-background shadow-2xl object-cover" alt="" />
 <div className={cn(
"absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-background shadow-lg",
 stats.activeTask ?"bg-emerald-500" : (stats.blockedTask ?"bg-red-500" :"bg-slate-400")
 )} />
 </div>
 <div className="space-y-1">
 <h2 className="text-2xl font-semibold tracking-tight">{member.name}</h2>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="bg-primary/5 border-primary/20 text-xs font-medium px-2 py-0.5">
 {member.role}
 </Badge>
 <span className="text-xs font-bold text-muted-foreground">{member.specialty}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Quick Metrics */}
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-card/50 border border-border/40 p-4 rounded-xl space-y-1">
 <p className="text-xs font-semibold text-muted-foreground">Hoy</p>
 <p className="text-2xl font-semibold lining-nums">{stats.todayHours}h</p>
 </div>
 <div className="bg-card/50 border border-border/40 p-4 rounded-xl space-y-1">
 <p className="text-xs font-semibold text-muted-foreground">Semana</p>
 <p className="text-2xl font-semibold lining-nums">{stats.weekHours}h</p>
 </div>
 <div className="bg-card/50 border border-border/40 p-4 rounded-xl space-y-1">
 <p className="text-xs font-semibold text-muted-foreground">Éxitos Hoy</p>
 <div className="flex items-center gap-2">
 <p className="text-2xl font-semibold lining-nums text-emerald-500">{stats.completedToday}</p>
 <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
 </div>
 </div>
 </div>

 {/* Rendimiento */}
 <div className="space-y-4">
 <div className="flex justify-between items-end">
 <h3 className="text-sm font-semibold flex items-center gap-2">
 <TrendingUp className="h-4 w-4 text-primary" />
 Rendimiento del Ciclo
 </h3>
 <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round(loadFactor)}%</span>
 </div>
 <Progress value={loadFactor} className="h-3 rounded-full bg-secondary shadow-inner" />
 <p className="text-xs text-muted-foreground font-bold italic">
 {loadFactor > 90 ? 'Nivel de productividad crítico. Riesgo de burnout.' : 
 loadFactor > 60 ? 'Uso óptimo de la capacidad instalada.' : 
 'Capacidad disponible para nuevas asignaciones.'}
 </p>
 </div>

 <Separator className="bg-border/20" />

 {/* Activo Work */}
 <div className="space-y-5">
 <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
 <Workflow className="h-4 w-4 opacity-50" />
 Flujo de Trabajo Actual
 </h3>

 {(() => {
 const active = stats.activeTask;
 const blocked = stats.blockedTask;

 if (active) {
 return (
 <Card className="border-primary/20 bg-primary/[0.02] rounded-xl overflow-hidden">
 <div className="p-6 space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
 <span className="text-xs font-semibold text-amber-600">Trabajando ahora</span>
 </div>
 <Badge variant="outline" className="text-xs font-semibold border-primary/20">{active.storyCode}</Badge>
 </div>
 <h4 className="text-lg font-bold leading-tight">{active.title}</h4>
 <div className="grid grid-cols-2 gap-4 pt-2">
 <div className="space-y-1">
 <span className="text-xs font-semibold uppercase text-muted-foreground">Invertido</span>
 <span className="text-xs font-semibold block">{Math.floor((active.timeSpent || 0) / 3600)}h {Math.floor(((active.timeSpent || 0) % 3600) / 60)}m</span>
 </div>
 <div className="space-y-1">
 <span className="text-xs font-semibold uppercase text-muted-foreground">Estimado</span>
 <span className="text-xs font-semibold block">{active.estimatedHours}h</span>
 </div>
 </div>
 </div>
 </Card>
 );
 }

 if (blocked) {
 return (
 <Card className="border-red-500/20 bg-red-500/[0.02] rounded-xl overflow-hidden">
 <div className="p-6 space-y-4">
 <div className="flex items-center gap-2">
 <AlertCircle className="h-4 w-4 text-red-500" />
 <span className="text-xs font-medium text-red-600">Bloqueado por dependencia</span>
 </div>
 <p className="text-sm font-bold opacity-70 italic">{blocked.title}</p>
 </div>
 </Card>
 );
 }

 return (
 <div className="py-12 bg-secondary/10 rounded-xl border-2 border-dashed border-border/40 text-center space-y-3">
 <Calendar className="h-10 w-10 text-muted-foreground/20 mx-auto" />
 <p className="text-sm font-semibold text-muted-foreground opacity-40">Sin tareas activas asignadas</p>
 </div>
 );
 })()}
 </div>

 {/* Recent History */}
 <div className="space-y-6 pb-10">
 <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
 <History className="h-4 w-4 opacity-50" />
 Historial de Operaciones
 </h3>

 <div className="space-y-4">
 {stats.recentActivity.length > 0 ? (
 stats.recentActivity.map((log) => (
 <div key={log.id} className="flex gap-4">
 <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
 <History className="h-4 w-4 text-muted-foreground/60" />
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
 ))
 ) : (
 <p className="text-xs font-bold text-muted-foreground opacity-40 text-center py-4">Sin actividad registrada recientemente</p>
 )}
 </div>
 </div>

 </div>
 </ScrollArea>
 </SheetContent>
 </Sheet>
 )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
 return (
 <div className={cn("border border-border/40 bg-card p-1", className)}>
 {children}
 </div>
 )
}
