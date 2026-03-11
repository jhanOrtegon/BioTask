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
import { CheckSquare, BookOpen, Eye } from 'lucide-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { LiveTimer } from '@/features/tasks/ui/LiveTimer'

export function TasksPage() {
  const navigate = useNavigate()
  const { stories, updateTask, stopTaskTimer, archiveTask } = useStoriesStore()
  
  const [selectedStoryId, setSelectedStoryId] = useState<string>('all')
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [archiveDialog, setArchiveDialog] = useState<{ taskId: string; title: string; storyId: string } | null>(null)

  const activeStories = useMemo(() => stories.filter(s => s.status !== 'archived'), [stories])
  
  // Flatten tasks from stories
  const allTasks = useMemo(() => {
    let tasks: (TrackedTask & { storyData: Story })[] = []
    
    for (const story of stories) {
      if (selectedStoryId !== 'all' && story.id !== selectedStoryId) continue;
      
      const storyTasks = story.tasks.map(t => ({
        ...t,
        storyData: story
      }))
      
      tasks = tasks.concat(storyTasks)
    }
    
    // Filter by status (Archived / Active)
    return tasks.filter(t => showArchived ? t.status === 'archived' : t.status !== 'archived')
  }, [stories, selectedStoryId, showArchived])

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
      header: () => <div className="text-right">Ir</div>,
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex justify-end pr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              onClick={() => { void navigate(`/stories/${task.storyId}`) }}
              title="Ir a la Historia"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [navigate, updateTask, stopTaskTimer])

  const table = useReactTable({
    data: allTasks,
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
        
        <div className="flex items-center gap-3">
           <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
             <SelectTrigger className="w-[240px] h-10 bg-card border-border font-medium text-xs">
               <SelectValue placeholder="Filtrar por Historia" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all" className="text-xs font-bold">Todas las Historias</SelectItem>
               {activeStories.map(s => (
                 <SelectItem key={s.id} value={s.id} className="text-xs">
                   {s.code} - {s.title}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           
           <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold h-10 px-4"
            onClick={() => { setShowArchived(!showArchived) }}
          >
            {showArchived ? 'Ver Activas' : 'Ver Eliminadas'}
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
        </div>
      </div>
      
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
