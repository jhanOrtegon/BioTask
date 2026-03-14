import { useMemo, useCallback, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { DropResult } from '@hello-pangea/dnd'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useStoriesStore } from '@/features/stories/store'
import { Badge } from '@/shared/ui/badge'
import { KanbanSquare, Calendar, Plus, Play, Pause, Square, ListChecks, Search, Filter, AlertCircle, Info, Users } from 'lucide-react'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { useNavigate } from 'react-router-dom'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { toast } from 'sonner'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { cn } from '@/shared/utils'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useQueryState } from 'nuqs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

type ColumnType = 'pending' | 'in_progress' | 'completed'

const COLUMNS: { id: ColumnType, title: string, color: string }[] = [
  { id: 'pending', title: 'Por Hacer', color: 'border-amber-500/30 bg-amber-500/10 text-amber-500' },
  { id: 'in_progress', title: 'En Progreso', color: 'border-blue-500/30 bg-blue-500/10 text-blue-500' },
  { id: 'completed', title: 'Completada', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' }
]

export function BoardPage() {
  const navigate = useNavigate()
  const { stories, updateTask, startTaskTimer, pauseTaskTimer, stopTaskTimer, resetTaskTimer, reorderTask, syncTasksIds } = useStoriesStore()
  const { sprints } = useSprintsStore()
  const { startNewTask } = useTasksStore()
  const { getMemberById } = useTeamStore()

  const [resetTimerDialog, setResetTimerDialog] = useState<{ storyId: string; taskId: string; title: string } | null>(null)
  
  // URL States with nuqs
  const [selectedSprintId, setSelectedSprintId] = useQueryState('sprint', { defaultValue: '' })
  const [selectedStoryId, setSelectedStoryId] = useQueryState('story', { defaultValue: 'all' })
  const [searchQuery, setSearchQuery] = useQueryState('q', { defaultValue: '' })

  const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])
  const currentSprint = useMemo(() => {
    if (selectedSprintId) return sprints.find(s => s.id === selectedSprintId)
    return activeSprint
  }, [sprints, selectedSprintId, activeSprint])

  useEffect(() => {
    syncTasksIds()
  }, [syncTasksIds])

  // Get all active tasks across all stories
  const allTasks = useMemo(() => {
    if (!currentSprint) return []

    return stories
      .filter(s => s.status === 'active' && 
        currentSprint.storyIds.includes(s.id) && 
        (selectedStoryId === 'all' || s.id === selectedStoryId)
      )
      .flatMap(s => s.tasks.map(t => ({ ...t, storyCode: s.code, storyTitle: s.title, storyId: s.id })))
      .filter(t => t.status !== 'archived' && t.id && t.storyId)
      .filter(t => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
          t.title.toLowerCase().includes(query) ||
          (t.code && t.code.toLowerCase().includes(query)) ||
          t.storyCode.toLowerCase().includes(query) ||
          t.storyTitle.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => a.position - b.position)
  }, [stories, currentSprint, selectedStoryId, searchQuery])

  const sprintStories = useMemo(() => {
    if (!currentSprint) return []
    return stories.filter(s => currentSprint.storyIds.includes(s.id))
  }, [stories, currentSprint])

  const triggerConfetti = useCallback(() => {
    void confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
    })
  }, [])

  const findStoryIdForTask = useCallback((taskId: string) => {
    const story = stories.find(s => s.tasks.some(t => t.id === taskId))
    return story?.id
  }, [stories])

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return
    }

    const taskToMove = allTasks.find(t => t.id === draggableId)
    if (!taskToMove) return

    const newStatus = destination.droppableId as ColumnType
    const statusTypeMap: Record<ColumnType, 'pending' | 'in_progress' | 'completed'> = {
      'pending': 'pending',
      'in_progress': 'in_progress',
      'completed': 'completed'
    }

    const destTasks = allTasks.filter(t => t.status === newStatus && t.id !== draggableId)
    
    let newPosition: number
    if (destTasks.length === 0) {
      newPosition = 1000
    } else if (destination.index === 0) {
      newPosition = (destTasks[0].position || 0) / 2
    } else if (destination.index >= destTasks.length) {
      newPosition = (destTasks[destTasks.length - 1].position || 0) + 1000
    } else {
      const prevPos = destTasks[destination.index - 1].position
      const nextPos = destTasks[destination.index].position
      newPosition = (prevPos + nextPos) / 2
    }

    if (newStatus === 'completed' && taskToMove.status !== 'completed') {
      stopTaskTimer(taskToMove.storyId, taskToMove.id)
      reorderTask(taskToMove.storyId, taskToMove.id, newPosition)
      triggerConfetti()
    } else {
      if (newStatus === 'pending') {
        pauseTaskTimer(taskToMove.storyId, taskToMove.id)
      } else if (newStatus === 'in_progress' && taskToMove.status !== 'in_progress') {
        startTaskTimer(taskToMove.storyId, taskToMove.id)
      }

      updateTask(
        taskToMove.storyId, 
        taskToMove.id, 
        { 
          status: statusTypeMap[newStatus],
          position: newPosition
        }, 
        `Movido a ${COLUMNS.find(c => c.id === newStatus)?.title || newStatus}`
      )
    }
  }

  const getTasksByColumn = (columnId: ColumnType) => {
    return allTasks.filter(t => t.status === columnId)
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-background">
      <div className="flex items-center justify-between shrink-0 mb-4">
        <Breadcrumbs items={[
          { label: 'Tablero Ágil', href: '/board' },
          { label: 'Power Planner' }
        ]} />
      </div>

      <header className="shrink-0 space-y-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
              <KanbanSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Tablero Ágil</h1>
                {activeSprint && (
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse">
                    Sprint Activo: {activeSprint.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {activeSprint ? 'Gestionando el flujo de trabajo actual.' : 'Tablero optimizado para metodologías ágiles.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-primary/5">
                <Select value={selectedSprintId || (activeSprint?.id || '')} onValueChange={(v) => { void setSelectedSprintId(v) }}>
                  <SelectTrigger className="h-10 w-[180px] bg-background border-none shadow-sm rounded-xl text-xs font-bold">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sprint" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sprints.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs font-bold">
                        {s.status === 'active' && '⭐ '}{s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStoryId} onValueChange={(v) => { void setSelectedStoryId(v) }}>
                  <SelectTrigger className="h-10 w-[180px] bg-background border-none shadow-sm rounded-xl text-xs font-bold">
                    <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Historia" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="text-xs font-bold">Todas las Historias</SelectItem>
                    {sprintStories.map(s => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.code}: {s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

            {activeSprint && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-4 gap-2 text-xs font-bold rounded-xl border-primary/10 bg-primary/5 text-primary hover:bg-primary/10 transition-all"
                onClick={() => { void navigate('/planner') }}
              >
                <ListChecks className="h-4 w-4" />
                Planificador
              </Button>
            )}

            <Badge variant="outline" className="h-10 px-4 rounded-xl font-mono text-xs font-black border-dashed">
              {allTasks.length} Tareas
            </Badge>
          </div>
        </div>

        <div className="relative group max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por tarea, historia o código (Jira)..." 
            value={searchQuery}
            onChange={(e) => { void setSearchQuery(e.target.value || null) }}
            className="w-full h-12 bg-card/50 border-border/50 rounded-2xl pl-12 pr-4 text-sm font-bold focus:ring-primary/20 transition-all"
          />
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        {!currentSprint ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5 p-12 text-center">
            <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10 grid place-items-center mb-6">
              <Calendar className="h-10 w-10 text-primary/40" />
            </div>
            <h2 className="text-xl font-black mb-2">No hay un sprint seleccionado</h2>
            <p className="text-muted-foreground max-w-[300px] mb-8 font-medium">
              Inicia o selecciona un sprint para ver las tareas en el tablero.
            </p>
            <Button onClick={() => void navigate('/sprints')} className="rounded-xl px-8 font-black">
              Gestión de Sprints
            </Button>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
          {COLUMNS.map(column => {
            const tasksInColumn = getTasksByColumn(column.id)

            return (
              <div key={column.id} className="flex flex-col h-full bg-secondary/10 border border-border/40 rounded-3xl overflow-hidden shadow-sm">
                <div className={cn("shrink-0 px-6 py-4 border-b border-border/40 flex items-center justify-between", column.color)}>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em]">{column.title}</h3>
                  <Badge variant="secondary" className="font-black text-[10px] bg-background/50 border-none px-2">
                    {tasksInColumn.length}
                  </Badge>
                </div>
                
                <Droppable droppableId={column.id} isDropDisabled={currentSprint.status === 'completed'}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={cn(
                        "flex-1 p-5 overflow-y-auto transition-all duration-200",
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      )}
                    >
                      <div className="flex flex-col gap-4 min-h-[50px]">
                         {tasksInColumn.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={currentSprint.status === 'completed'}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "group relative bg-card border border-border/60 hover:border-primary/40 shadow-sm rounded-[1.25rem] p-5 cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
                                  snapshot.isDragging ? "shadow-2xl ring-2 ring-primary rotate-1 z-50 bg-card" : ""
                                )}
                                onClick={(e) => {
                                  if (e.defaultPrevented || snapshot.isDragging) return
                                  const sId = task.storyId || findStoryIdForTask(task.id)
                                  if (sId && task.id) {
                                    void navigate(`/editor/${sId}/${task.id}`)
                                  }
                                }}
                              >
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-1.5 h-5 bg-muted/50 border-none">
                                        {task.storyCode}
                                      </Badge>
                                      {task.code && (
                                        <span className="font-mono text-[10px] font-black text-primary bg-primary/10 px-1.5 h-5 rounded flex items-center">
                                          {task.code}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      {getTaskAlertStatus(task).length > 0 && 
                                        getTaskAlertStatus(task).map((alert, i) => (
                                          <div key={i} className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center text-white",
                                            alert.type === 'error' ? 'bg-red-500' : 
                                            alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                                          )}>
                                            {alert.type === 'error' ? <AlertCircle className="h-3 w-3" /> : <Info className="h-3 w-3" />}
                                          </div>
                                        ))
                                      }
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <h4 className="text-sm font-bold leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                      {task.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                      <span className={cn(
                                        "px-1.5 py-0.5 rounded-md",
                                        task.priority === 'urgent' ? "bg-red-500/10 text-red-500" :
                                        task.priority === 'high' ? "bg-orange-500/10 text-orange-500" :
                                        "bg-secondary text-muted-foreground"
                                      )}>
                                        {task.priority || 'Normal'}
                                      </span>
                                      <span>•</span>
                                      <span>{task.type}</span>
                                    </div>
                                  </div>

                                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <LiveTimer timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs || []} className="text-[11px] font-black text-primary" showIcon />
                                      {task.assignedTo && (
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden shadow-sm">
                                          {getMemberById(task.assignedTo)?.avatarUrl ? (
                                            <img src={getMemberById(task.assignedTo)?.avatarUrl} alt="" className="h-full w-full object-cover" />
                                          ) : (
                                            getMemberById(task.assignedTo)?.name.charAt(0) || <Users className="h-3.5 w-3.5" />
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {task.status !== 'completed' && currentSprint.status !== 'completed' && (
                                        <>
                                          {task.timeLogs?.some(l => !l.endedAt) ? (
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-8 w-8 rounded-lg text-amber-500 hover:bg-amber-500/10"
                                              onClick={(e) => { e.stopPropagation(); pauseTaskTimer(task.storyId, task.id) }}
                                            >
                                              <Pause className="h-4 w-4 fill-current" />
                                            </Button>
                                          ) : (
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-8 w-8 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                                              onClick={(e) => { e.stopPropagation(); startTaskTimer(task.storyId, task.id) }}
                                            >
                                              <Play className="h-4 w-4 fill-current" />
                                            </Button>
                                          )}
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                                            onClick={(e) => { e.stopPropagation(); stopTaskTimer(task.storyId, task.id); triggerConfetti() }}
                                          >
                                            <Square className="h-3.5 w-3.5 fill-current" />
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {column.id === 'pending' && currentSprint.status !== 'completed' && (
                          <button
                            className="mt-2 w-full flex items-center justify-center gap-2 text-muted-foreground/30 hover:text-primary hover:bg-primary/5 border-2 border-dashed border-border/30 hover:border-primary/20 rounded-2xl py-5 text-xs font-black transition-all group/btn"
                            onClick={() => {
                              const activeStory = stories.find(s => s.status === 'active')
                              startNewTask(undefined, activeStory?.id)
                              void navigate('/editor')
                            }}
                          >
                            <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90" />
                            TAREA RÁPIDA
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
        )}
      </DragDropContext>
      
      <ConfirmDialog
        open={!!resetTimerDialog}
        onOpenChange={(open) => { if (!open) setResetTimerDialog(null) }}
        onConfirm={() => {
          if (resetTimerDialog) {
            resetTaskTimer(resetTimerDialog.storyId, resetTimerDialog.taskId)
            toast.success("Contador reiniciado")
          }
        }}
        title="¿Reiniciar Contador?"
        description={`Se perderá todo el tiempo registrado para "${resetTimerDialog?.title || 'esta tarea'}".`}
        confirmText="Reiniciar"
        variant="destructive"
      />
    </div>
  )
}
