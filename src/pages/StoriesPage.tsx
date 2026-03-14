import { useState, useMemo, useCallback } from 'react'
import { useStoriesStore } from '@/features/stories/store'
import { useEpicsStore } from '@/features/epics/store'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import type { Story } from '@/features/stories/types'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { cn } from '@/shared/utils'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import {
  Plus, BookOpen, Archive, RotateCcw, Eye, Edit, GripVertical
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

import { Pagination } from '@/shared/ui/pagination'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

import { useLocation } from 'react-router-dom'
import { Search, Filter, Layers } from 'lucide-react'

export function StoriesPage() {
  const { stories, addStory, updateStory, archiveStory, restoreStory, reorderStory } = useStoriesStore()
  const { epics } = useEpicsStore()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState('')
  const locationState = location.state as { epicId?: string } | null
  const [epicFilter, setEpicFilter] = useState<string>(locationState?.epicId || 'all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [archiveDialogId, setArchiveDialogId] = useState<string | null>(null)
  
  const [editStoryId, setEditStoryId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    code: '',
    title: '',
    module: '',
    description: '',
    epicId: ''
  })

  const [formCode, setFormCode] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formModule, setFormModule] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formEpicId, setFormEpicId] = useState('')

  const filteredStories = useMemo(() => {
    return stories
      .filter(s => showArchived ? s.status === 'archived' : s.status === 'active')
      .filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                             s.code.toLowerCase().includes(search.toLowerCase())
        const matchesEpic = epicFilter === 'all' || s.epicId === epicFilter
        return matchesSearch && matchesEpic
      })
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  }, [stories, showArchived, search, epicFilter])

  const paginatedStories = useMemo(() => {
    return filteredStories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredStories, currentPage])

  const totalPages = Math.ceil(filteredStories.length / ITEMS_PER_PAGE)

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.index === destination.index) return

    const otherStories = filteredStories.filter(s => s.id !== draggableId)
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
  }

  const handleCreate = () => {
    if (!formCode.trim() || !formTitle.trim() || !formModule.trim()) {
      toast.error('Todos los campos son obligatorios', { description: 'Completa código, título y módulo.' })
      return
    }
    const story = addStory({
      code: formCode.trim(),
      title: formTitle.trim(),
      module: formModule.trim(),
      description: formDesc.trim() || undefined,
      epicId: formEpicId || undefined,
    })
    toast.success('Historia creada', { description: `${story.code} — ${story.title}` })
    setFormCode(''); setFormTitle(''); setFormModule(''); setFormDesc(''); setFormEpicId('')
    setIsCreateOpen(false)
  }

  const handleArchive = (comment: string) => {
    if (!archiveDialogId) return
    const story = stories.find(s => s.id === archiveDialogId)
    archiveStory(archiveDialogId, comment)
    toast.warning('Historia eliminada', { description: `${story?.code || ''} — ${comment}` })
    setArchiveDialogId(null)
  }

  const handleRestore = useCallback((id: string) => {
    const story = stories.find(s => s.id === id)
    restoreStory(id, 'Restaurada manualmente')
    toast.success('Historia restaurada', { description: story?.code || '' })
  }, [stories, restoreStory])

  const handleOpenEdit = useCallback((story: Story) => {
    setEditStoryId(story.id)
    setEditForm({
      code: story.code,
      title: story.title,
      module: story.module,
      description: story.description || '',
      epicId: story.epicId || ''
    })
  }, [])

  const [editCommentDialog, setEditCommentDialog] = useState(false)

  const handleUpdate = (comment: string) => {
    if (!editStoryId) return
    if (!editForm.code.trim() || !editForm.title.trim() || !editForm.module.trim()) {
      toast.error('Campos obligatorios vacíos')
      return
    }
    updateStory(editStoryId, editForm, comment)
    toast.success('Historia actualizada', { description: 'Cambios registrados en auditoría.' })
    setEditStoryId(null)
    setEditCommentDialog(false)
  }

  const columns = useMemo<ColumnDef<Story>[]>(() => [
    {
      id: 'drag-handle',
      header: '',
      cell: () => (
        <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary/50 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Título',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground text-[13px]">{row.original.title}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
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
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: epic.color }} />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{epic.code}</span>
          </div>
        ) : <span className="text-[10px] text-muted-foreground/30">-</span>
      }
    },
    {
      accessorKey: 'module',
      header: 'Módulo',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] font-bold tracking-wider">{row.original.module}</Badge>
      ),
    },
    {
      id: 'taskCount',
      header: 'Tareas',
      cell: ({ row }) => {
        const active = row.original.tasks.filter(t => t.status !== 'archived').length
        const total = row.original.tasks.length
        return (
          <span className="text-xs text-muted-foreground font-medium">
            {active} / {total}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Creación',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right px-5">Acciones</div>,
      cell: ({ row }) => {
        const story = row.original
        return (
          <div className="flex justify-end gap-1 px-2">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    onClick={(e) => { e.stopPropagation(); void navigate(`/stories/${row.original.id}`) }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Ver detalle</p></TooltipContent>
              </Tooltip>

              {story.status === 'active' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(story) }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Editar historia</p></TooltipContent>
                </Tooltip>
              )}

              {story.status === 'active' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg"
                      onClick={(e) => { e.stopPropagation(); setArchiveDialogId(story.id) }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Eliminar historia</p></TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg"
                      onClick={(e) => { e.stopPropagation(); handleRestore(story.id) }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Restaurar historia</p></TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )
      },
    },
  ], [navigate, handleOpenEdit, handleRestore, epics])

  const table = useReactTable({
    data: paginatedStories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-full overflow-hidden flex flex-col p-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Historias', href: '/stories' }]} />
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Historias
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl">
            Gestiona tus User Stories de Jira y sus sub-tareas asociadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="lg"
            className="shrink-0 h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all active:scale-95"
            onClick={() => { setIsCreateOpen(true) }}
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Historia
          </Button>
        </div>
      </header>

      {/* Filters/Search */}
      <div className="flex flex-col md:flex-row gap-4 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input 
            placeholder="Buscar por código o título..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-11 h-12 bg-card/50 border-border/50 rounded-2xl focus:ring-primary/20 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Select value={epicFilter} onValueChange={(v) => { setEpicFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-card border-border/50 font-bold text-xs uppercase tracking-widest">
               <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
               <SelectValue placeholder="Filtrar por Épica" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-xl font-bold">
              <SelectItem value="all" className="uppercase tracking-widest text-[10px]">Todas las Épicas</SelectItem>
              {epics.map(e => (
                <SelectItem key={e.id} value={e.id} className="text-xs">{e.code}: {e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className={cn(
              "h-12 rounded-2xl border-border/50 px-5 text-xs font-black uppercase tracking-widest transition-all",
              showArchived ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground hover:bg-secondary"
            )}
            onClick={() => { setShowArchived(!showArchived); setCurrentPage(1); }}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showArchived ? 'Activas' : 'Archivadas'}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl">
        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="stories-list">
              {(provided) => (
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-xl border-b border-border/50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="h-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 whitespace-nowrap bg-transparent px-5">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <Draggable key={row.original.id} draggableId={row.original.id} index={row.index} isDragDisabled={epicFilter !== 'all' || search !== ''}>
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group border-b border-border/40 hover:bg-primary/5 transition-all cursor-pointer",
                                snapshot.isDragging && "bg-primary/10 shadow-lg scale-[1.01]"
                              )}
                              onClick={() => { void navigate(`/stories/${row.original.id}`) }}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-4 px-5 align-middle border-none">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-64 text-center border-none">
                          <div className="flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <div className="p-4 rounded-3xl bg-muted/20">
                              <BookOpen className="h-10 w-10 opacity-30" />
                            </div>
                            <div>
                               <p className="text-base font-black tracking-tight">Historias no encontradas</p>
                               <p className="text-xs font-medium opacity-60">
                                 {search ? `No hay resultados para "${search}"` : (showArchived ? 'No hay historias archivadas.' : 'No hay historias todavía.')}
                               </p>
                            </div>
                            {!showArchived && !search && (
                              <Button variant="outline" size="sm" onClick={() => { setIsCreateOpen(true) }} className="mt-2 text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-10">
                                Lanzar Primera Historia
                              </Button>
                            )}
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

        {/* Pagination Controls */}
        <div className="p-6 border-t border-border/40 bg-muted/10">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              Nueva Historia
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground ml-4">
              Crea una User Story para agrupar sub-tareas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Código Jira *</Label>
                <Input placeholder="PROJ-1" value={formCode} onChange={(e) => { setFormCode(e.target.value.toUpperCase()) }} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Módulo *</Label>
                <Input placeholder="Auth" value={formModule} onChange={(e) => { setFormModule(e.target.value) }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título *</Label>
              <Input placeholder="Título de la historia" value={formTitle} onChange={(e) => { setFormTitle(e.target.value) }} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Épica</Label>
              <Select value={formEpicId} onValueChange={(v) => { setFormEpicId(v) }}>
                <SelectTrigger className="bg-secondary/30 border-none font-medium h-10">
                  <SelectValue placeholder="Sin Épica" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  <SelectItem value="none">Sin Épica</SelectItem>
                  {epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id} className="text-xs">
                      {epic.code}: {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false) }}>Cancelar</Button>
            <Button onClick={handleCreate} className="font-bold">Crear Historia</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editStoryId} onOpenChange={(open) => { if (!open) setEditStoryId(null) }}>
        <DialogContent className="max-w-xl border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
               <Edit className="h-5 w-5 text-primary" /> Editar Historia
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código Jira</Label>
                <Input value={editForm.code} onChange={(e) => { setEditForm(p => ({ ...p, code: e.target.value.toUpperCase() })) }} />
              </div>
              <div className="space-y-2">
                <Label>Módulo</Label>
                <Input value={editForm.module} onChange={(e) => { setEditForm(p => ({ ...p, module: e.target.value })) }} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editForm.title} onChange={(e) => { setEditForm(p => ({ ...p, title: e.target.value })) }} />
            </div>
            <div className="space-y-2">
              <Label>Épica</Label>
              <Select value={editForm.epicId || 'none'} onValueChange={(v) => { setEditForm(p => ({ ...p, epicId: v === 'none' ? '' : v })) }}>
                <SelectTrigger className="bg-secondary/30 border-none">
                  <SelectValue placeholder="Sin Épica" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover">
                  <SelectItem value="none">Sin Épica</SelectItem>
                  {epics.map(epic => (
                    <SelectItem key={epic.id} value={epic.id} className="text-xs">
                      {epic.code}: {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => { setEditStoryId(null) }}>Cancelar</Button>
            <Button onClick={() => { setEditCommentDialog(true) }} className="font-bold">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CommentDialog
        open={editCommentDialog}
        onOpenChange={setEditCommentDialog}
        title="Justificar Cambio"
        description="Explica brevemente por qué estás modificando los metadatos de esta historia."
        onConfirm={handleUpdate}
      />

      <CommentDialog
        open={!!archiveDialogId}
        onOpenChange={(o) => { if (!o) setArchiveDialogId(null) }}
        title="Eliminar Historia"
        description="Esta historia pasará a estado eliminado (papelera). Podrás restaurarla después."
        variant="warning"
        confirmLabel="Eliminar"
        onConfirm={handleArchive}
      />
    </div>
  )
}
