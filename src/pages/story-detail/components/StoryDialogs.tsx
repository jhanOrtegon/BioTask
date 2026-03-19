import { Button } from '@/shared/components/button'
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Textarea } from '@/shared/components/textarea'
import { Copy, CopyCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '@/shared/components/form'
import { ConfirmDialog } from "@/shared/components/confirm-dialog"

const storyUpdateSchema = z.object({
 code: z.string().min(2, 'El código debe tener al menos 2 caracteres'),
 title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
 module: z.string().min(1, 'El módulo es obligatorio'),
 description: z.string().optional(),
})

type StoryUpdateValues = z.infer<typeof storyUpdateSchema>

interface StoryExportDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 markdown: string
 isCopied: boolean
 onCopy: () => void
}

export function StoryExportDialog({ open, onOpenChange, markdown, isCopied, onCopy }: StoryExportDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 🚀 Tech Spec Generated (Markdown)
 </DialogTitle>
 <DialogDescription>
 Usa este contenido para documentar en Jira, Confluence o Notion.
 </DialogDescription>
 </DialogHeader>
 <div className="flex-1 overflow-auto bg-muted/50 p-6 rounded-xl font-mono text-[11px] leading-relaxed border border-border mt-4 relative group">
 <Button 
 variant="secondary" 
 size="sm" 
 className="absolute top-4 right-4 h-8 gap-2 font-bold shadow-lg"
 onClick={onCopy}
 >
 {isCopied ? <CopyCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
 {isCopied ? '¡Copiado!' : 'Copiar MD'}
 </Button>
 <pre className="whitespace-pre-wrap">{markdown}</pre>
 </div>
 </DialogContent>
 </Dialog>
 )
}

interface StoryBulkDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 bulkText: string
 onBulkTextChange: (text: string) => void
 onSubmit: () => void
}

export function StoryBulkDialog({ open, onOpenChange, bulkText, onBulkTextChange, onSubmit }: StoryBulkDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Creación Masiva de Tareas</DialogTitle>
 <DialogDescription>
 Pega una lista de títulos (uno por línea) para crear múltiples tareas base.
 </DialogDescription>
 </DialogHeader>
 <div className="py-4 space-y-4">
 <Textarea 
 placeholder="Ejemplo:&#10;Crear API Endpoint&#10;Implementar UI de Filtros&#10;Añadir validaciones de esquema" 
 className="min-h-[200px] font-mono text-xs rounded-xl p-4"
 value={bulkText}
 onChange={(e) => { onBulkTextChange(e.target.value) }}
 />
 <Button className="w-full font-bold h-12 rounded-xl" onClick={onSubmit} disabled={!bulkText.trim()}>
 Generar Tareas Base
 </Button>
 </div>
 </DialogContent>
 </Dialog>
 )
}

interface StoryEditDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 defaultValues: StoryUpdateValues
 showConfirm: boolean
 onShowConfirmChange: (show: boolean) => void
 onConfirm: (values: StoryUpdateValues) => void
}

export function StoryEditDialog({ open, onOpenChange, defaultValues, showConfirm, onShowConfirmChange, onConfirm }: StoryEditDialogProps) {
 const form = useForm<StoryUpdateValues>({
 resolver: zodResolver(storyUpdateSchema),
 defaultValues
 })

 // Watch for changes in defaultValues and reset form
 // Actually it's better to pass reset function or handle it in the parent but let's keep it simple
 
 const handleUpdateClick = async () => {
 const isValid = await form.trigger()
 if (isValid) {
 onShowConfirmChange(true)
 }
 }

 return (
 <>
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-xl">
 <DialogHeader>
 <DialogTitle className="text-xl font-semibold">Editar Historia de Usuario</DialogTitle>
 <DialogDescription>Modifica los datos principales de esta historia.</DialogDescription>
 </DialogHeader>
 
 <Form {...form}>
 <form className="space-y-4 py-4">
 <div className="grid grid-cols-4 gap-4">
 <FormField
 control={form.control}
 name="code"
 render={({ field }) => (
 <FormItem className="col-span-1">
 <FormLabel className="font-bold text-xs">CÓDIGO</FormLabel>
 <FormControl>
 <Input placeholder="BIO-1" {...field} className="font-mono uppercase font-bold text-primary" />
 </FormControl>
 <FormMessage className="text-xs" />
 </FormItem>
 )}
 />
 <FormField
 control={form.control}
 name="module"
 render={({ field }) => (
 <FormItem className="col-span-3">
 <FormLabel className="font-bold text-xs text-muted-foreground ">Módulo</FormLabel>
 <FormControl>
 <Input placeholder="Core / Auth / CRM" {...field} />
 </FormControl>
 <FormMessage className="text-xs" />
 </FormItem>
 )}
 />
 </div>

 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="font-bold text-xs text-muted-foreground ">Título</FormLabel>
 <FormControl>
 <Input placeholder="Ej: Implementar Login con OAuth" {...field} />
 </FormControl>
 <FormMessage className="text-xs" />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="font-bold text-xs text-muted-foreground ">Descripción</FormLabel>
 <FormControl>
 <Textarea placeholder="Detalles de la historia..." className="min-h-[100px] resize-none" {...field} />
 </FormControl>
 <FormMessage className="text-xs" />
 </FormItem>
 )}
 />

 <div className="flex justify-end gap-3 pt-6">
 <Button variant="ghost" type="button" onClick={() => { onOpenChange(false) }} className="font-bold">Cancelar</Button>
 <Button type="button" onClick={() => { void handleUpdateClick() }} className="font-bold px-8 shadow-lg shadow-primary/20">Guardar Cambios</Button>
 </div>
 </form>
 </Form>
 </DialogContent>
 </Dialog>

 <ConfirmDialog 
 open={showConfirm}
 onOpenChange={onShowConfirmChange}
 title="¿Confirmar cambios?"
 description="Se actualizarán los datos de la historia en todo el sistema."
 onConfirm={() => { onConfirm(form.getValues()) }}
 confirmText="Actualizar"
 />
 </>
 )
}
