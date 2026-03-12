import { useState, useMemo } from "react"
import { useTemplatesStore } from "@/features/templates/store"
import type { Template } from "@/features/templates/types"
import { Button } from "@/shared/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Plus, Edit, Trash2, FileJson, Layers, Eye } from "lucide-react"
import { Badge } from "@/shared/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { TemplateForm } from "@/features/templates/ui/TemplateForm"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { useAuthStore } from "@/features/auth/store"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"

export function TemplatesPage() {
  const { role } = useAuthStore()
  const { templates, removeTemplate, addTemplate, updateTemplate } = useTemplatesStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) {
      removeTemplate(id)
    }
  }

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setIsReadOnly(false)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate(template)
    setIsReadOnly(false)
    setIsDialogOpen(true)
  }

  const handleOpenView = (template: Template) => {
    setEditingTemplate(template)
    setIsReadOnly(true)
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: Omit<Template, 'id' | 'createdAt'>) => {
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, data)
    } else {
      addTemplate(data)
    }
    setIsDialogOpen(false)
  }

  // ── TanStack Table Columns ──
  const columns = useMemo<ColumnDef<Template>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Plantilla",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 py-1">
            <span className="font-bold text-foreground text-[13px] flex items-center gap-2">
              {row.original.title}
            </span>
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[400px]">
              {row.original.description}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "taskType",
        header: "Clasificación",
        cell: ({ row }) => {
          const type = row.original.taskType
          return (
            <Badge 
              variant="outline" 
              className="capitalize text-[10px] tracking-wider font-bold px-2 py-0.5 rounded-md border-border text-muted-foreground bg-secondary/50"
            >
              {type}
            </Badge>
          )
        },
      },
      {
        accessorKey: "serviceInfo",
        header: "Contexto Principal",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-medium">
            {row.original.serviceInfo || "Sin especificar"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const template = row.original
          return (
            <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                title="Ver detalle" 
                onClick={() => { handleOpenView(template) }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {role !== 'Editor' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                    title="Clonar datos" 
                    onClick={() => { addTemplate({ ...template, title: `${template.title} (Copia)` }) }}
                  >
                    <FileJson className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg"
                    title="Editar"
                    onClick={() => { handleOpenEdit(template) }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                    title="Eliminar"
                    onClick={() => { handleDelete(template.id) }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [addTemplate, role, handleDelete, handleOpenEdit, handleOpenView] // Added missing internal handlers
  )

  const finalColumns = columns

  const table = useReactTable({
    data: templates,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden bg-background">
      <Breadcrumbs items={[{ label: 'Plantillas' }]} />
      {/* ── Header Elegante ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Plantillas
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl pl-13">
            Gestiona los esquemas de tareas. Las plantillas sirven como molde predefinido
            con secciones y servicios configurados.
          </p>
        </div>
        {role !== 'Editor' && (
          <Button 
            size="lg" 
            className="shrink-0 h-11 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95" 
            onClick={handleOpenCreate}
          >
            <Plus className="mr-2 h-5 w-5" /> Nueva Plantilla
          </Button>
        )}
      </header>

      {/* ── TanStack Table Container ── */}
      <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-border bg-card shadow-2xl shadow-black/20">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-xl border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-11 text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap bg-transparent px-5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                    data-state={row.getIsSelected() && "selected"}
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
                      <Layers className="h-8 w-8 opacity-20" />
                      <p className="text-sm font-medium">No hay plantillas creadas todavía.</p>
                      {role !== 'Editor' && (
                        <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-2 text-xs font-bold rounded-lg border-border hover:bg-secondary">
                          Crear la primera
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla Pro"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground ml-4">
              Configura los valores predeterminados para estandarizar tus tareas.
            </DialogDescription>
          </DialogHeader>
          <TemplateForm 
            key={editingTemplate?.id || "new"}
            initialData={editingTemplate || undefined} 
            readOnly={isReadOnly}
            onSubmit={handleSubmit} 
            onCancel={() => { setIsDialogOpen(false) }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
