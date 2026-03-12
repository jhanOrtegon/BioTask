import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useTasksStore } from '@/features/tasks/store'
import type { TrackedTask, TimeLog } from '@/features/stories/types'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { AuditTimeline } from '@/features/stories/ui/AuditTimeline'
import { Plus, Archive, Edit, Clock, BookOpen, History, Play, Pause, Square, CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export function StoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    stories, 
    archiveTask, 
    updateTask, 
    startTaskTimer, 
    pauseTaskTimer, 
    stopTaskTimer 
  } = useStoriesStore()
  const { startNewTask } = useTasksStore()
  const story = stories.find(s => s.id === id)

  const [showTimeline, setShowTimeline] = useState(false)
  const [archiveDialog, setArchiveDialog] = useState<{ taskId: string; title: string } | null>(null)
  const [editDialog, setEditDialog] = useState<{ taskId: string; title: string } | null>(null)

  const activeTasks = useMemo(() => story?.tasks.filter(t => t.status !== 'archived') || [], [story?.tasks])

  const handleArchiveTask = (comment: string) => {
    if (!archiveDialog || !story) return
    archiveTask(story.id, archiveDialog.taskId, comment)
    toast.warning('Tarea eliminada', { description: `${archiveDialog.title} — ${comment}` })
    setArchiveDialog(null)
  }

  const handleEditComment = (comment: string) => {
    if (!editDialog || !story) return
    updateTask(story.id, editDialog.taskId, {}, comment)
    toast.success('Cambio registrado', { description: comment })
    setEditDialog(null)
  }

  const columns = useMemo<ColumnDef<TrackedTask>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Tarea',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {row.original.code && (
              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {row.original.code}
              </span>
            )}
            <p className="font-semibold text-foreground text-[13px]">{row.original.title}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {row.original.featureName || 'Sin funcionalidad'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-wider">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <Badge
            variant="outline"
            className={
              s === 'completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
              s === 'in_progress' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
              s === 'archived' ? 'border-muted text-muted-foreground bg-muted/50' :
              'border-amber-500/30 text-amber-500 bg-amber-500/10'
            }
          >
            {s === 'pending' ? 'Por Hacer' : s === 'in_progress' ? 'En Progreso' : s === 'completed' ? 'Completada' : 'Eliminada'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'timeSpent',
      header: 'Tiempo',
      cell: ({ row }) => {
        const task = row.original
        const isTimerRunning = (task.timeLogs || []).some((l: TimeLog) => !l.endedAt)
        
        return (
          <div className="flex items-center gap-2">
            <div className="bg-muted/50 px-2 py-1 flex items-center justify-center rounded border border-border/50 text-xs text-foreground font-medium">
              <LiveTimer timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs} />
              {task.estimatedHours ? <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">/ {task.estimatedHours}h</span> : null}
            </div>
            {task.status !== 'completed' && task.status !== 'archived' && (
              <div className="flex bg-muted/30 rounded-md border border-border/50">
                {!isTimerRunning ? (
                  <Button 
                    variant="ghost" size="icon" className="h-6 w-6 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                    onClick={() => { if (story) startTaskTimer(story.id, task.id) }}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" size="icon" className="h-6 w-6 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 animate-pulse"
                    onClick={() => { if (story) pauseTaskTimer(story.id, task.id) }}
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                )}
                <div className="w-px h-6 bg-border/50" />
                <Button 
                  variant="ghost" size="icon" className="h-6 w-6 text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
                  onClick={() => { if (story) stopTaskTimer(story.id, task.id) }}
                >
                  <Square className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
            {task.status === 'completed' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última Edición',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const task = row.original
        if (task.status === 'archived') return null
        return (
          <div className="flex justify-end gap-1">
            <TooltipProvider delayDuration={200}>
              {task.status === 'pending' ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                        onClick={() => { setEditDialog({ taskId: task.id, title: task.title }) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Registrar cambio</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg"
                        onClick={() => { setArchiveDialog({ taskId: task.id, title: task.title }) }}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Eliminar tarea</p></TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30 cursor-not-allowed">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {task.status === 'in_progress'
                        ? 'No se puede editar mientras está en curso'
                        : 'Esta tarea ya fue completada'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )
      },
    },
  ], [story, startTaskTimer, pauseTaskTimer, stopTaskTimer])

  const table = useReactTable({
    data: activeTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <p className="text-muted-foreground">Historia no encontrada.</p>
        <Button onClick={() => { void navigate('/stories') }}>Volver a Historias</Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background">
      <Breadcrumbs items={[
        { label: 'Historias', href: '/stories' },
        { label: story.code }
      ]} />
      {/* Header */}
      <header className="shrink-0 space-y-4 mb-4">

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {story.code}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold">{story.module}</Badge>
                  <Badge
                    variant="outline"
                    className={story.status === 'active' ? 'border-emerald-500/30 text-emerald-500' : 'border-muted text-muted-foreground'}
                  >
                    {story.status === 'active' ? 'Activa' : 'Eliminada'}
                  </Badge>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">{story.title}</h1>
              </div>
            </div>
            
            {/* Progress Bar Logics */}
            <div className="pl-13 w-full max-w-sm space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Progreso (Tareas)</span>
                <span>{activeTasks.length > 0 ? Math.round((activeTasks.filter(t => t.status === 'completed').length / activeTasks.length) * 100) : 0}% ({activeTasks.filter(t => t.status === 'completed').length}/{activeTasks.length})</span>
              </div>
              <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-in-out" 
                  style={{ width: `${String(activeTasks.length > 0 ? Math.round((activeTasks.filter(t => t.status === 'completed').length / activeTasks.length) * 100) : 0)}%` }}
                />
              </div>
              {/* Estimated Time VS Real Time */}
              {activeTasks.some(t => t.estimatedHours) && (
                 <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-1">
                   <span>Tiempo Estimado vs Real</span>
                   <span className="text-amber-500">
                     {Math.round(activeTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600 * 10) / 10}h / {activeTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)}h
                   </span>
                 </div>
              )}
            </div>

            {story.description && (
              <p className="text-sm text-muted-foreground pl-13 max-w-2xl mt-4">{story.description}</p>
            )}
            <div className="flex gap-4 text-[10px] text-muted-foreground pl-13 mt-2">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Creada: {formatDate(story.createdAt)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Editada: {formatDate(story.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold"
              onClick={() => { setShowTimeline(!showTimeline) }}
            >
              <History className="h-3.5 w-3.5" /> {showTimeline ? 'Ocultar' : 'Ver'} Historial
            </Button>
            <Button
              className="gap-2 font-bold shadow-lg shadow-primary/25 active:scale-95 transition-all"
              onClick={() => {
                startNewTask(undefined, story.id)
                void navigate('/editor')
              }}
            >
              <Plus className="h-4 w-4" /> Nueva Tarea
            </Button>
          </div>
        </div>
      </header>

      {/* Timeline (collapsible) */}
      {showTimeline && (
        <div className="shrink-0 mb-8 rounded-2xl border border-border bg-card p-6 shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
            <History className="h-4 w-4" /> Historial de Actividad
          </h3>
          <AuditTimeline entries={story.auditLog} />
        </div>
      )}

      {/* Tasks Table */}
      <div className="flex-1 min-h-0">
        <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-11 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap bg-transparent px-5">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="group border-b border-border hover:bg-secondary/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-5 align-middle border-none">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center border-none">
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                      <BookOpen className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">No hay tareas en esta historia.</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        startNewTask(undefined, story.id)
                        void navigate('/editor')
                      }} className="mt-2 text-xs font-bold rounded-lg">
                        Crear la primera tarea
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Archive Task Comment Dialog */}
      <CommentDialog
        open={!!archiveDialog}
        onOpenChange={(open) => { if (!open) setArchiveDialog(null) }}
        title="Eliminar Tarea"
        description={`"${archiveDialog?.title || ''}" se eliminará. Podrás consultarla en el historial.`}
        variant="warning"
        confirmLabel="Eliminar Tarea"
        onConfirm={handleArchiveTask}
      />

      {/* Edit Task Comment Dialog */}
      <CommentDialog
        open={!!editDialog}
        onOpenChange={(open) => { if (!open) setEditDialog(null) }}
        title="Registrar Cambio"
        description={`Documenta qué cambio realizaste en "${editDialog?.title || ''}".`}
        variant="info"
        confirmLabel="Guardar Cambio"
        onConfirm={handleEditComment}
      />
    </div>
  )
}
