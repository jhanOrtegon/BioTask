import { Droppable } from '@hello-pangea/dnd'
import { Badge } from '@/shared/components/badge'
import { Plus } from 'lucide-react'
import { cn } from '@/shared/utils'
import { BoardCard } from './BoardCard'
import type { TrackedTask } from '@/features/stories/types'
import type { TeamMember } from '@/features/team/types'

interface BoardColumnProps {
 id: string
 title: string
 tasks: (TrackedTask & { storyCode: string; storyTitle: string; storyId: string })[]
 isCompletedSprint: boolean
 onQuickTask: () => void;
 getMemberById: (id: string) => TeamMember | undefined;
 pauseTaskTimer: (storyId: string, taskId: string) => void;
 startTaskTimer: (storyId: string, taskId: string) => void;
 stopTaskTimer: (storyId: string, taskId: string) => void;
 triggerConfetti: () => void;
}

const COLUMN_STYLES: Partial<Record<string, { bg: string, border: string, text: string, accent: string }>> = {
 pending: {
 bg: 'bg-amber-500/[0.03]',
 border: 'border-amber-500/15',
 text: 'text-amber-700 dark:text-amber-400',
 accent: 'bg-amber-500'
 },
 in_progress: {
 bg: 'bg-blue-500/[0.03]',
 border: 'border-blue-500/15',
 text: 'text-blue-700 dark:text-blue-400',
 accent: 'bg-blue-500'
 },
 qa: {
 bg: 'bg-violet-500/[0.03]',
 border: 'border-violet-500/15',
 text: 'text-violet-700 dark:text-violet-400',
 accent: 'bg-violet-500'
 },
 blocked: {
 bg: 'bg-rose-500/[0.03]',
 border: 'border-rose-500/15',
 text: 'text-rose-700 dark:text-rose-400',
 accent: 'bg-rose-500'
 },
 completed: {
 bg: 'bg-emerald-500/[0.03]',
 border: 'border-emerald-500/15',
 text: 'text-emerald-700 dark:text-emerald-400',
 accent: 'bg-emerald-500'
 }
}

export function BoardColumn({
 id,
 title,
 tasks,
 isCompletedSprint,
 onQuickTask,
 getMemberById,
 pauseTaskTimer,
 startTaskTimer,
 stopTaskTimer,
 triggerConfetti
}: BoardColumnProps) {
 const styles = COLUMN_STYLES[id] || {
 bg: 'bg-secondary/5',
 border: 'border-border/10',
 text: 'text-foreground/70',
 accent: 'bg-muted'
 }

 return (
 <div className="flex flex-col h-full bg-card/30 border border-border/40 rounded-xl shadow-sm transition-all duration-300 hover:border-primary/10 overflow-hidden">
 <div className={cn("h-[3px] w-full shrink-0", styles.accent)} />
 <div className={cn(
 "sticky top-0 z-20 shrink-0 px-4 py-2.5 border-b flex items-center justify-between backdrop-blur-xl transition-colors",
 styles.bg,
 styles.border
 )}>
 <div className="flex items-center gap-2">
 <div className={cn("h-1.5 w-1.5 rounded-full", styles.accent)} />
 <h3 className={cn("font-semibold text-sm", styles.text)}>
 {title}
 </h3>
 </div>
 <Badge variant="outline" className={cn(
 "font-semibold text-xs border-none px-2 py-0.5 tabular-nums rounded-full",
 styles.bg,
 styles.text
 )}>
 {tasks.length}
 </Badge>
 </div>
 
 <Droppable droppableId={id} isDropDisabled={isCompletedSprint}>
 {(provided, snapshot) => (
 <div
 {...provided.droppableProps}
 ref={provided.innerRef}
 className={cn(
 "flex-1 p-3 overflow-y-auto transition-all duration-200",
 snapshot.isDraggingOver ? "bg-primary/[0.02]" : ""
 )}
 >
 <div className="flex flex-col gap-3 min-h-[50px]">
 {tasks.map((task, index) => (
 <BoardCard 
 key={task.id}
 task={task}
 index={index}
 isReadOnly={isCompletedSprint}
 getMemberById={getMemberById}
 pauseTaskTimer={pauseTaskTimer}
 startTaskTimer={startTaskTimer}
 stopTaskTimer={stopTaskTimer}
 triggerConfetti={triggerConfetti}
 />
 ))}
 {provided.placeholder}
 
 {id === 'pending' && !isCompletedSprint && (
 <button
 className="mt-1 w-full flex items-center justify-center gap-2 text-muted-foreground/50 hover:text-primary hover:bg-primary/5 border border-dashed border-border/40 hover:border-primary/30 rounded-lg py-3 text-xs font-semibold transition-all group/btn"
 onClick={onQuickTask}
 >
 <Plus className="h-3.5 w-3.5 transition-transform group-hover/btn:rotate-90" />
 Agregar Tarea
 </button>
 )}
 </div>
 </div>
 )}
 </Droppable>
 </div>
 )
}
