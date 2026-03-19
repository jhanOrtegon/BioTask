import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
} from "@/shared/components/dialog"
import { JiraPreview } from "@/features/tasks/components/JiraPreview"
import { CommentDialog } from "@/shared/components/comment-dialog"
import { ConfirmDialog } from "@/shared/components/confirm-dialog"

interface EditorDialogsProps {
 previewModalOpen: boolean
 setPreviewModalOpen: (v: boolean) => void
 justificationModalOpen: boolean
 setJustificationModalOpen: (v: boolean) => void
 onConfirmJustification: (comment: string) => void
 
 showClearConfirm: boolean
 setShowClearConfirm: (v: boolean) => void
 onConfirmClear: () => void
 
 showFinishConfirm: boolean
 setShowFinishConfirm: (v: boolean) => void
 onConfirmFinish: () => void
 isEditing: boolean
 
 importFileName: string | null
 onConfirmImport: () => void
 onCancelImport: () => void
}

export function EditorDialogs({
 previewModalOpen, setPreviewModalOpen,
 justificationModalOpen, setJustificationModalOpen, onConfirmJustification,
 showClearConfirm, setShowClearConfirm, onConfirmClear,
 showFinishConfirm, setShowFinishConfirm, onConfirmFinish, isEditing,
 importFileName, onConfirmImport, onCancelImport
}: EditorDialogsProps) {
 return (
 <>
 <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
 <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-xl">
 <DialogHeader>
 <DialogTitle className="text-lg font-bold">Vista Previa de Jira</DialogTitle>
 </DialogHeader>
 <JiraPreview />
 </DialogContent>
 </Dialog>

 <CommentDialog
 open={justificationModalOpen}
 onOpenChange={setJustificationModalOpen}
 title="Justificar Cambio"
 description="Explica brevemente por qué estás editando esta tarea."
 confirmLabel="Actualizar"
 onConfirm={onConfirmJustification}
 />

 <ConfirmDialog
 open={showClearConfirm}
 onOpenChange={setShowClearConfirm}
 onConfirm={onConfirmClear}
 title="¿Limpiar formulario?"
 description="Se eliminarán todos los datos actuales."
 variant="destructive"
 />

 <ConfirmDialog
 open={showFinishConfirm}
 onOpenChange={setShowFinishConfirm}
 onConfirm={onConfirmFinish}
 title={isEditing ? "¿Actualizar tarea?" : "¿Finalizar tarea?"}
 description={isEditing ? "Se guardarán los cambios." : "La tarea se guardará en la historia."}
 />

 <ConfirmDialog
 open={!!importFileName}
 onOpenChange={(open) => { if (!open) onCancelImport() }}
 onConfirm={onConfirmImport}
 title="¿Importar JSON?"
 description={`Se sobrescribirán los campos con los datos de ${importFileName || ''}.`}
 />
 </>
 )
}
