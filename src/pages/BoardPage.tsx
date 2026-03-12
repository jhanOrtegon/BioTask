import { useMemo, useCallback } from 'react'
import type { DropResult } from '@hello-pangea/dnd'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useStoriesStore } from '@/features/stories/store'
import { Badge } from '@/shared/ui/badge'
import { KanbanSquare, BookOpen, CheckSquare, Calendar, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { useNavigate } from 'react-router-dom'
import { useTasksStore } from '@/features/tasks/store'
import { toast } from 'sonner'

type ColumnType = 'pending' | 'in_progress' | 'completed'

const COLUMNS: { id: ColumnType, title: string, color: string }[] = [
  { id: 'pending', title: 'Por Hacer', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  { id: 'in_progress', title: 'En Progreso', color: 'border-blue-500/30 bg-blue-500/10 text-blue-500' },
  { id: 'completed', title: 'Completada', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' }
]

export function BoardPage() {
  const navigate = useNavigate()
  const { stories, updateTask, stopTaskTimer } = useStoriesStore()
  const { startNewTask } = useTasksStore()

  // Get all active tasks across all stories
  const allTasks = useMemo(() => {
    return stories
      .filter(s => s.status === 'active')
      .flatMap(s => s.tasks.map(t => ({ ...t, storyCode: s.code, storyTitle: s.title, storyId: s.id })))
      .filter(t => t.status !== 'archived')
  }, [stories])

  const findStoryIdForTask = useCallback((taskId: string) => {
    const story = stories.find(s => s.tasks.some(t => t.id === taskId))
    return story?.id
  }, [stories])

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    
    // Dropped outside the list or no movement
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return
    }

    const taskToMove = allTasks.find(t => t.id === draggableId)
    if (!taskToMove) return

    const newStatus = destination.droppableId as ColumnType
    
    // Update store
    // This will trigger a re-render and useMemo will recalculate the tasks properly
    const statusTypeMap: Record<ColumnType, 'pending' | 'in_progress' | 'completed'> = {
      'pending': 'pending',
      'in_progress': 'in_progress',
      'completed': 'completed'
    }

    if (newStatus === 'completed') {
      stopTaskTimer(taskToMove.storyId, taskToMove.id)
    } else {
      updateTask(taskToMove.storyId, taskToMove.id, { status: statusTypeMap[newStatus] as 'pending' | 'in_progress' | 'completed' | 'archived' }, `Movido a ${COLUMNS.find(c => c.id === newStatus)?.title || newStatus} en el tablero`)
    }
  }

  const getTasksByColumn = (columnId: ColumnType) => {
    return allTasks.filter(t => t.status === columnId)
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-background">
      <Breadcrumbs items={[
        { label: 'Tablero Ágil' }
      ]} />
      <header className="shrink-0 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <KanbanSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Tablero Ágil</h1>
              <p className="text-sm text-muted-foreground">Gestiona tus tareas activas mediante Drag & Drop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-bold py-1">
              {allTasks.length} Tareas Activas
            </Badge>
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
          {COLUMNS.map(column => {
            const tasksInColumn = getTasksByColumn(column.id)

            return (
              <div key={column.id} className="flex flex-col h-full bg-muted/20 border border-border/50 rounded-2xl overflow-hidden">
                <div className={`shrink-0 px-4 py-3 border-b border-border/50 flex items-center justify-between ${column.color}`}>
                  <h3 className="font-black text-sm uppercase tracking-wider">{column.title}</h3>
                  <Badge variant="secondary" className="font-mono text-xs shadow-sm bg-background border-none">
                    {tasksInColumn.length}
                  </Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-4 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-muted/40' : ''}`}
                    >
                      <div className="flex flex-col gap-3 min-h-[50px]">
                        {tasksInColumn.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  group relative bg-card border border-border hover:border-border/80 shadow-sm rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all
                                  ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/50 rotate-2' : ''}
                                `}
                                onClick={(e) => {
                                  if (e.defaultPrevented) return
                                  // Deep recovery: search all stories if storyId is missing
                                  const sId = (task as { storyId?: string }).storyId || findStoryIdForTask(task.id)
                                  if (sId && task.id) {
                                    void navigate(`/editor/${sId}/${task.id}`)
                                  } else {
                                    console.error("Missing IDs on Kanban Card after deep recovery:", { storyId: sId, taskId: task.id, task })
                                    toast.error("Error: ID de tarea o historia no encontrado")
                                  }
                                }}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-widest text-muted-foreground border-border/50">
                                      {task.storyCode}
                                    </Badge>
                                    {task.code && (
                                      <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                        {task.code}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-1">
                                    {task.priority && (
                                      <span title={`Prioridad: ${task.priority}`} className="text-xs">
                                        {task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : task.priority === 'medium' ? '🔵' : '🟡'}
                                      </span>
                                    )}
                                    <h4 className="text-sm font-semibold leading-tight line-clamp-2">
                                      {task.title}
                                    </h4>
                                  </div>

                                  {((task.checklists && task.checklists.length > 0) || task.dueDate) && (
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                      {task.checklists && task.checklists.length > 0 && (
                                        <div className="flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded">
                                          <CheckSquare className="h-3 w-3" />
                                          <span>{task.checklists.filter((c: { completed: boolean }) => c.completed).length}/{task.checklists.length}</span>
                                        </div>
                                      )}
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0 shadow-none font-bold bg-muted/50 text-muted-foreground">
                                        {task.type}
                                      </Badge>
                                      {task.timeSpent !== undefined ? (
                                        <div className="flex items-center text-muted-foreground group-hover:text-primary transition-colors">
                                          <LiveTimer showIcon={true} timeSpent={task.timeSpent} timeLogs={task.timeLogs} className="text-[10px]" />
                                          {task.estimatedHours ? <span className="text-[9px] text-muted-foreground ml-1 font-bold">/ {task.estimatedHours}h</span> : null}
                                        </div>
                                      ) : null}
                                    </div>
                                    <div 
                                      className="grid place-items-center h-6 w-6 rounded-md hover:bg-primary/20 hover:text-primary text-muted-foreground transition-colors cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        void navigate(`/stories/${task.storyId}`)
                                      }}
                                    >
                                      <BookOpen className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {column.id === 'pending' && (
                          <button
                            className="mt-2 w-full flex items-center gap-2 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 border border-dashed border-border/40 hover:border-primary/30 rounded-xl p-3 text-xs font-semibold transition-all"
                            onClick={() => {
                              const activeStory = stories.find(s => s.status === 'active')
                              startNewTask(undefined, activeStory?.id)
                              void navigate('/editor')
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Nueva tarea en el editor...
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
