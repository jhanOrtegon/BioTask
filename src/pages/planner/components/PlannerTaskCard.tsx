import { Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/shared/components/card'
import { GripVertical, ArrowRight } from 'lucide-react'
import { LiveTimer } from '@/features/tasks/components/LiveTimer'
import type { TrackedTask } from '@/features/stories/types'
import { cn } from '@/shared/utils'

interface PlannerTaskCardProps {
 task: TrackedTask
 index: number
 isReadOnly: boolean
 onUpdateTask: (storyId: string, taskId: string, data: Partial<TrackedTask>, comment: string) => void
 onNavigateToEditor: (storyId: string, taskId: string) => void
}

export function PlannerTaskCard({
 task,
 index,
 isReadOnly,
 onUpdateTask,
 onNavigateToEditor
}: PlannerTaskCardProps) {
 const isCompleted = task.status === 'completed'
 const isProgress = task.status === 'in_progress'

 return (
 <Draggable key={task.id} draggableId={task.id} index={index}>
 {(provided, snapshot) => (
 <Card
 ref={provided.innerRef}
 {...provided.draggableProps}
 className={cn(
 "group border-border/40 hover:border-primary/40 transition-all cursor-default overflow-hidden rounded-xl",
 snapshot.isDragging ? "shadow-xl ring-1 ring-primary/20 scale-[1.01] bg-card z-50" : "bg-card/30"
 )}
 >
 <CardContent className="p-0">
 <div className="flex items-stretch">
 <div
 {...provided.dragHandleProps}
 className="w-7 flex items-center justify-center bg-muted/5 group-hover:bg-primary/5 transition-colors border-r border-border/10 flex-shrink-0"
 >
 <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-primary/40" />
 </div>

 <div className="flex-1 p-3 px-4 flex items-center justify-between gap-4">
 <div className="flex items-center gap-4 min-w-0 flex-1">
 <div className="flex flex-col gap-0.5 min-w-0">
 <div className="flex items-center gap-2">
 <span className={cn(
 "text-xs font-mediumr px-1.5 rounded-md border",
 isCompleted ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
 isProgress ? "bg-primary/10 text-primary border-primary/20" :
 "bg-muted/40 text-muted-foreground/60 border-border/10"
 )}>
 {task.status.replace('_', ' ')}
 </span>
 <span className="text-xs font-semibold text-muted-foreground/30 lining-nums">POS_{index + 1}</span>
 </div>
 <h4 className={cn(
 "font-bold text-xs leading-tight transition-colors truncate",
 isCompleted ? "text-muted-foreground/60 line-through" : "text-foreground/90 group-hover:text-primary"
 )}>
 {task.title}
 </h4>
 </div>
 </div>

 <div className="flex items-center gap-6 shrink-0">
 <div className="flex items-center gap-4 border-r border-border/10 pr-4">
 <div className="flex flex-col items-end">
 <span className="text-xs font-semibold text-muted-foreground/30 ">Est</span>
 <div className="flex items-center gap-1">
 {isReadOnly ? (
 <span className="w-6 text-right font-semibold text-[11px] px-1 text-muted-foreground/60 lining-nums">{task.estimatedHours || 0}</span>
 ) : (
 <input
 type="number"
 defaultValue={task.estimatedHours}
 onBlur={(e) => { onUpdateTask(task.storyId, task.id, { estimatedHours: Number(e.target.value) }, 'Estimación actualizada') }}
 className="w-8 bg-transparent text-right font-semibold text-[11px] hover:bg-muted/30 rounded px-1 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20 lining-nums"
 />
 )}
 <span className="text-xs font-semibold opacity-30 ">h</span>
 </div>
 </div>
 <div className="flex flex-col items-end">
 <span className="text-xs font-semibold text-muted-foreground/30 ">Real</span>
 <div className="flex items-center gap-1 text-primary/80">
 <LiveTimer showIcon={false} timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs} className="text-[11px] font-mono font-semibold lining-nums" />
 </div>
 </div>
 </div>

 <button
 onClick={(e) => {
 e.preventDefault()
 e.stopPropagation()
 onNavigateToEditor(task.storyId, task.id)
 }}
 className="p-1.5 rounded-lg bg-muted/20 text-muted-foreground/40 hover:bg-primary/5 hover:text-primary transition-all group/btn"
 title="Analizar Tarea"
 >
 <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
 </button>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )}
 </Draggable>
 )
}
