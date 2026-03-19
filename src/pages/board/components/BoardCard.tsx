import { useMemo } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { 
 AlertCircle, Info, Users, Play, Pause, Square,
 MessageSquare, History 
} from 'lucide-react'
import { LiveTimer } from '@/features/tasks/components/LiveTimer'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { cn } from '@/shared/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { Progress } from '@/shared/components/progress'
import { useStoriesStore } from '@/features/stories/store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TrackedTask, AuditEntry } from '@/features/stories/types'
import type { TeamMember } from '@/features/team/types'

interface BoardCardProps {
 task: TrackedTask & { storyCode: string; storyTitle: string; storyId: string }
 index: number
 isReadOnly: boolean
 getMemberById: (id: string) => TeamMember | undefined
 pauseTaskTimer: (storyId: string, taskId: string) => void
 startTaskTimer: (storyId: string, taskId: string) => void
 stopTaskTimer: (storyId: string, taskId: string) => void
 triggerConfetti: () => void
}

export function BoardCard({
 task,
 index,
 isReadOnly,
 getMemberById,
 pauseTaskTimer,
 startTaskTimer,
 stopTaskTimer,
 triggerConfetti
}: BoardCardProps) {
 const { stories } = useStoriesStore()
 const navigate = useNavigate()
 const isTimerActive = (task.timeLogs || []).some(l => !l.endedAt)

 const taskAuditLog = useMemo<AuditEntry[]>(() => {
 const story = stories.find(s => s.id === task.storyId)
 return story?.auditLog.filter(a => a.targetId === task.id).slice(-3).reverse() || []
 }, [stories, task.id, task.storyId])

 const progress = useMemo(() => {
 const est = task.estimatedHours || 0
 const real = (task.timeSpent || 0) / 3600
 if (est === 0) return 0
 return Math.min(100, Math.round((real / est) * 100))
 }, [task.estimatedHours, task.timeSpent])

 return (
 <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isReadOnly}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={cn(
 "group relative bg-card border border-border/40 hover:border-primary/20 shadow-sm rounded-lg p-3.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md",
 snapshot.isDragging ? "shadow-xl ring-1 ring-primary/20 bg-card z-50 scale-[1.02]" : "",
 isTimerActive && "border-primary/20 ring-1 ring-primary/5 bg-primary/[0.01]",
 task.priority === 'urgent' && "before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-rose-500/40 before:animate-pulse before:pointer-events-none"
 )}
 onClick={(e) => {
 if (e.defaultPrevented || snapshot.isDragging) return;
 void navigate(`/tasks/${task.id}`);
 }}
 >
 <TooltipProvider delayDuration={500}>
 <Tooltip>
 <TooltipTrigger asChild>
 <div className="space-y-3">
 <div className="flex items-start justify-between">
 <div className="flex flex-wrap gap-1.5 min-w-0">
 <Badge variant="secondary" className="text-xs font-medium px-1.5 h-4 bg-muted/40 border-none text-muted-foreground/60">
 {task.storyCode}
 </Badge>
 {task.code && (
 <span className="font-mono text-xs font-medium text-primary bg-primary/5 border border-primary/10 px-1.5 h-4 rounded-md flex items-center tabular-nums">
 {task.code}
 </span>
 )}
 </div>
 <div className="flex gap-1 shrink-0">
 {getTaskAlertStatus(task).length > 0 && 
 getTaskAlertStatus(task).map((alert, i) => (
 <div key={i} className={cn(
 "h-4 w-4 rounded-full flex items-center justify-center text-white",
 alert.type === 'error' ? 'bg-rose-500' : 
 alert.type === 'warning' ? 'bg-amber-500' : 'bg-primary'
 )}>
 {alert.type === 'error' ? <AlertCircle className="h-2.5 w-2.5" /> : <Info className="h-2.5 w-2.5" />}
 </div>
 ))
 }
 </div>
 </div>
 
 <div className="space-y-1">
 <h4 className={cn(
 "text-[13px] font-semibold leading-tight line-clamp-2 transition-colors",
 task.status === 'completed' ? "text-muted-foreground/50 line-through" : "text-foreground/90 group-hover:text-primary"
 )}>
 {task.title}
 </h4>
 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/40 pt-0.5">
 <span className={cn(
 "px-1 rounded-sm",
 task.priority === 'urgent' ? "text-rose-500 bg-rose-500/5" :
 task.priority === 'high' ? "text-amber-500 bg-amber-500/5" :
 "opacity-50"
 )}>
 {task.priority || 'Normal'}
 </span>
 <span className="opacity-20">•</span>
 <span>{task.type}</span>
 </div>
 </div>

 <div className="pt-3 border-t border-border/10 flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex items-center gap-1.5">
 <LiveTimer timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs || []} className="text-xs font-semibold text-primary tabular-nums" showIcon />
 </div>
 {task.assignedTo && (
 <div className="h-6 w-6 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center text-xs font-semibold text-primary/60 overflow-hidden">
 {getMemberById(task.assignedTo)?.avatarUrl ? (
 <img src={getMemberById(task.assignedTo)?.avatarUrl} alt="" className="h-full w-full object-cover" />
 ) : (
 getMemberById(task.assignedTo)?.name.charAt(0) || <Users className="h-3 w-3" />
 )}
 </div>
 )}
 </div>

 <div className="flex items-center gap-1">
 {task.status !== 'completed' && !isReadOnly && (
 <>
 {isTimerActive ? (
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 rounded-md text-amber-500 hover:bg-amber-500/10"
 onClick={(e) => { e.stopPropagation(); pauseTaskTimer(task.storyId, task.id); }}
 >
 <Pause className="h-3.5 w-3.5 fill-current" />
 </Button>
 ) : (
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 rounded-md text-emerald-500 hover:bg-emerald-500/10"
 onClick={(e) => { e.stopPropagation(); startTaskTimer(task.storyId, task.id); }}
 >
 <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
 </Button>
 )}
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-7 w-7 rounded-md text-rose-500 hover:bg-rose-500/10"
 onClick={(e) => { e.stopPropagation(); stopTaskTimer(task.storyId, task.id); triggerConfetti(); }}
 >
 <Square className="h-3 w-3 fill-current" />
 </Button>
 </>
 )}
 {task.status === 'completed' && (
 <span className="text-xs font-medium text-emerald-500 opacity-60">Completada</span>
 )}
 </div>
 </div>
 </div>
 </TooltipTrigger>
 <TooltipContent side="right" className="w-[260px] p-0 border-none bg-transparent shadow-none" sideOffset={12}>
 <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
 <div className="space-y-1.5">
 <div className="flex items-center justify-between">
 <h5 className="text-xs font-semibold text-primary/60">Vista Rápida</h5>
 </div>
 <p className="text-xs font-semibold leading-tight line-clamp-2 text-foreground">{task.title}</p>
 </div>

 <div className="space-y-1.5">
 <div className="flex justify-between text-xs font-medium text-muted-foreground/60">
 <span>Progreso</span>
 <span className="tabular-nums">{progress}%</span>
 </div>
 <Progress value={progress} className="h-1.5 bg-primary/10" />
 </div>

 <div className="space-y-2.5 pt-1">
 <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/50">
 <History className="h-3 w-3" />
 <span>Historial Reciente</span>
 </div>
 <div className="space-y-2">
 {taskAuditLog.length > 0 ? taskAuditLog.map(log => (
 <div key={log.id} className="text-xs leading-relaxed border-l-2 border-primary/10 pl-2.5">
 <p className="font-medium text-foreground/80">{log.comment}</p>
 <p className="text-xs font-medium opacity-40 mt-0.5 text-muted-foreground">
 {format(new Date(log.timestamp), "HH:mm '·' dd MMM", { locale: es })}
 </p>
 </div>
 )) : (
 <p className="text-xs font-medium opacity-30 italic text-muted-foreground">Sin movimientos recientes.</p>
 )}
 </div>
 </div>

 <div className="pt-2">
 <Button variant="ghost" className="w-full h-8 rounded-lg border border-primary/10 bg-primary/5 hover:bg-primary/10 text-xs font-medium flex items-center justify-center gap-1.5 text-foreground"
 onClick={(e) => { e.stopPropagation(); void navigate(`/tasks/${task.id}/edit`); }}>
 <MessageSquare className="h-3 w-3" />
 Editar Tarea
 </Button>
 </div>
 </div>
 </TooltipContent>
 </Tooltip>
 </TooltipProvider>
 </div>
 )}
 </Draggable>
 )
}
