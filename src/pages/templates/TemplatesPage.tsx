import { useState, useMemo, useCallback } from "react"
import { useTemplatesStore } from "@/features/templates/store"
import type { Template } from "@/features/templates/types"
import { Button } from "@/shared/components/button"
import { Edit, Trash2, FileJson, Eye, Search } from "lucide-react"
import { Badge } from "@/shared/components/badge"
import { Pagination } from "@/shared/components/pagination"
import { Input } from "@/shared/components/input"
import { useAuthStore } from "@/features/auth/store"
import {
 getCoreRowModel,
 useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"

import { TemplateHeader } from './components/TemplateHeader'
import { TemplateTable } from './components/TemplateTable'
import { TemplateDialog } from './components/TemplateDialog'

export function TemplatesPage() {
 const { role } = useAuthStore()
 const { templates, removeTemplate, addTemplate, updateTemplate } = useTemplatesStore()
 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
 const [isReadOnly, setIsReadOnly] = useState(false)
 const [search, setSearch] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(10)
 
 const handleDelete = useCallback((id: string) => {
 if (confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) {
 removeTemplate(id)
 }
 }, [removeTemplate])

 const handleOpenCreate = useCallback(() => {
 setEditingTemplate(null)
 setIsReadOnly(false)
 setIsDialogOpen(true)
 }, [])

 const handleOpenEdit = useCallback((template: Template) => {
 setEditingTemplate(template)
 setIsReadOnly(false)
 setIsDialogOpen(true)
 }, [])

 const handleOpenView = useCallback((template: Template) => {
 setEditingTemplate(template)
 setIsReadOnly(true)
 setIsDialogOpen(true)
 }, [])

 const handleSubmit = (data: Omit<Template, 'id' | 'createdAt'>) => {
 if (editingTemplate) {
 updateTemplate(editingTemplate.id, data)
 } else {
 addTemplate(data)
 }
 setIsDialogOpen(false)
 }

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
 className="capitalize text-xs tracking-wider font-bold px-2 py-0.5 rounded-md border-border/80 text-muted-foreground bg-secondary/30"
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
 <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
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
 <div className="flex justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/8 rounded-lg"
 title="Ver detalle" 
 onClick={() => { handleOpenView(template); }}
 >
 <Eye className="h-4 w-4" />
 </Button>
 {role !== 'Editor' && (
 <>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/8 rounded-lg"
 title="Clonar datos" 
 onClick={() => { addTemplate({ ...template, title: `${template.title} (Copia)` }); }}
 >
 <FileJson className="h-4 w-4" />
 </Button>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/8 rounded-lg"
 title="Editar"
 onClick={() => { handleOpenEdit(template); }}
 >
 <Edit className="h-4 w-4" />
 </Button>
 <Button 
 variant="ghost" 
 size="icon" 
 className="h-8 w-8 text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
 title="Eliminar"
 onClick={() => { handleDelete(template.id); }}
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
 [addTemplate, role, handleDelete, handleOpenEdit, handleOpenView]
 )

 const filteredTemplates = useMemo(() => {
 return templates.filter(t => 
 t.title.toLowerCase().includes(search.toLowerCase()) ||
 t.description.toLowerCase().includes(search.toLowerCase())
 )
 }, [templates, search])

 const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)
 const paginatedTemplates = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage
 return filteredTemplates.slice(start, start + itemsPerPage)
 }, [filteredTemplates, currentPage, itemsPerPage])

 const table = useReactTable({
 data: paginatedTemplates,
 columns,
 getCoreRowModel: getCoreRowModel(),
 })

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
 <TemplateHeader 
 onAdd={handleOpenCreate} 
 />

 <div className="relative group max-w-md">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar plantilla estratégica..."
 value={search}
 onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
 className="pl-11 h-11 bg-background border border-border/40 rounded-xl focus:ring-2 focus:ring-primary/10 transition-all font-medium"
 />
 </div>

 <div className="flex flex-col flex-1 mt-4">
 <TemplateTable 
 table={table}
 columnCount={columns.length}
 role={role}
 onOpenCreate={handleOpenCreate}
 />
 
 <div className="pt-3">
 <Pagination 
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 totalItems={filteredTemplates.length}
 itemsPerPage={itemsPerPage}
 onItemsPerPageChange={(v) => {
 setItemsPerPage(v);
 setCurrentPage(1);
 }}
 />
 </div>
 </div>

 <TemplateDialog 
 open={isDialogOpen}
 onOpenChange={setIsDialogOpen}
 editingTemplate={editingTemplate}
 isReadOnly={isReadOnly}
 onSubmit={handleSubmit}
 />
 </div>
 </div>
 )
}
