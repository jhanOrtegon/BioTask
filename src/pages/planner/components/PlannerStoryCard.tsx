import { Draggable, Droppable } from '@hello-pangea/dnd'
import { Badge } from '@/shared/components/badge'
import { GripVertical, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react'
import { PlannerTaskCard } from './PlannerTaskCard'
import type { Story, TrackedTask } from '@/features/stories/types'
import { cn } from '@/shared/utils'

interface PlannerStoryCardProps {
 story: Story
 index: number
 isReadOnly: boolean
 isCollapsed: boolean
 onToggleCollapse: (id: string) => void
 onUpdateTask: (storyId: string, taskId: string, data: Partial<TrackedTask>, comment: string) => void
 onNavigateToEditor: (storyId: string, taskId: string) => void
}

export function PlannerStoryCard({
 story,
 index,
 isReadOnly,
 isCollapsed,
 onToggleCollapse,
 onUpdateTask,
 onNavigateToEditor
}: PlannerStoryCardProps) {
 const completedTasks = story.tasks.filter(t => t.status === 'completed').length
 const totalTasks = story.tasks.length
 const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

 return (
 <Draggable key={story.id} draggableId={story.id} index={index} isDragDisabled={isReadOnly}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 className={cn(
 "space-y-2 transition-all duration-300",
 snapshot.isDragging ? "z-50 scale-[1.02]" : ""
 )}
 >
 <div
 className={cn(
 "flex items-center justify-between p-3 rounded-xl bg-card border transition-all duration-200 cursor-pointer group shadow-sm",
 isCollapsed ? "border-border/40 hover:border-primary/30" : "border-primary/20 bg-secondary/10 shadow-md"
 )}
 onClick={() => { onToggleCollapse(story.id) }}
 >
 <div className="flex items-center gap-3 min-w-0">
 <div {...provided.dragHandleProps} className="p-1 hover:bg-primary/10 rounded-lg transition-colors cursor-grab flex-shrink-0">
 <GripVertical className="h-4 w-4 text-muted-foreground/30" />
 </div>
 <div className="flex-shrink-0">
 {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />}
 </div>
 <Badge variant="outline" className="font-semibold text-xs border-primary/20 text-primary bg-primary/5 flex-shrink-0">
 {story.code}
 </Badge>
 <h3 className={cn(
 "text-sm font-bold truncate max-w-sm transition-colors",
 !isCollapsed ? "text-foreground" : "text-foreground/80"
 )}>{story.title}</h3>
 <div className="flex items-center gap-1.5 flex-shrink-0">
 <Badge variant="secondary" className="px-1.5 py-0 text-xs font-semibold uppercase bg-muted/40 text-muted-foreground/60">{totalTasks} Tareas</Badge>
 {progress === 100 && (
 <Badge className="px-1.5 py-0 text-xs font-semibold uppercase bg-emerald-500/10 text-emerald-600 border-none">Completado</Badge>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-4 flex-shrink-0">
 <div className="flex flex-col items-end gap-1">
 <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/40 ">
 <span className={cn("lining-nums", progress > 0 && "text-primary/70")}>{progress}%</span>
 <div className="w-12 h-1 bg-muted/40 rounded-full overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-700"
 style={{ width: `${String(progress)}%` }}
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 {!isCollapsed && (
 <Droppable droppableId={story.id} type="task">
 {(provided, snapshot) => (
 <div
 {...provided.droppableProps}
 ref={provided.innerRef}
 className={cn(
 "space-y-1.5 pl-12 pr-2 py-1 transition-all",
 snapshot.isDraggingOver ? "bg-primary/5 rounded-xl p-4 py-6 ring-1 ring-primary/10" : ""
 )}
 >
 {story.tasks.map((task, taskIndex) => (
 <PlannerTaskCard 
 key={task.id}
 task={task}
 index={taskIndex}
 isReadOnly={isReadOnly}
 onUpdateTask={onUpdateTask}
 onNavigateToEditor={onNavigateToEditor}
 />
 ))}
 {provided.placeholder}
 {story.tasks.length === 0 && (
 <div className="py-8 text-center border-2 border-dashed border-border/10 rounded-xl">
 <p className="text-xs font-bold text-muted-foreground/30 ">Inyección de tareas disponible</p>
 </div>
 )}
 </div>
 )}
 </Droppable>
 )}
 </div>
 )}
 </Draggable>
 )
}
