import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
} from '@/shared/components/dialog'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { 
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from '@/shared/components/form'
import { 
 CalendarDays, 
 Settings2, 
 Target,
 CheckCircle2,
 AlertCircle
} from 'lucide-react'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { CommentDialog } from '@/shared/components/comment-dialog'
import type { Story } from '@/features/stories/types'
import type { Sprint } from '@/features/sprints/types'
import type { UseFormReturn } from 'react-hook-form'
import type { SprintFormValues } from '../hooks/useSprintsLogic'

interface SprintsDialogsProps {
 isDialogOpen: boolean
 setIsDialogOpen: (v: boolean) => void
 editingSprint: Sprint | null
 form: UseFormReturn<SprintFormValues>
 activeStories: Story[]
 selectedStoryIds: string[]
 onToggleStory: (id: string) => void
 onSave: () => void | Promise<void>
 
 showSaveConfirm: boolean
 setShowSaveConfirm: (v: boolean) => void
 onConfirmSave: () => void
 
 showLaunchConfirm: boolean
 setShowLaunchConfirm: (v: boolean) => void
 onConfirmLaunch: () => void
 
 showEditAudit: boolean
 setShowEditAudit: (v: boolean) => void
 onConfirmAudit: (comment: string) => void
}

export function SprintsDialogs({
 isDialogOpen, setIsDialogOpen, editingSprint, form, activeStories, selectedStoryIds, onToggleStory, onSave,
 showSaveConfirm, setShowSaveConfirm, onConfirmSave,
 showLaunchConfirm, setShowLaunchConfirm, onConfirmLaunch,
 showEditAudit, setShowEditAudit, onConfirmAudit
}: SprintsDialogsProps) {
 return (
 <>
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogContent className="sm:max-w-xl rounded-xl border-primary/10 p-0 overflow-hidden shadow-2xl bg-card">
 <div className="bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-8 pb-6 border-b border-border/70">
 <DialogHeader className="space-y-1">
 <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
 {editingSprint ? <Settings2 className="h-6 w-6 text-primary" /> : <Target className="h-6 w-6 text-primary" />}
 {editingSprint ? 'Arquitectura del Sprint' : 'Configurar Nuevo Ciclo'}
 </DialogTitle>
 <DialogDescription className="text-sm font-medium">
 {editingSprint ? `Modificando parámetros de ${editingSprint.name}` : 'Establece las bases para la próxima iteración.'}
 </DialogDescription>
 </DialogHeader>
 </div>

 <div className="p-8 pt-2 space-y-6">
 <Form {...form}>
 <form onSubmit={(e) => { void form.handleSubmit(onSave)(e) }} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="md:col-span-2">
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-bold text-muted-foreground ml-1">Identificador del Sprint *</FormLabel>
 <FormControl>
 <Input placeholder="Ej. Sprint 42" className="h-11 rounded-xl bg-muted/30 border-border/50" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 
 <FormField
 control={form.control}
 name="startDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-bold text-muted-foreground ml-1">Lanzamiento *</FormLabel>
 <FormControl>
 <div className="relative">
 <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input type="date" className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50" {...field} />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <FormField
 control={form.control}
 name="endDate"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-bold text-muted-foreground ml-1">Cierre Estimado *</FormLabel>
 <FormControl>
 <div className="relative">
 <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
 <Input type="date" className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50" {...field} />
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 <div className="md:col-span-2">
 <FormField
 control={form.control}
 name="goal"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-xs font-bold text-muted-foreground ml-1">Objetivo de Negocio</FormLabel>
 <FormControl>
 <Textarea placeholder="Meta del sprint..." className="min-h-[100px] rounded-xl bg-muted/30 border-border/50 py-3 px-4 resize-none" {...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between ml-1">
 <Label className="text-xs font-bold text-muted-foreground">Vincular Historias</Label>
 <Badge variant="secondary" className="text-xs font-semibold tracking-tighter px-2 bg-primary/5">
 {selectedStoryIds.length} SELECCIONADAS
 </Badge>
 </div>
 
 <div className="max-h-[180px] overflow-y-auto space-y-1 p-2 bg-muted/10 border border-border/40 rounded-xl custom-scrollbar">
 {activeStories.length === 0 ? (
 <div className="py-8 text-center px-4">
 <AlertCircle className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
 <p className="text-xs text-muted-foreground font-bold">No hay historias activas.</p>
 </div>
 ) : (
 activeStories.map(story => {
 const isSelected = selectedStoryIds.includes(story.id)
 return (
 <div 
 key={story.id} 
 className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-muted/30'}`}
 onClick={() => { onToggleStory(story.id) }}
 >
 <div className="flex items-center gap-3">
 <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
 {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
 </div>
 <div>
 <span className="block text-xs font-semibold text-primary/70">{story.code}</span>
 <span className="text-xs font-bold leading-none line-clamp-1">{story.title}</span>
 </div>
 </div>
 <Badge variant="outline" className="text-xs opacity-50">{story.status}</Badge>
 </div>
 )
 })
 )}
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/50 font-bold">
 <Button type="button" variant="ghost" onClick={() => { setIsDialogOpen(false) }}>Cancelar</Button>
 <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/10">
 {editingSprint ? 'Guardar' : 'Planificar'}
 </Button>
 </div>
 </form>
 </Form>
 </div>
 </DialogContent>
 </Dialog>

 <ConfirmDialog
 open={showSaveConfirm}
 onOpenChange={setShowSaveConfirm}
 onConfirm={onConfirmSave}
 title={editingSprint ? "¿Guardar cambios?" : "¿Confirmar planificación?"}
 description={editingSprint ? "Se sobrescribirán los datos actuales." : "Se creará un nuevo ciclo."}
 confirmText="Confirmar"
 />
 <ConfirmDialog
 open={showLaunchConfirm}
 onOpenChange={setShowLaunchConfirm}
 onConfirm={onConfirmLaunch}
 title="¿Lanzar nuevo Sprint?"
 description="Hay otro sprint activo. El anterior se completará automáticamente."
 confirmText="Sí, lanzar"
 />

 <CommentDialog
 open={showEditAudit}
 onOpenChange={setShowEditAudit}
 title="Justificar Cambios"
 description="Explica qué has modificado en este sprint."
 onConfirm={onConfirmAudit}
 />
 </>
 )
}
