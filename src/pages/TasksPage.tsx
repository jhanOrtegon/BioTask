import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import type { TrackedTask, Story } from '@/features/stories/types'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import { CheckSquare, BookOpen, Eye, Edit, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { DynamicTaskEditor } from '@/features/tasks/ui/DynamicTaskEditor'
import type { TaskDraft } from '@/features/tasks/types'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'
import { useTeamStore } from '@/features/team/store'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { cn } from '@/shared/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { AlertCircle, AlertTriangle, Info, Users as UsersIcon, Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Pagination } from '@/shared/ui/pagination'

export function TasksPage() {
  const navigate = useNavigate()
  const { stories, updateTask, stopTaskTimer, archiveTask } = useStoriesStore()
  const { getMemberById } = useTeamStore()
  
  const [selectedStoryId, setSelectedStoryId] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const [archiveDialog, setArchiveDialog] = useState<{ taskId: string; title: string; storyId: string } | null>(null)
  const [viewTask, setViewTask] = useState<TrackedTask | null>(null)
  const [editTask, setEditTask] = useState<TrackedTask | null>(null)
  const [pendingUpdate, setPendingUpdate] = useState<{ taskId: string; storyId: string; data: Partial<TrackedTask> } | null>(null)

  const activeStories = useMemo(() => stories.filter(s => s.status !== 'archived'), [stories])
  
  // Flatten tasks from stories
  const allTasks = useMemo(() => {
    let tasks: (TrackedTask & { storyData: Story })[] = []
    
    for (const story of stories) {
      if (selectedStoryId !== 'all' && story.id !== selectedStoryId) continue;
      
      const filteredTasks = story.tasks
        .filter(t => (showArchived ? true : t.status !== 'archived'))
        .filter(t => {
          if (!search) return true
          const term = search.toLowerCase()
          return t.title.toLowerCase().includes(term) || (t.code && t.code.toLowerCase().includes(term))
        })
        .map(t => ({
          ...t,
          storyData: story
        }))
      
      tasks = tasks.concat(filteredTasks)
    }
    
    // Filter by status (Archived / Active)
    return tasks.filter(t => showArchived ? t.status === 'archived' : t.status !== 'archived')
  }, [stories, selectedStoryId, showArchived, search])

  const totalPages = Math.ceil(allTasks.length / ITEMS_PER_PAGE)
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return allTasks.slice(start, start + ITEMS_PER_PAGE)
  }, [allTasks, currentPage])



  const columns = useMemo<ColumnDef<TrackedTask & { storyData: Story }>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Tarea',
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-[300px]">
          <div className="flex items-center gap-2">
            {row.original.code && (
              <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                {row.original.code}
              </span>
            )}
            <p className="font-semibold text-foreground text-[13px] truncate">{row.original.title}</p>
            
            {getTaskAlertStatus(row.original).length > 0 && (
              <div className="flex gap-1">
                {getTaskAlertStatus(row.original).map((alert, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                          alert.type === 'error' ? 'bg-red-500 text-white' : 
                          alert.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                        )}>
                          {alert.type === 'error' ? <AlertCircle className="h-2.5 w-2.5" /> : 
                           alert.type === 'warning' ? <AlertTriangle className="h-2.5 w-2.5" /> : <Info className="h-2.5 w-2.5" />}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="font-bold text-[10px] p-2">{alert.message}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'story',
      header: 'Historia',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
           <BookOpen className="h-3 w-3 text-muted-foreground" />
           <span className="font-medium text-muted-foreground truncate max-w-[150px]">{row.original.storyData.title}</span>
        </div>
      )
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
      id: 'assignedTo',
      header: 'Responsable',
      cell: ({ row }) => {
        const member = row.original.assignedTo ? getMemberById(row.original.assignedTo) : null
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden">
              {member?.avatarUrl ? (
                <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                member?.name.charAt(0) || <UsersIcon className="h-3 w-3" />
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">{member?.name || 'Unassigned'}</span>
          </div>
        )
      }
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const task = row.original
        const s = task.status

        const handleStatusChange = (newStatus: string) => {
          if (newStatus === 'archived') {
            setArchiveDialog({ taskId: task.id, title: task.title, storyId: task.storyId })
          } else if (newStatus === 'completed') {
            stopTaskTimer(task.storyId, task.id)
          } else {
            const statusNames: Record<string, string> = { 'pending': 'Por Hacer', 'in_progress': 'En Progreso', 'completed': 'Completada' }
            updateTask(task.storyId, task.id, { status: newStatus as 'pending' | 'in_progress' | 'completed' | 'archived' }, `Estado cambiado a ${statusNames[newStatus]}`)
          }
        }

        const badgeColors = s === 'completed' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' :
          s === 'in_progress' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
          s === 'archived' ? 'border-muted text-muted-foreground bg-muted/50' :
          'border-amber-500/30 text-amber-500 bg-amber-500/10'

        if (s === 'archived') {
          return (
            <Badge variant="outline" className={badgeColors}>Eliminada</Badge>
          )
        }

        return (
          <Select value={s} onValueChange={handleStatusChange}>
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
      header: 'Tiempo Invertido',
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="inline-flex bg-muted/50 px-2 py-1 items-center justify-center rounded border border-border/50 text-xs">
            <LiveTimer timeSpent={task.timeSpent || 0} timeLogs={task.timeLogs} />
          </div>
        )
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex justify-end gap-1 px-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
              onClick={() => { setViewTask(task) }}
              title="Ver Detalle"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={task.status === 'in_progress' || task.status === 'completed'}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg",
                (task.status === 'in_progress' || task.status === 'completed') && "opacity-20 cursor-not-allowed"
              )}
              onClick={() => { 
                setEditTask(task)
              }}
              title={task.status === 'pending' ? "Editar Tarea" : "No se puede editar una tarea en curso o finalizada"}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              onClick={() => { void navigate(`/stories/${task.storyId}`) }}
              title="Ir a la Historia"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [navigate, updateTask, stopTaskTimer, getMemberById])

  const table = useReactTable({
    data: paginatedTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-background animate-in fade-in duration-300">
      <Breadcrumbs items={[{ label: 'Tareas' }]} />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Tareas
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl pl-13">
            Vista general de todas las tareas a través de tus historias.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título o código..." 
              className="pl-10 h-10 rounded-xl bg-secondary/50 border-primary/10 focus:ring-primary/20"
              value={search}
              onChange={(e) => { setSearch(e.target.value) }}
            />
          </div>

          <Select value={selectedStoryId} onValueChange={(v) => { setSelectedStoryId(v) }}>
            <SelectTrigger className="w-full md:w-[250px] h-10 rounded-xl bg-secondary/50 border-primary/10 font-bold text-xs">
              <SelectValue placeholder="Filtrar por Historia" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl">
              <SelectItem value="all" className="font-bold text-xs uppercase tracking-wider">Todas las Historias</SelectItem>
              {activeStories.map(s => (
                <SelectItem key={s.id} value={s.id} className="text-xs">{s.code}: {s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            className={cn(
              "h-10 rounded-xl border border-primary/10 px-4 text-xs font-bold transition-all",
              showArchived ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground hover:bg-secondary"
            )}
            onClick={() => { setShowArchived(!showArchived) }}
          >
            {showArchived ? 'Ocultar Archivadas' : 'Ver Archivadas'}
          </Button>
        </div>

      </header>
      
      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-xl border-b border-border">
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
                  <TableRow
                    key={row.id}
                    className="group border-b border-border hover:bg-secondary/40 transition-colors"
                  >
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
                      <CheckSquare className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">
                        {showArchived ? 'No hay tareas eliminadas en esta selección.' : 'No hay tareas activas en esta selección.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <div className="p-6 border-t border-border/40 bg-muted/10 rounded-b-3xl">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      
      {/* Task Details Dialog (View) */}
      <Dialog open={!!viewTask} onOpenChange={(open: boolean) => { if (!open) setViewTask(null) }}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-2xl p-0">
          <div className="p-8">
            <DynamicTaskEditor readOnly task={viewTask as unknown as TaskDraft} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Edit Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open: boolean) => { if (!open) setEditTask(null) }}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col border-border bg-popover shadow-2xl rounded-2xl p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 pt-6">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                   <Edit className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black">Editor de Tarea</h2>
                   <p className="text-xs text-muted-foreground font-medium">Modifica los detalles de la tarea seleccionada.</p>
                 </div>
               </div>
               <Button onClick={() => {
                 if (editTask) {
                   setPendingUpdate({
                     taskId: editTask.id,
                     storyId: editTask.storyId,
                     data: editTask // En una app real, aquí tendríamos el estado actual del editor
                   })
                 }
               }} className="rounded-xl font-bold px-8">Guardar Cambios</Button>
            </div>
            
            {editTask && (
              <DynamicTaskEditor 
                task={editTask as unknown as TaskDraft} 
                onUpdate={(updatedData) => {
                  setEditTask(prev => prev ? ({ ...prev, ...updatedData } as TrackedTask) : null)
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Justification for Update */}
      {pendingUpdate && (
        <CommentDialog
          open={!!pendingUpdate}
          onOpenChange={(open: boolean) => { if (!open) setPendingUpdate(null) }}
          title="Justificar Cambio"
          description="Escribe el motivo del cambio para el registro histórico (Audit Log)."
          onConfirm={(comment: string) => {
            const { storyId, taskId, data } = pendingUpdate
            updateTask(storyId, taskId, data, comment)
            toast.success('Cambio registrado en auditoría.')
            setPendingUpdate(null)
            setEditTask(null)
          }}
        />
      )}

      {/* Archive Task Comment Dialog */}
      {archiveDialog && (
        <CommentDialog
          open={!!archiveDialog}
          onOpenChange={(open: boolean) => { if (!open) setArchiveDialog(null) }}
          title="Eliminar Tarea"
          description={`"${archiveDialog.title}" se eliminará. Podrás consultarla en el historial activando el filtro.`}
          variant="warning"
          confirmLabel="Eliminar Tarea"
          onConfirm={(comment: string) => {
            archiveTask(archiveDialog.storyId, archiveDialog.taskId, comment)
            setArchiveDialog(null)
          }}
        />
      )}
    </div>
  )
}
