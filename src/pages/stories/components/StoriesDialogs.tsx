import { Button } from '@/shared/components/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { Edit } from 'lucide-react'
import type { Epic } from '@/features/epics/types'
import { CommentDialog } from '@/shared/components/comment-dialog'

interface EditStoryForm {
 code: string
 title: string
 module: string
 description: string
 epicId: string
}

interface StoryFormFields {
 code: string
 setCode: (v: string) => void
 title: string
 setTitle: (v: string) => void
 module: string
 setModule: (v: string) => void
 description: string
 setDesc: (v: string) => void
 epicId: string
 setEpicId: (v: string) => void
}

interface StoriesDialogsProps {
 isCreateOpen: boolean
 setIsCreateOpen: (v: boolean) => void
 formFields: StoryFormFields
 epics: Epic[]
 handleCreate: () => void
 editStoryId: string | null
 setEditStoryId: (v: string | null) => void
 editForm: EditStoryForm
 setEditForm: React.Dispatch<React.SetStateAction<EditStoryForm>>
 editCommentDialog: boolean
 setEditCommentDialog: (v: boolean) => void
 handleSaveEdit: (comment: string) => void
 
 archiveDialogId: string | null
 setArchiveDialogId: (v: string | null) => void
 handleArchive: (comment: string) => void
}

export function StoriesDialogs({
 isCreateOpen, setIsCreateOpen, formFields, epics, handleCreate,
 editStoryId, setEditStoryId, editForm, setEditForm, editCommentDialog, setEditCommentDialog, handleSaveEdit,
 archiveDialogId, setArchiveDialogId, handleArchive
}: StoriesDialogsProps) {
 return (
 <>
 <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
 <DialogContent className="max-w-lg border-border bg-popover shadow-2xl rounded-xl">
 <DialogHeader>
 <DialogTitle className="text-xl font-semibold flex items-center gap-2">
 <span className="h-2 w-2 rounded-full bg-primary inline-block" />
 Nueva Historia
 </DialogTitle>
 </DialogHeader>

 <div className="space-y-4 py-2">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-xs font-bold text-muted-foreground">Código *</Label>
 <Input placeholder="PROJ-1" value={formFields.code} onChange={(e) => { formFields.setCode(e.target.value.toUpperCase()) }} />
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-bold text-muted-foreground">Módulo *</Label>
 <Input placeholder="Auth" value={formFields.module} onChange={(e) => { formFields.setModule(e.target.value) }} />
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-bold text-muted-foreground">Título *</Label>
 <Input placeholder="Descripción corta" value={formFields.title} onChange={(e) => { formFields.setTitle(e.target.value) }} />
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-bold text-muted-foreground">Épica</Label>
 <Select value={formFields.epicId || 'none'} onValueChange={(v) => { formFields.setEpicId(v === 'none' ? '' : v) }}>
 <SelectTrigger className="bg-secondary/30 border-none font-medium h-10">
 <SelectValue placeholder="Sin Épica" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border bg-popover">
 <SelectItem value="none">Sin Épica</SelectItem>
 {epics.map((epic: Epic) => (
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
 <Button onClick={() => { handleCreate() }} className="font-bold">Crear Historia</Button>
 </div>
 </DialogContent>
 </Dialog>

 <Dialog open={!!editStoryId} onOpenChange={(open) => { if (!open) setEditStoryId(null) }}>
 <DialogContent className="max-w-xl border-border bg-popover shadow-2xl rounded-xl">
 <DialogHeader>
 <DialogTitle className="text-xl font-bold flex items-center gap-2">
 <Edit className="h-5 w-5 text-primary" /> Editar Historia
 </DialogTitle>
 </DialogHeader>
 <div className="space-y-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Código</Label>
 <Input value={editForm.code} onChange={(e) => { setEditForm((p) => ({ ...p, code: e.target.value.toUpperCase() })) }} />
 </div>
 <div className="space-y-2">
 <Label>Módulo</Label>
 <Input value={editForm.module} onChange={(e) => { setEditForm((p) => ({ ...p, module: e.target.value })) }} />
 </div>
 </div>
 <div className="space-y-2">
 <Label>Título</Label>
 <Input value={editForm.title} onChange={(e) => { setEditForm((p) => ({ ...p, title: e.target.value })) }} />
 </div>
 <div className="space-y-2">
 <Label>Épica</Label>
 <Select value={editForm.epicId || 'none'} onValueChange={(v) => { setEditForm((p) => ({ ...p, epicId: v === 'none' ? '' : v })) }}>
 <SelectTrigger className="bg-secondary/30 border-none">
 <SelectValue placeholder="Sin Épica" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border bg-popover">
 <SelectItem value="none">Sin Épica</SelectItem>
 {epics.map((epic: Epic) => (
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
 <Button onClick={() => { setEditCommentDialog(true) }} className="font-bold">Guardar</Button>
 </div>
 </DialogContent>
 </Dialog>

 <CommentDialog
 open={editCommentDialog}
 onOpenChange={setEditCommentDialog}
 title="Justificar Cambio"
 description="Explica por qué estás editando esta historia."
 onConfirm={handleSaveEdit}
 />

 <CommentDialog
 open={!!archiveDialogId}
 onOpenChange={(o) => { if (!o) setArchiveDialogId(null) }}
 title="Eliminar Historia"
 description="Explica por qué estás eliminando esta historia."
 variant="warning"
 confirmLabel="Eliminar"
 onConfirm={handleArchive}
 />
 </>
 )
}
