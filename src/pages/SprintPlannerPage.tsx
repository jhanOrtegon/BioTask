import { useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { Badge } from '@/shared/ui/badge'
import { 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  Zap, 
  Target, 
  BarChart3,
  Search,
  LayoutGrid,
  Filter,
  ArrowRight
} from 'lucide-react'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/shared/ui/card'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Cell
} from 'recharts'

export function SprintPlannerPage() {
  const navigate = useNavigate()
  const { stories, moveTaskToStory, reorderTask, updateTask, reorderStory } = useStoriesStore()
  const { sprints } = useSprintsStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedStories, setCollapsedStories] = useState<Record<string, boolean>>({})

  const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])
  const isReadOnly = useMemo(() => activeSprint?.status === 'completed', [activeSprint])

  const sprintStories = useMemo(() => {
    if (!activeSprint) return []
    return stories
      .filter(s => activeSprint.storyIds.includes(s.id))
      .map(s => ({
        ...s,
        tasks: s.tasks
          .filter(t => t.status !== 'archived')
          .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
          .sort((a, b) => a.position - b.position)
      }))
      .filter(s => s.tasks.length > 0 || searchQuery === '')
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  }, [stories, activeSprint, searchQuery])

  const stats = useMemo(() => {
    const allTasks = sprintStories.flatMap(s => s.tasks)
    const totalHours = allTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
    const spentHours = allTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
    const completedTasks = allTasks.filter(t => t.status === 'completed').length
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length

    const chartData = [
      { name: 'Pendientes', value: pendingTasks, color: 'hsl(var(--muted-foreground))' },
      { name: 'En Proceso', value: inProgressTasks, color: 'hsl(var(--primary))' },
      { name: 'Completadas', value: completedTasks, color: '#22c55e' }
    ]

    return {
      totalTasks: allTasks.length,
      completedTasks,
      inProgressTasks,
      totalHours,
      spentHours: parseFloat(spentHours.toFixed(1)),
      progress: allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0,
      chartData
    }
  }, [sprintStories])

  const toggleStoryCollapse = (id: string) => {
    setCollapsedStories(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result
    
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'story') {
      const otherStories = sprintStories.filter(s => s.id !== draggableId)
      let newPosition: number

      if (otherStories.length === 0) {
        newPosition = 1000
      } else if (destination.index === 0) {
        newPosition = (otherStories[0].position || 0) / 2
      } else if (destination.index >= otherStories.length) {
        newPosition = (otherStories[otherStories.length - 1].position || 0) + 1000
      } else {
        const prevPos = otherStories[destination.index - 1].position || 0
        const nextPos = otherStories[destination.index].position || 0
        newPosition = (prevPos + nextPos) / 2
      }
      reorderStory(draggableId, newPosition)
      return
    }

    const sourceStoryId = source.droppableId
    const destStoryId = destination.droppableId
    
    const destStory = sprintStories.find(s => s.id === destStoryId)
    if (!destStory) return

    const otherTasks = destStory.tasks.filter(t => t.id !== draggableId)
    let newPosition: number

    if (otherTasks.length === 0) {
      newPosition = 1000
    } else if (destination.index === 0) {
      newPosition = (otherTasks[0].position || 0) / 2
    } else if (destination.index >= otherTasks.length) {
      newPosition = (otherTasks[otherTasks.length - 1].position || 0) + 1000
    } else {
      const prevPos = otherTasks[destination.index - 1].position || 0
      const nextPos = otherTasks[destination.index].position || 0
      newPosition = (prevPos + nextPos) / 2
    }

    if (sourceStoryId === destStoryId) {
      reorderTask(sourceStoryId, draggableId, newPosition)
    } else {
      moveTaskToStory(sourceStoryId, destStoryId, draggableId, newPosition)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-3xl overflow-hidden p-6 gap-6">
      <div className="flex items-center justify-between shrink-0">
        <Breadcrumbs items={[
          { label: 'Tablero Ágil', href: '/board' },
          { label: 'Power Planner' }
        ]} />
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <Badge variant="outline" className="bg-muted border-muted-foreground/30 text-muted-foreground font-black px-3 py-1 text-[10px] uppercase tracking-wider">
              Solo Lectura (Sprint Finalizado)
            </Badge>
          )}
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black px-3 py-1 text-[10px] uppercase tracking-wider animate-pulse">
            <Zap className="h-3 w-3 mr-1 fill-primary" /> Modo Planificación Activo
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar - Analytics & Stats */}
        <aside className="w-80 shrink-0 flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/5">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-black text-sm uppercase tracking-tight">Sprint Pulse</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    <span>Progreso General</span>
                    <span className="text-primary">{Math.round(stats.progress).toString()}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary),0.5)]"
                      style={{ width: `${String(stats.progress)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Carga Estimada</div>
                    <div className="text-lg font-black">{stats.totalHours}h</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                    <div className="text-[10px] font-bold text-primary/70 uppercase mb-1">Tiempo Real</div>
                    <div className="text-lg font-black">{stats.spentHours}h</div>
                  </div>
                </div>
              </div>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9, fontWeight: 700 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${String(index)}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-md flex-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-black text-sm uppercase tracking-tight">Objetivos del Sprint</h3>
              </div>

              <div className="space-y-4">
                {sprintStories.map(story => (
                  <div key={story.id} className="group relative">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-3 w-3 rounded-full border-2 border-primary/30 group-hover:border-primary transition-colors ${story.tasks.every(t => t.status === 'completed') ? 'bg-primary' : ''}`} />
                      <div>
                        <div className="text-[10px] font-bold text-primary mb-0.5">{story.code}</div>
                        <p className="text-xs font-bold leading-tight line-clamp-2">{story.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Area - Planner List */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          <header className="flex items-center gap-4 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por título de tarea..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value) }}
                className="w-full bg-card/50 border border-border/50 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted/20 border border-border/50 rounded-2xl">
              <button className="p-2 bg-card rounded-xl shadow-sm"><LayoutGrid className="h-4 w-4" /></button>
              <button className="p-2 text-muted-foreground hover:text-foreground"><Filter className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto pr-2 pb-20">
            {!activeSprint ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12" />
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="stories" type="story" isDropDisabled={isReadOnly}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                      {sprintStories.map((story, storyIndex) => (
                        <Draggable key={story.id} draggableId={story.id} index={storyIndex} isDragDisabled={isReadOnly}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`space-y-3 ${snapshot.isDragging ? 'z-50' : ''}`}
                            >
                              <div
                                className="flex items-center justify-between p-3 rounded-2xl bg-muted/10 border border-border/50 hover:bg-muted/20 transition-all cursor-pointer group"
                                onClick={() => { toggleStoryCollapse(story.id) }}
                              >
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="p-1 hover:bg-primary/10 rounded-md transition-colors cursor-grab">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                                  </div>
                                  {collapsedStories[story.id] ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  <Badge variant="outline" className="font-black text-[10px] border-primary/20 text-primary">
                                    {story.code}
                                  </Badge>
                                  <h3 className="text-xs font-black uppercase tracking-tight truncate max-w-sm">{story.title}</h3>
                                  <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-bold">{story.tasks.length} Tareas</Badge>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                                     <span>{Math.round((story.tasks.filter(t => t.status === 'completed').length / story.tasks.length) * 100 || 0).toString()}%</span>
                                     <ArrowRight className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>

                              {!collapsedStories[story.id] && (
                                <Droppable droppableId={story.id} type="task">
                                  {(provided, snapshot) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className={`space-y-2 pl-12 transition-all ${snapshot.isDraggingOver ? 'bg-primary/5 rounded-2xl p-2' : ''}`}
                                    >
                                      {story.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                          {(provided, snapshot) => (
                                            <Card
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`
                                                group border-border/50 hover:border-primary/50 transition-all cursor-default overflow-hidden
                                                ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/50 scale-[1.01] bg-card z-50' : 'bg-card/40'}
                                              `}
                                            >
                                              <CardContent className="p-0">
                                                <div className="flex items-stretch">
                                                  <div
                                                    {...provided.dragHandleProps}
                                                    className="w-8 flex items-center justify-center bg-muted/10 group-hover:bg-primary/5 transition-colors border-r border-border/50"
                                                  >
                                                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/40" />
                                                  </div>

                                                  <div className="flex-1 p-4 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1">
                                                      <div className="flex flex-col gap-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 rounded-md border ${
                                                            task.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            task.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20' :
                                                            'bg-muted text-muted-foreground border-border/50'
                                                          }`}>
                                                            {task.status.replace('_', ' ')}
                                                          </span>
                                                          <span className="text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
                                                        </div>
                                                        <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors truncate">
                                                          {task.title}
                                                        </h4>
                                                      </div>
                                                    </div>

                                                    <div className="flex items-center gap-6 shrink-0">
                                                      <div className="flex items-center gap-4 border-r border-border/50 pr-4">
                                                        <div className="flex flex-col items-end">
                                                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Estimado</span>
                                                          <div className="flex items-center gap-1">
                                                            {isReadOnly ? (
                                                              <span className="w-8 text-right font-black text-xs px-1 text-muted-foreground">{task.estimatedHours || 0}</span>
                                                            ) : (
                                                              <input
                                                                type="number"
                                                                defaultValue={task.estimatedHours}
                                                                onBlur={(e) => { updateTask(task.storyId, task.id, { estimatedHours: Number(e.target.value) }, 'Estimación actualizada desde el planificador') }}
                                                                className="w-8 bg-transparent text-right font-black text-xs hover:bg-muted/30 rounded px-1 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/30"
                                                              />
                                                            )}
                                                            <span className="text-[10px] font-bold">h</span>
                                                          </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Real</span>
                                                          <div className="flex items-center gap-1 text-primary">
                                                             <LiveTimer showIcon={false} timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs} className="text-[11px] font-mono font-black" />
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <button
                                                        onClick={(e) => {
                                                          e.preventDefault()
                                                          e.stopPropagation()
                                                          void navigate(`/editor/${task.storyId}/${task.id}`)
                                                        }}
                                                        className="p-2 rounded-xl bg-muted/20 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group/btn"
                                                      >
                                                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              </CardContent>
                                            </Card>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </main>
      </div>

      {/* Decorative Blur Elements */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10" />
    </div>
  )
}
