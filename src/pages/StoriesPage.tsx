import { useState, useMemo } from 'react'
import { useStoriesStore } from '@/features/stories/store'
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
import { Textarea } from '@/shared/ui/textarea'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { BookOpen, Plus, Archive, RotateCcw, Eye, Edit, GripVertical } from 'lucide-react'
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function StoriesPage() {
  const { stories, addStory, updateStory, archiveStory, restoreStory, reorderStory } = useStoriesStore()
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [archiveDialogId, setArchiveDialogId] = useState<string | null>(null)

  const [editStoryId, setEditStoryId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    code: '',
    title: '',
    module: '',
    description: ''
  })

  // ── Form state ──
  const [formCode, setFormCode] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formModule, setFormModule] = useState('')
  const [formDesc, setFormDesc] = useState('')

  const filteredStories = useMemo(() => stories
    .filter(s => showArchived ? s.status === 'archived' : s.status === 'active')
    .sort((a, b) => (a.position || 0) - (b.position || 0))
  , [stories, showArchived])

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
    })
    toast.success('Historia creada', { description: `${story.code} — ${story.title}` })
    setFormCode(''); setFormTitle(''); setFormModule(''); setFormDesc('')
    setIsCreateOpen(false)
  }

  const handleArchive = (comment: string) => {
    if (!archiveDialogId) return
    const story = stories.find(s => s.id === archiveDialogId)
    archiveStory(archiveDialogId, comment)
    toast.warning('Historia eliminada', { description: `${story?.code || ''} — ${comment}` })
    setArchiveDialogId(null)
  }

  const handleRestore = (id: string) => {
    const story = stories.find(s => s.id === id)
    restoreStory(id, 'Restaurada manualmente')
    toast.success('Historia restaurada', { description: story?.code || '' })
  }

  const handleOpenEdit = (story: Story) => {
    setEditStoryId(story.id)
    setEditForm({
      code: story.code,
      title: story.title,
      module: story.module,
      description: story.description || ''
    })
  }

  const handleUpdate = () => {
    if (!editStoryId) return
    if (!editForm.code.trim() || !editForm.title.trim() || !editForm.module.trim()) {
      toast.error('Campos obligatorios vacíos')
      return
    }
    updateStory(editStoryId, editForm, 'Historia editada desde la lista')
    toast.success('Historia actualizada')
    setEditStoryId(null)
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
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const story = row.original
        return (
          <div className="flex justify-end gap-1">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    onClick={() => { void navigate(`/stories/${story.id}`) }}
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
                      onClick={() => { handleOpenEdit(story) }}
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
                      onClick={() => { setArchiveDialogId(story.id) }}
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
                      onClick={() => { handleRestore(story.id) }}
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
  ], [navigate, handleOpenEdit, handleRestore])

  const table = useReactTable({
    data: filteredStories,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-background">
      <Breadcrumbs items={[{ label: 'Historias' }]} />
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Historias
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl pl-13">
            Gestiona tus User Stories de Jira y sus sub-tareas asociadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-bold"
            onClick={() => { setShowArchived(!showArchived) }}
          >
            {showArchived ? 'Ver Activas' : 'Ver Eliminadas'}
          </Button>
          <Button
            size="lg"
            className="shrink-0 h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all active:scale-95"
            onClick={() => { setIsCreateOpen(true) }}
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Historia
          </Button>
        </div>
      </header>

      {/* Table */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="stories-list">
              {(provided) => (
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
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <Draggable key={row.original.id} draggableId={row.original.id} index={row.index}>
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`group border-b border-border hover:bg-secondary/40 transition-colors cursor-pointer ${snapshot.isDragging ? 'bg-secondary/60 shadow-lg' : ''}`}
                              onDoubleClick={() => { void navigate(`/stories/${row.original.id}`) }}
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
                            <p className="text-sm font-medium">
                              {showArchived ? 'No hay historias eliminadas.' : 'No hay historias creadas todavía.'}
                            </p>
                            {!showArchived && (
                              <Button variant="outline" size="sm" onClick={() => { setIsCreateOpen(true) }} className="mt-2 text-xs font-bold rounded-lg">
                                Crear la primera
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
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              Nueva Historia
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground ml-4">
              Crea una User Story para agrupar sub-tareas. El código debe coincidir con Jira.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Código Jira *
                </Label>
                <Input
                  placeholder="PROJ-1234"
                  value={formCode}
                  onChange={(e) => { setFormCode(e.target.value) }}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Módulo *
                </Label>
                <Input
                  placeholder="Autenticación, Dashboard..."
                  value={formModule}
                  onChange={(e) => { setFormModule(e.target.value) }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Título de la Historia *
              </Label>
              <Input
                placeholder="Como usuario quiero..."
                value={formTitle}
                onChange={(e) => { setFormTitle(e.target.value) }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Descripción (opcional)
              </Label>
              <Textarea
                placeholder="Contexto adicional..."
                value={formDesc}
                onChange={(e) => { setFormDesc(e.target.value) }}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false) }}>Cancelar</Button>
            <Button onClick={handleCreate} className="font-bold">
              <Plus className="mr-2 h-4 w-4" /> Crear Historia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStoryId} onOpenChange={(open) => { if (!open) setEditStoryId(null) }}>
        <DialogContent className="max-w-2xl border-border bg-popover shadow-2xl rounded-2xl">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" /> Editar Historia
              </h2>
              <p className="text-sm text-muted-foreground">Modifica los datos de la User Story.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Código Jira</Label>
                  <Input 
                    value={editForm.code} 
                    onChange={e => { setEditForm(prev => ({ ...prev, code: e.target.value.toUpperCase() })) }}
                    placeholder="PROJ-123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Módulo</Label>
                  <Input 
                    value={editForm.module} 
                    onChange={e => { setEditForm(prev => ({ ...prev, module: e.target.value })) }}
                    placeholder="Compras"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título de la Historia</Label>
                <Input 
                  value={editForm.title} 
                  onChange={e => { setEditForm(prev => ({ ...prev, title: e.target.value })) }}
                  placeholder="Ej: Gestionar órdenes de compra"
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea 
                  value={editForm.description} 
                  onChange={e => { setEditForm(prev => ({ ...prev, description: e.target.value })) }}
                  placeholder="Descripción opcional..."
                  className="min-h-[100px] bg-background"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setEditStoryId(null) }}>Cancelar</Button>
              <Button onClick={handleUpdate} className="font-bold">Guardar Cambios</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Comment Dialog */}
      <CommentDialog
        open={!!archiveDialogId}
        onOpenChange={(open) => { if (!open) setArchiveDialogId(null) }}
        title="Eliminar Historia"
        description="Esta historia pasará a estado eliminado (papelera). Podrás restaurarla después."
        variant="warning"
        confirmLabel="Eliminar"
        onConfirm={handleArchive}
      />
    </div>
  )
}
