import { useState } from 'react'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from '@/shared/components/dialog'
import { Button } from '@/shared/components/button'
import { Textarea } from '@/shared/components/textarea'
import { Label } from '@/shared/components/label'
import { AlertTriangle, MessageSquare } from 'lucide-react'

interface CommentDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 title: string
 description: string
 variant?: 'warning' | 'info'
 confirmLabel?: string
 onConfirm: (comment: string) => void
}

export function CommentDialog({
 open,
 onOpenChange,
 title,
 description,
 variant = 'info',
 confirmLabel = 'Confirmar',
 onConfirm,
}: CommentDialogProps) {
 const [comment, setComment] = useState('')

 const handleConfirm = () => {
 if (!comment.trim()) return
 onConfirm(comment.trim())
 setComment('')
 onOpenChange(false)
 }

 const handleCancel = () => {
 setComment('')
 onOpenChange(false)
 }

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-md border-border bg-popover shadow-2xl rounded-xl">
 <DialogHeader className="space-y-3">
 <div className="flex items-center gap-3">
 {variant === 'warning' ? (
 <div className="grid place-items-center h-10 w-10 rounded-xl bg-destructive/10 shrink-0">
 <AlertTriangle className="h-5 w-5 text-destructive" />
 </div>
 ) : (
 <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 shrink-0">
 <MessageSquare className="h-5 w-5 text-primary" />
 </div>
 )}
 <div>
 <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
 <DialogDescription className="text-sm text-muted-foreground mt-1">
 {description}
 </DialogDescription>
 </div>
 </div>
 </DialogHeader>

 <div className="space-y-2 py-2">
 <Label htmlFor="audit-comment" className="text-xs font-bold text-muted-foreground">
 Comentario obligatorio
 </Label>
 <Textarea
 id="audit-comment"
 placeholder="Explica el motivo de esta acción..."
 value={comment}
 onChange={(e) => { setComment(e.target.value) }}
 className="min-h-[100px] resize-none"
 autoFocus
 />
 {comment.length === 0 && (
 <p className="text-[11px] text-destructive/70 font-medium">
 Debes escribir un comentario para continuar
 </p>
 )}
 </div>

 <DialogFooter className="gap-2">
 <Button variant="outline" onClick={handleCancel}>
 Cancelar
 </Button>
 <Button
 onClick={handleConfirm}
 disabled={!comment.trim()}
 className={variant === 'warning' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
 >
 {confirmLabel}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
