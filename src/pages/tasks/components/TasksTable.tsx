import { useMemo } from 'react'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/shared/components/table'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { Eye, Edit, ExternalLink, AlertCircle, AlertTriangle, Info, Users as UsersIcon, CheckSquare } from 'lucide-react'
import {
 flexRender,
 getCoreRowModel,
 useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { LiveTimer } from '@/features/tasks/components/LiveTimer'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { cn } from '@/shared/utils'
import type { TrackedTask, Story } from '@/features/stories/types'

interface TasksTableProps {
 tasks: (TrackedTask & { storyData: Story })[]
 getMemberById: (id: string) => { name: string; avatarUrl?: string } | undefined | null
 onStatusChange: (task: TrackedTask, status: string) => void
 onPriorityChange: (task: TrackedTask, priority: string) => void
 onView: (task: TrackedTask) => void
 onEdit: (task: TrackedTask) => void
 onNavigateToStory: (storyId: string) => void
}

export function TasksTable({
 tasks,
 getMemberById,
 onStatusChange,
 onPriorityChange,
 onView,
 onEdit,
 onNavigateToStory
}: TasksTableProps) {
 const columns = useMemo<ColumnDef<TrackedTask & { storyData: Story }>[]>(() => [
 {
 accessorKey: 'title',
 header: 'Tarea',
 cell: ({ row }) => (
 <div className="space-y-1 py-1">
 <div className="flex items-center gap-2">
 {row.original.code && (
 <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
 {row.original.code}
 </span>
 )}
 <p className="font-semibold text-foreground text-sm truncate max-w-[400px]">{row.original.title}</p>
 {getTaskAlertStatus(row.original).map((alert, i) => (
 <TooltipProvider key={i} delayDuration={200}>
 <Tooltip>
 <TooltipTrigger asChild>
 <div className={cn(
 "h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0",
 alert.type === 'error' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
 )}>
 {alert.type === 'error' ? <AlertCircle className="h-2 w-2 text-white" /> : 
 alert.type === 'warning' ? <AlertTriangle className="h-2 w-2 text-white" /> : <Info className="h-2 w-2 text-white" />}
 </div>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-medium">{alert.message}</TooltipContent>
 </Tooltip>
 </TooltipProvider>
 ))}
 </div>
 <p className="text-[11px] text-muted-foreground/60 truncate max-w-[300px]">{row.original.storyData.title}</p>
 </div>
 ),
 },
 {
 accessorKey: 'type',
 header: 'Tipo',
 cell: ({ row }) => (
 <Badge variant="outline" className="capitalize text-xs font-medium rounded-lg bg-secondary/30 border-border/40 px-2 py-0.5">{row.original.type}</Badge>
 ),
 },
 {
 id: 'assignedTo',
 header: 'Responsable',
 cell: ({ row }) => {
 const member = row.original.assignedTo ? getMemberById(row.original.assignedTo) : null
 return (
 <div className="flex items-center gap-2.5">
 <div className="h-7 w-7 rounded-full bg-secondary border border-border/40 flex items-center justify-center text-xs font-bold text-foreground overflow-hidden shrink-0">
 {member?.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : member?.name.charAt(0) || <UsersIcon className="h-3 w-3 opacity-30" />}
 </div>
 <span className="text-xs font-medium text-foreground/80">{member?.name || 'Sin asignar'}</span>
 </div>
 )
 }
 },
 {
 accessorKey: 'priority',
 header: 'Prioridad',
 cell: ({ row }) => {
 const task = row.original
 const p = task.priority || 'medium'
 const priorityColors = p === 'urgent' ? 'text-rose-600 bg-rose-500/8 border-rose-500/20' :
 p === 'high' ? 'text-amber-600 bg-amber-500/8 border-amber-500/20' :
 p === 'low' ? 'text-emerald-600 bg-emerald-500/8 border-emerald-500/20' :
 'text-blue-600 bg-blue-500/8 border-blue-500/20'

 return (
 <Select value={p} onValueChange={(v) => { onPriorityChange(task, v) }}>
 <SelectTrigger className={cn("h-7 px-2.5 text-xs font-bold rounded-lg border focus:ring-0 w-[100px]", priorityColors)}>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="low" className="text-xs font-bold text-emerald-600">Baja</SelectItem>
 <SelectItem value="medium" className="text-xs font-bold text-blue-600">Media</SelectItem>
 <SelectItem value="high" className="text-xs font-bold text-amber-600">Alta</SelectItem>
 <SelectItem value="urgent" className="text-xs font-bold text-rose-600">Urgente</SelectItem>
 </SelectContent>
 </Select>
 )
 }
 },
 {
 accessorKey: 'status',
 header: 'Estado',
 cell: ({ row }) => {
 const task = row.original
 const s = task.status
 const badgeColors = s === 'completed' ? 'text-emerald-600 bg-emerald-500/8 border-emerald-500/20' :
 s === 'in_progress' ? 'text-blue-600 bg-blue-500/8 border-blue-500/20' :
 s === 'qa' ? 'text-violet-600 bg-violet-500/8 border-violet-500/20' :
 s === 'blocked' ? 'text-rose-700 bg-rose-600/8 border-rose-600/20' :
 s === 'archived' ? 'text-muted-foreground bg-muted border-border' :
 'text-amber-600 bg-amber-500/8 border-amber-500/20'

 if (s === 'archived') return <Badge variant="outline" className={cn("rounded-lg text-xs font-bold", badgeColors)}>Archivada</Badge>

 return (
 <Select value={s} onValueChange={(v) => { onStatusChange(task, v) }}>
 <SelectTrigger className={cn("h-7 px-2.5 text-xs font-bold rounded-lg border focus:ring-0 w-[120px]", badgeColors)}>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="pending" className="text-xs font-bold text-amber-600">Por Hacer</SelectItem>
 <SelectItem value="in_progress" className="text-xs font-bold text-blue-600">En Progreso</SelectItem>
 <SelectItem value="qa" className="text-xs font-bold text-violet-600">Revisión/QA</SelectItem>
 <SelectItem value="blocked" className="text-xs font-bold text-rose-600">Bloqueado</SelectItem>
 <SelectItem value="completed" className="text-xs font-bold text-emerald-600">Completada</SelectItem>
 </SelectContent>
 </Select>
 )
 },
 },
 {
 accessorKey: 'timeSpent',
 header: 'Tiempo',
 cell: ({ row }) => (
 <div className="inline-flex bg-secondary/30 px-2 py-1 items-center justify-center rounded-lg border border-border/40 text-[11px] font-mono font-bold tabular-nums">
 <LiveTimer timeSpent={row.original.timeSpent || 0} timeLogs={row.original.timeLogs} />
 </div>
 )
 },
 {
 id: 'actions',
 header: () => <div className="text-right pr-4">Acciones</div>,
 cell: ({ row }) => {
 const task = row.original
 const isActionDisabled = task.status === 'in_progress' || task.status === 'completed'
 return (
 <TooltipProvider delayDuration={200}>
 <div className="flex justify-end gap-1.5 pr-1">
 <Tooltip>
 <TooltipTrigger asChild>
 <Button 
 variant="outline" 
 size="icon" 
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
 onClick={() => { onView(task) }}
 >
 <Eye className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Ver Detalle de Tarea</TooltipContent>
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <Button 
 variant="outline" 
 size="icon" 
 disabled={isActionDisabled} 
 className={cn(
 "h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-amber-600 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all shadow-sm",
 isActionDisabled && "opacity-30 cursor-not-allowed bg-secondary/20"
 )}
 onClick={() => { onEdit(task) }}
 >
 <Edit className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">
 {isActionDisabled ? 'No se puede editar en ejecución' : 'Modificar Tarea'}
 </TooltipContent>
 </Tooltip>

 <Tooltip>
 <TooltipTrigger asChild>
 <Button 
 variant="outline" 
 size="icon" 
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-blue-600 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all shadow-sm"
 onClick={() => { onNavigateToStory(task.storyId) }}
 >
 <ExternalLink className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Ir a Historia de Usuario</TooltipContent>
 </Tooltip>
 </div>
 </TooltipProvider>
 )
 },
 },
 ], [getMemberById, onStatusChange, onPriorityChange, onView, onEdit, onNavigateToStory])

 const table = useReactTable({
 data: tasks,
 columns,
 getCoreRowModel: getCoreRowModel(),
 })

 return (
 <div className="w-full border border-border/40 rounded-xl bg-card/30 overflow-hidden shadow-sm">
 <div className="overflow-x-auto w-full">
 <Table>
 <TableHeader className="bg-secondary/20">
 {table.getHeaderGroups().map((headerGroup) => (
 <TableRow key={headerGroup.id} className="hover:bg-transparent">
 {headerGroup.headers.map((header) => (
 <TableHead key={header.id} className="h-12 px-5 text-[11px] font-bold text-muted-foreground">
 {flexRender(header.column.columnDef.header, header.getContext())}
 </TableHead>
 ))}
 </TableRow>
 ))}
 </TableHeader>
 <TableBody>
 {tasks.length ? (
 table.getRowModel().rows.map((row) => (
 <TableRow key={row.id} className="hover:bg-secondary/10 transition-colors">
 {row.getVisibleCells().map((cell) => (
 <TableCell key={cell.id} className="px-5 py-3">
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </TableCell>
 ))}
 </TableRow>
 ))
 ) : (
 <TableRow className="hover:bg-transparent">
 <TableCell colSpan={columns.length} className="h-64 text-center">
 <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
 <div className="h-16 w-16 rounded-xl bg-secondary/20 flex items-center justify-center">
 <CheckSquare className="h-8 w-8 opacity-20" />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-foreground/50">Sin tareas encontradas</p>
 <p className="text-xs text-muted-foreground/40">Ajusta los filtros para ver más resultados</p>
 </div>
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </div>
 </div>
 )
}
