import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { 
 Clock, 
 CheckCircle2, 
 LayoutTemplate, 
 Settings2, 
 ChevronRight
} from 'lucide-react'
import type { Sprint, SprintStatus } from '@/features/sprints/types'
import type { Story } from '@/features/stories/types'
import { cn } from '@/shared/utils'

interface SprintCardProps {
 sprint: Sprint
 activeStories: Story[]
 onEdit: (sprint: Sprint) => void
 onStatusChange: (id: string, status: SprintStatus) => void
 formatDate: (iso: string) => string
}

export function SprintCard({
 sprint,
 activeStories,
 onEdit,
 onStatusChange,
 formatDate
}: SprintCardProps) {
 const sprintStories = activeStories.filter(s => sprint.storyIds.includes(s.id))
 const totalTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status !== 'archived').length, 0)
 const completedTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status === 'completed').length, 0)
 const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
 const isActive = sprint.status === 'active'

 const getStatusBadge = (status: SprintStatus) => {
 switch (status) {
 case 'planning': return <Badge variant="outline" className="text-xs font-medium border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/5 py-0.5">Planificación</Badge>
 case 'active': return <Badge variant="outline" className="text-xs font-medium border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-500/5 py-0.5 animate-pulse">En Curso</Badge>
 case 'completed': return <Badge variant="outline" className="text-xs font-medium border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 py-0.5">Finalizado</Badge>
 }
 }

 return (
 <div className={cn(
 "group relative flex flex-col p-5 rounded-xl bg-card border transition-all duration-300",
 isActive ? "border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/10" : "border-border/60 shadow-sm hover:border-primary/20"
 )}>
 <div className="flex justify-between items-start mb-4">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 {getStatusBadge(sprint.status)}
 {isActive && <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-xs font-medium">Activo</Badge>}
 </div>
 <h3 className="text-base font-bold tracking-tight leading-tight group-hover:text-primary transition-colors tabular-nums">{sprint.name}</h3>
 </div>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-8 w-8 border border-border/40 rounded-lg hover:bg-primary/5 hover:text-primary transition-all opacity-40 group-hover:opacity-100"
 onClick={() => { onEdit(sprint) }}
 >
 <Settings2 className="h-4 w-4" />
 </Button>
 </div>

 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/60 mb-4">
 <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/20">
 <Clock className="h-3 w-3" />
 <span className="tabular-nums">{formatDate(sprint.startDate)}</span>
 </div>
 <ChevronRight className="h-3 w-3 opacity-20" />
 <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/20">
 <CheckCircle2 className="h-3 w-3" />
 <span className="tabular-nums">{formatDate(sprint.endDate)}</span>
 </div>
 </div>

 {sprint.goal && (
 <div className="relative mb-5 bg-muted/20 p-3 rounded-lg border border-border/20 overflow-hidden">
 <span className="text-xs font-medium text-primary/50 block mb-0.5">Objetivo</span>
 <p className="text-[11px] font-medium text-foreground/80 leading-relaxed line-clamp-2">
 "{sprint.goal}"
 </p>
 </div>
 )}

 <div className="mt-auto space-y-3">
 <div className="flex justify-between items-end mb-1">
 <div>
 <span className="block text-xs font-medium text-muted-foreground/50 mb-0.5">Avance</span>
 <span className="text-xs font-bold tabular-nums">{completedTasks} <span className="opacity-40 font-medium">/ {totalTasks}</span></span>
 </div>
 <span className={cn("text-xs font-bold tabular-nums", progress === 100 ? "text-emerald-500" : "text-primary")}>{progress}%</span>
 </div>
 <div className="h-1.5 w-full bg-muted/30 overflow-hidden rounded-full">
 <div 
 className={cn(
 "h-full transition-all duration-700 ease-out rounded-full",
 progress === 100 ? "bg-emerald-500" : "bg-primary"
 )}
 style={{ width: `${String(progress)}%` }}
 />
 </div>

 <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/20">
 <div className="flex items-center gap-1.5">
 <LayoutTemplate className="h-3.5 w-3.5 text-primary/50" />
 <span className="text-xs font-medium text-muted-foreground/70">{sprint.storyIds.length} Historias</span>
 </div>
 
 <div className="flex gap-2">
 {sprint.status === 'planning' && (
 <Button 
 size="sm" 
 className="h-7 px-3 text-xs font-semibold" 
 onClick={() => { onStatusChange(sprint.id, 'active') }}
 >
 Lanzar
 </Button>
 )}
 {sprint.status === 'active' && (
 <Button 
 size="sm" 
 variant="outline"
 className="h-7 px-3 text-xs font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10" 
 onClick={() => { onStatusChange(sprint.id, 'completed') }}
 >
 Finalizar
 </Button>
 )}
 {sprint.status === 'completed' && (
 <div className="h-7 flex items-center gap-1 text-emerald-600/60 px-2 bg-emerald-500/5 rounded-md">
 <CheckCircle2 className="h-3 w-3" />
 <span className="text-xs font-medium">Finalizado</span>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
