import { useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { Eye, Edit, Archive, RotateCcw, GripVertical, BookOpen } from 'lucide-react'
import {
 flexRender,
 getCoreRowModel,
 useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/utils'
import type { Story } from '@/features/stories/types'
import type { Epic } from '@/features/epics/types'

interface StoriesTableProps {
 stories: Story[]
 epics: Epic[]
 onDragEnd: (result: DropResult) => void
 onView: (id: string) => void
 onEdit: (story: Story) => void
 onArchive: (id: string) => void
 onRestore: (id: string) => void
 isDragDisabled: boolean
 formatDate: (iso: string) => string
}

export function StoriesTable({
 stories,
 epics,
 onDragEnd,
 onView,
 onEdit,
 onArchive,
 onRestore,
 isDragDisabled,
 formatDate
}: StoriesTableProps) {
 const columns = useMemo<ColumnDef<Story>[]>(() => [
 {
 id: 'drag-handle',
 header: '',
 cell: () => (
 <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/20 hover:text-primary transition-colors">
 <GripVertical className="h-4 w-4" />
 </div>
 ),
 },
 {
 accessorKey: 'code',
 header: 'Código',
 cell: ({ row }) => (
 <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
 {row.original.code}
 </span>
 ),
 },
 {
 accessorKey: 'title',
 header: 'Título de la Historia',
 cell: ({ row }) => (
 <div className="space-y-0.5 max-w-[400px] py-1">
 <p className="font-semibold text-foreground text-sm truncate">{row.original.title}</p>
 {row.original.description && (
 <p className="text-[11px] text-muted-foreground/50 truncate">{row.original.description}</p>
 )}
 </div>
 ),
 },
 {
 id: 'epic',
 header: 'Épica',
 cell: ({ row }) => {
 const epic = epics.find(e => e.id === row.original.epicId)
 return epic ? (
 <div className="flex items-center gap-2">
 <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: epic.color }} />
 <span className="text-xs font-bold text-muted-foreground/80 leading-none">{epic.code}</span>
 </div>
 ) : <span className="text-xs text-muted-foreground/20">—</span>
 }
 },
 {
 accessorKey: 'module',
 header: 'Módulo',
 cell: ({ row }) => (
 <Badge variant="outline" className="text-xs font-medium rounded-lg bg-secondary/30 border-border/40 px-2 py-0.5 lowercase tracking-tight">
 {row.original.module}
 </Badge>
 ),
 },
 {
 id: 'taskCount',
 header: 'Progreso',
 cell: ({ row }) => {
 const active = row.original.tasks.filter(t => t.status !== 'archived').length
 const total = row.original.tasks.length
 const pct = total > 0 ? ((active / total) * 100).toFixed(0) : '0'
 return (
 <div className="flex items-center gap-3">
 <div className="w-16 h-1 rounded-full bg-secondary/60 overflow-hidden relative">
 <div className="absolute inset-y-0 left-0 bg-primary/60 transition-all duration-500 ease-in-out" style={{ width: `${pct}%` }} />
 </div>
 <span className="text-[11px] text-muted-foreground font-bold tabular-nums">
 {active}/{total}
 </span>
 </div>
 )
 },
 },
 {
 accessorKey: 'createdAt',
 header: 'Fecha',
 cell: ({ row }) => (
 <span className="text-[11px] text-muted-foreground font-medium tabular-nums">{formatDate(row.original.createdAt)}</span>
 ),
 },
 {
 id: 'actions',
 header: () => <div className="text-right pr-4">Acciones</div>,
 cell: ({ row }) => {
 const story = row.original
 return (
 <TooltipProvider delayDuration={200}>
 <div className="flex justify-end gap-1.5 pr-1">
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all shadow-sm"
 onClick={(e) => { e.stopPropagation(); onView(story.id) }}
 >
 <Eye className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Ver Flujo Detallado</TooltipContent>
 </Tooltip>

 {story.status === 'active' && (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-amber-600 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all shadow-sm"
 onClick={(e) => { e.stopPropagation(); onEdit(story) }}
 >
 <Edit className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Editar Historia</TooltipContent>
 </Tooltip>
 )}

 {story.status === 'active' ? (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-rose-600 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all shadow-sm"
 onClick={(e) => { e.stopPropagation(); onArchive(story.id) }}
 >
 <Archive className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Archivar Historia</TooltipContent>
 </Tooltip>
 ) : (
 <Tooltip>
 <TooltipTrigger asChild>
 <Button
 variant="outline"
 size="icon"
 className="h-8 w-8 rounded-xl border-border/40 text-muted-foreground/60 hover:text-emerald-600 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-sm"
 onClick={(e) => { e.stopPropagation(); onRestore(story.id) }}
 >
 <RotateCcw className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs font-bold ">Restaurar Historia</TooltipContent>
 </Tooltip>
 )}
 </div>
 </TooltipProvider>
 )
 },
 },
 ], [epics, onView, onEdit, onArchive, onRestore, formatDate])

 const table = useReactTable({
 data: stories,
 columns,
 getCoreRowModel: getCoreRowModel(),
 })

 return (
 <div className="w-full border border-border/40 rounded-xl bg-card/30 overflow-hidden shadow-sm">
 <div className="overflow-x-auto w-full">
 <DragDropContext onDragEnd={onDragEnd}>
 <Droppable droppableId="stories-list">
 {(provided) => (
 <Table>
 <TableHeader className="bg-secondary/20">
 {table.getHeaderGroups().map((headerGroup) => (
 <TableRow key={headerGroup.id} className="hover:bg-transparent">
 {headerGroup.headers.map((header) => (
 <TableHead key={header.id} className="h-12 px-5 text-[11px] font-bold text-muted-foreground">
 {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
 </TableHead>
 ))}
 </TableRow>
 ))}
 </TableHeader>
 <TableBody {...provided.droppableProps} ref={provided.innerRef}>
 {stories.length ? (
 table.getRowModel().rows.map((row, idx) => (
 <Draggable key={row.original.id} draggableId={row.original.id} index={idx} isDragDisabled={isDragDisabled}>
 {(provided, snapshot) => (
 <TableRow
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={cn(
 "hover:bg-secondary/10 transition-colors cursor-pointer",
 snapshot.isDragging && "!bg-secondary/20 shadow-xl border-primary/20 scale-[1.005]"
 )}
 onClick={() => { onView(row.original.id) }}
 >
 {row.getVisibleCells().map((cell) => (
 <TableCell key={cell.id} className="px-5 py-3">
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </TableCell>
 ))}
 </TableRow>
 )}
 </Draggable>
 ))
 ) : (
 <TableRow className="hover:bg-transparent">
 <TableCell colSpan={columns.length} className="h-64 text-center">
 <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
 <div className="h-16 w-16 rounded-xl bg-secondary/20 flex items-center justify-center">
 <BookOpen className="h-8 w-8 opacity-20" />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-foreground/50">Sin historias encontradas</p>
 <p className="text-xs text-muted-foreground/40">Crea una nueva historia para comenzar</p>
 </div>
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
 </div>
 )
}
