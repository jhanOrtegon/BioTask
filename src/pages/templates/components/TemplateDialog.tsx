import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/shared/components/dialog'
import { TemplateForm } from '@/features/templates/components/TemplateForm'
import type { Template } from '@/features/templates/types'

interface TemplateDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 editingTemplate: Template | null
 isReadOnly: boolean
 onSubmit: (data: Omit<Template, 'id' | 'createdAt'>) => void
}

export function TemplateDialog({
 open,
 onOpenChange,
 editingTemplate,
 isReadOnly,
 onSubmit
}: TemplateDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-xl">
 <DialogHeader className="mb-4">
 <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
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
 onSubmit={onSubmit} 
 onCancel={() => { onOpenChange(false) }} 
 />
 </DialogContent>
 </Dialog>
 )
}
