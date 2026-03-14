import { useState, useMemo, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { AuditTimeline } from '@/features/stories/ui/AuditTimeline'
import { Plus, Archive, Edit, Clock, BookOpen, History, Play, Pause, Square, CheckCircle2, Eye, GripVertical, FileDown, Layers3, Copy, CopyCheck, Tag, Users, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { DynamicTaskEditor } from '@/features/tasks/ui/DynamicTaskEditor'
import type { TaskDraft } from '@/features/tasks/types'
import { toast } from 'sonner'
import { cn } from '@/shared/utils'
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
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { Pagination } from '@/shared/ui/pagination'
import { RotateCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'

const storyUpdateSchema = z.object({
  code: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  module: z.string().min(1, 'El módulo es obligatorio'),
  description: z.string().optional(),
})

type StoryUpdateValues = z.infer<typeof storyUpdateSchema>

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
    startTaskTimer,
    pauseTaskTimer,
    stopTaskTimer,
    resetTaskTimer,
    updateTask,
    updateStory,
    addTaskToStory
  } = useStoriesStore()
  const { startNewTask } = useTasksStore()
  const { getMemberById } = useTeamStore()

  const { sprints } = useSprintsStore()
  const story = useMemo(() => stories.find(s => s.id === id), [stories, id])
  const sprintForStory = useMemo(() => sprints.find(s => s.storyIds.includes(story?.id || '')), [sprints, story?.id])
  const isReadOnly = useMemo(() => sprintForStory?.status === 'completed', [sprintForStory])

  const triggerConfetti = useCallback(() => {
    void confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
    })
  }, [])

  const findStoryIdForTask = useCallback((taskId: string) => {
    const storyMatch = stories.find(s => s.tasks.some(t => t.id === taskId))
    return storyMatch?.id
  }, [stories])

  const [showTimeline, setShowTimeline] = useState(false)
  const [archiveDialog, setArchiveDialog] = useState<{ taskId: string; title: string } | null>(null)
  const [resetTimerDialog, setResetTimerDialog] = useState<{ taskId: string; title: string } | null>(null)
  const [viewTask, setViewTask] = useState<TrackedTask | null>(null)
  const [editStoryDialog, setEditStoryDialog] = useState(false)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState<{ title: string; desc: string } | null>(null)
  
  // New features states
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const activeTasks = useMemo(() => (story?.tasks.filter(t => t.status !== 'archived') || []).sort((a, b) => (a.position || 0) - (b.position || 0)), [story?.tasks])

  const generatedMarkdown = useMemo(() => {
    if (!story) return ''
    let md = `# [${story.code}] ${story.title}\n\n`
    md += `**Módulo:** ${story.module}\n`
    md += `**Estado:** ${story.status === 'active' ? '🟢 Activa' : '⚪ Archivada'}\n`
    if (story.description) md += `\n## Descripción\n${story.description}\n`
    
    md += `\n---\n\n# 📋 Desglose de Tareas Técnicas\n\n`
    
    activeTasks.forEach(task => {
      md += `## [${task.code || 'TASK'}] ${task.title}\n`
      md += `**Tipo:** ${task.type} | **Estado:** ${task.status} | **Estimado:** ${String(task.estimatedHours || 0)}h\n\n`
      
      if (task.data.objective) {
        md += `### 🎯 Objetivo\n${task.data.objective}\n\n`
      }
      
      if (task.data.services.length > 0) {
        md += `### 🔌 Servicios / API\n`
        task.data.services.forEach(s => {
          md += `- **${s.name}** (${s.method || 'GET'}): ${s.url}\n`
        })
        md += `\n`
      }

      if (task.data.requirements.length > 0) {
        md += `### 📝 Requerimientos\n`
        task.data.requirements.forEach(r => { md += `- ${r}\n` })
        md += `\n`
      }

      if (task.data.validations.length > 0) {
        md += `### 🧪 Validaciones\n`
        task.data.validations.forEach(v => { md += `- [ ] ${v}\n` })
        md += `\n`
      }
      
      md += `---\n\n`
    })

    return md
  }, [story, activeTasks])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown)
      setIsCopied(true)
      toast.success('Copiado al portapapeles', { description: 'Ahora puedes pegarlo en Jira o Confluence.' })
      setTimeout(() => { setIsCopied(false) }, 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  const handleBulkCreateRecords = () => {
    if (!story || !bulkText.trim()) return
    const lines = bulkText.split('\n').filter(l => l.trim() !== '')
    
    lines.forEach(line => {
      addTaskToStory(story.id, {
        title: line.trim(),
        type: 'feature',
        data: { objective: '', services: [], requirements: [], validations: [] }
      })
    })
    
    toast.success(`${String(lines.length)} tareas creadas correctamente`, {
      description: 'Ahora puedes editarlas individualmente.'
    })
    setBulkText('')
    setShowBulkDialog(false)
  }

  const form = useForm<StoryUpdateValues>({
    resolver: zodResolver(storyUpdateSchema),
    defaultValues: {
      code: story?.code || '',
      title: story?.title || '',
      module: story?.module || '',
      description: story?.description || ''
    },
  })

  const openEditStory = () => {
    if (!story) return
    form.reset({
      code: story.code,
      title: story.title,
      module: story.module,
      description: story.description || ''
    })
    setEditStoryDialog(true)
  }

  const handleUpdateClick = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      setShowUpdateConfirm(true)
    }
  }

  const confirmUpdate = () => {
    if (!story) return
    const values = form.getValues()
    updateStory(story.id, {
      ...values,
      code: values.code.toUpperCase()
    }, 'Historia actualizada desde el detalle')
    setEditStoryDialog(false)
    setShowUpdateConfirm(false)
    toast.success('Historia actualizada')
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination || !story) return
    if (source.index === destination.index) return

    const otherTasks = activeTasks.filter(t => t.id !== draggableId)
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
    updateTask(story.id, draggableId, { position: newPosition }, 'Tarea reordenada en el detalle')
  }

  const handleArchiveTask = (comment: string) => {
    if (!archiveDialog || !story) return
    archiveTask(story.id, archiveDialog.taskId, comment)
    toast.warning('Tarea eliminada', { description: `${archiveDialog.title} — ${comment}` })
    setArchiveDialog(null)
  }

  const columns = useMemo<ColumnDef<TrackedTask>[]>(() => [
    {
      id: 'drag-handle',
      header: '',
      cell: () => (
        <div className={`flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary/50 transition-colors ${isReadOnly ? 'opacity-0 pointer-events-none' : ''}`}>
          <GripVertical className="h-4 w-4" />
        </div>
      ),
    },
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
      accessorKey: 'assignedTo',
      header: 'Responsable',
      cell: ({ row }) => {
        const member = row.original.assignedTo ? getMemberById(row.original.assignedTo) : null
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border/50">
              {member ? (
                <span className="text-[10px] font-black text-primary">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <Users className="h-3 w-3 text-muted-foreground/40" />
              )}
            </div>
            {member && (
              <span className="text-[11px] font-bold text-foreground/80 truncate max-w-[80px]">
                {member.name.split(' ')[0]}
              </span>
            )}
          </div>
        )
      }
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
        const task = row.original
        const s = task.status

        const handleStatusChange = (newStatus: string) => {
          const statusNames: Record<string, string> = {
            'pending': 'Por Hacer',
            'in_progress': 'En Progreso',
            'completed': 'Completada',
            'archived': 'Eliminada'
          }

          if (newStatus === 'archived') {
            setArchiveDialog({ taskId: task.id, title: task.title })
          } else if (newStatus === 'completed') {
            stopTaskTimer(story?.id || '', task.id)
            triggerConfetti()
          } else {
            updateTask(story?.id || '', task.id, { status: newStatus as 'pending' | 'in_progress' | 'completed' | 'archived' }, `Estado cambiado a ${statusNames[newStatus]}`)
          }
        }

        const badgeColors = s === 'completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
          s === 'in_progress' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
          s === 'archived' ? 'border-muted text-muted-foreground bg-muted/50' :
          'border-amber-500/30 text-amber-500 bg-amber-500/10'

        return (
          <Select value={s} onValueChange={handleStatusChange} disabled={isReadOnly}>
            <SelectTrigger className={`h-7 px-2 text-[10px] font-bold tracking-wider rounded-full border ${badgeColors} focus:ring-0 focus:ring-offset-0`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending" className="text-xs font-bold text-amber-500">Por Hacer</SelectItem>
              <SelectItem value="in_progress" className="text-xs font-bold text-blue-500">En Progreso</SelectItem>
              <SelectItem value="completed" className="text-xs font-bold text-emerald-500">Completada</SelectItem>
              <SelectItem value="archived" className="text-xs font-bold text-destructive">Eliminar</SelectItem>
            </SelectContent>
          </Select>
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
              <span className="text-[10px] text-muted-foreground ml-1.5 font-bold">
                / {String(task.estimatedHours || 0)}h
              </span>
            </div>
            {/* Task Alerts */}
            {getTaskAlertStatus(task).length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex -space-x-1">
                      {getTaskAlertStatus(task).map((alert, i) => (
                        <div key={i} className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center border-2 border-background",
                          alert.type === 'error' ? 'bg-red-500 text-white' : 
                          alert.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        )}>
                          {alert.type === 'error' ? <AlertCircle className="h-2.5 w-2.5" /> : 
                           alert.type === 'warning' ? <AlertTriangle className="h-2.5 w-2.5" /> : <Info className="h-2.5 w-2.5" />}
                        </div>
                      ))}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-2 flex flex-col gap-1 max-w-[200px]">
                    {getTaskAlertStatus(task).map((alert, i) => (
                      <div key={i} className="flex gap-2 items-start leading-tight">
                        <div className={cn("h-1.5 w-1.5 rounded-full mt-1 shrink-0", 
                          alert.type === 'error' ? 'bg-red-500' : 
                          alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        )} />
                        <span className="text-[10px] font-bold">{alert.message}</span>
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {task.status !== 'completed' && task.status !== 'archived' && !isReadOnly && (
              <div className="flex bg-muted/30 rounded-md border border-border/50">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => { if (!isReadOnly) setViewTask(task) }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">Ver detalles de la tarea</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                        onClick={() => { if (story) void navigate(`/editor/${story.id}/${task.id}`) }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">Editar tarea en el editor pro</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                  onClick={() => {
                    if (story) {
                      stopTaskTimer(story.id, task.id)
                      triggerConfetti()
                    }
                  }}
                >
                  <Square className="h-2.5 w-2.5" />
                </Button>
              </div>
            )}
            {task.status === 'completed' && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
            {(task.timeSpent ?? 0) > 0 && (
              <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      setResetTimerDialog({ taskId: task.id, title: task.title })
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">Reiniciar tiempo invertido</TooltipContent>
                  </Tooltip>
              </TooltipProvider>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                    onClick={() => { setViewTask(task) }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Ver Detalle</p></TooltipContent>
              </Tooltip>
              {task.status === 'pending' || task.status === 'in_progress' ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg ${task.status === 'in_progress' ? 'opacity-50 cursor-not-allowed' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
                        onClick={() => {
                          if (task.status === 'in_progress') return
                          const sId = task.storyId || story?.id || findStoryIdForTask(task.id)
                          if (sId && task.id) {
                            void navigate(`/editor/${sId}/${task.id}`)
                          } else {
                            setShowErrorDialog({
                              title: "Historia no encontrada",
                              desc: "No se puede abrir el editor porque no se encontró la relación con la historia."
                            })
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{task.status === 'in_progress' ? 'No se puede editar mientras está en curso' : 'Editar Tarea'}</p>
                    </TooltipContent>
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
                <div className="h-8 w-8 flex items-center justify-center text-emerald-500/50">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </TooltipProvider>
          </div>
        )
      },
    },
  ], [story, startTaskTimer, pauseTaskTimer, stopTaskTimer, updateTask, triggerConfetti, navigate, findStoryIdForTask, isReadOnly, getMemberById])

  const totalPages = Math.ceil((story?.tasks.length || 0) / ITEMS_PER_PAGE)
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return (story?.tasks || []).slice(start, start + ITEMS_PER_PAGE)
  }, [story?.tasks, currentPage])

  const table = useReactTable({
    data: paginatedTasks,
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
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background animate-in fade-in duration-300">
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
                  {isReadOnly && (
                    <Badge variant="outline" className="bg-muted border-muted-foreground/30 text-muted-foreground text-[10px] font-black uppercase tracking-tighter">
                      MODO LECTURA (SPRINT FINALIZADO)
                    </Badge>
                  )}
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl border-dashed hover:border-primary transition-all"
              onClick={() => setShowExportDialog(true)}
            >
              <FileDown className="h-3.5 w-3.5" /> Export Tech Spec
            </Button>

            {!isReadOnly && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-bold rounded-xl border-dashed hover:border-blue-500 transition-all"
                  onClick={() => setShowBulkDialog(true)}
                >
                  <Layers3 className="h-3.5 w-3.5" /> Creación Masiva
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs font-bold rounded-xl"
                  onClick={openEditStory}
                >
                  <Edit className="h-3.5 w-3.5" /> Editar Historia
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold rounded-xl"
              onClick={() => { setShowTimeline(!showTimeline) }}
            >
              <History className="h-3.5 w-3.5" /> {showTimeline ? 'Ocultar' : 'Ver'} Historial
            </Button>

            {!isReadOnly && (
              <Button
                className="gap-2 font-bold shadow-lg shadow-primary/25 active:scale-95 transition-all rounded-xl"
                onClick={() => {
                  startNewTask(undefined, story.id)
                  void navigate(`/editor`)
                }}
              >
                <Plus className="h-4 w-4" /> Nueva Tarea
              </Button>
            )}
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks-list" isDropDisabled={isReadOnly}>
              {(provided) => (
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
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <Draggable key={row.original.id} draggableId={row.original.id} index={row.index} isDragDisabled={isReadOnly}>
                          {(provided, snapshot) => (
                            <TableRow 
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group border-b border-border hover:bg-secondary/40 transition-colors ${snapshot.isDragging ? 'bg-secondary/60 shadow-lg' : ''}`}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-3 px-5 align-middle border-none">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-48 text-center border-none">
                          <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                            <BookOpen className="h-8 w-8 opacity-20" />
                            <p className="text-sm font-medium">No hay tareas en esta historia.</p>
                            <Button variant="outline" size="sm" onClick={() => {
                              startNewTask(undefined, story.id)
                              void navigate(`/editor`)
                            }} className="mt-2 text-xs font-bold rounded-lg">
                              Crear la primera tarea
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {provided.placeholder}
                  </TableBody>
                </Table>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div className="p-4 bg-muted/5 border-t border-border/40">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Task Details Dialog (View Only) */}
      <Dialog open={!!viewTask} onOpenChange={(open: boolean) => { if (!open) setViewTask(null) }}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-2xl p-0">
          <div className="p-8">
            <DynamicTaskEditor readOnly task={viewTask as unknown as TaskDraft} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Tech Spec Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-3xl border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" /> Technical Specification (Markdown)
            </DialogTitle>
            <DialogDescription>
              Copia este contenido para pegarlo en Jira, Confluence o Notion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative group">
              <Textarea 
                readOnly 
                value={generatedMarkdown} 
                className="min-h-[400px] font-mono text-[12px] bg-muted/30 p-4 rounded-xl resize-none border-border/50"
              />
              <Button 
                size="sm" 
                className="absolute top-3 right-3 gap-2 font-bold shadow-xl"
                onClick={copyToClipboard}
              >
                {isCopied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {isCopied ? '¡Copiado!' : 'Copiar Markdown'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Tasks Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-lg border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-blue-500" /> Creación Masiva
            </DialogTitle>
            <DialogDescription>
              Ingresa un título de tarea por línea. Se crearán como borradores.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground mb-1" />
              <Textarea 
                placeholder="Crear servicio de auth\nDiseñar mockup\nImplementar RLS..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="min-h-[200px] bg-muted/30 rounded-xl resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" className="rounded-xl" onClick={() => setShowBulkDialog(false)}>
                Cancelar
              </Button>
              <Button 
                className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700" 
                onClick={handleBulkCreateRecords}
                disabled={!bulkText.trim()}
              >
                Crear Tareas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Dialogs (Archive, Reset, Error) */}
      <CommentDialog
        open={!!archiveDialog}
        onOpenChange={(open) => { if (!open) setArchiveDialog(null) }}
        title="Eliminar Tarea"
        description={`"${archiveDialog?.title || ''}" se eliminará. Podrás consultarla en el historial.`}
        variant="warning"
        confirmLabel="Eliminar Tarea"
        onConfirm={handleArchiveTask}
      />

      <Dialog open={editStoryDialog} onOpenChange={setEditStoryDialog}>
        <DialogContent className="max-w-2xl border-border bg-popover shadow-2xl rounded-2xl">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Editar Historia
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Actualiza los detalles de la User Story.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); void handleUpdateClick(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Jira</FormLabel>
                        <FormControl>
                          <Input placeholder="PROJ-123" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="module"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Módulo</FormLabel>
                        <FormControl>
                          <Input placeholder="Compras" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Historia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Gestionar órdenes de compra" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción opcional..."
                          className="min-h-[100px] bg-background rounded-2xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setEditStoryDialog(false) }}>Cancelar</Button>
                  <Button type="submit" className="font-bold rounded-xl px-8">Guardar Cambios</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showUpdateConfirm}
        onOpenChange={setShowUpdateConfirm}
        onConfirm={confirmUpdate}
        title="¿Actualizar historia?"
        description="Se guardarán los cambios realizados en la historia."
        confirmText="Confirmar"
      />

      <ConfirmDialog
        open={!!resetTimerDialog}
        onOpenChange={(open) => { if (!open) setResetTimerDialog(null) }}
        onConfirm={() => {
          if (resetTimerDialog && story) {
            resetTaskTimer(story.id, resetTimerDialog.taskId)
            toast.success('Contador reiniciado')
            setResetTimerDialog(null)
          }
        }}
        title="¿Reiniciar contador?"
        description={resetTimerDialog ? `Se pondrá a cero el tiempo de "${resetTimerDialog.title}".` : ""}
        confirmText="Sí, reiniciar"
        variant="destructive"
      />

      <ConfirmDialog
        open={!!showErrorDialog}
        onOpenChange={(open) => { if (!open) setShowErrorDialog(null) }}
        onConfirm={() => {setShowErrorDialog(null)}}
        title={showErrorDialog?.title || "Error"}
        description={showErrorDialog?.desc || ""}
        confirmText="Entendido"
      />
    </div>
  )
}
