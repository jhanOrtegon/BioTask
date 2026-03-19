import {
 Dialog,
 DialogContent,
 DialogTitle,
} from '@/shared/components/dialog'
import { Label } from '@/shared/components/label'
import { Input } from '@/shared/components/input'
import { Textarea } from '@/shared/components/textarea'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { Button } from '@/shared/components/button'
import { Layers, X } from 'lucide-react'
import { cn } from '@/shared/utils'

interface EpicForm {
 code: string
 status: 'planning' | 'active' | 'completed'
 title: string
 description: string
 color: string
}


interface EpicsDialogsProps {
 isDialogOpen: boolean
 setIsDialogOpen: (v: boolean) => void
 editingEpic: string | null
 form: EpicForm
 setForm: React.Dispatch<React.SetStateAction<EpicForm>>
 onSave: () => void
 
}

export function EpicsDialogs({
 isDialogOpen, setIsDialogOpen, editingEpic, form, setForm, onSave
}: EpicsDialogsProps) {
 return (
 <>
 {/* Creation/Edit */}
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogContent className="max-w-xl border-none bg-popover shadow-2xl rounded-xl p-0 overflow-hidden">
 <div className="relative p-10 space-y-8">
 <Button variant="ghost" size="icon" className="absolute right-6 top-6 rounded-full" onClick={() => { setIsDialogOpen(false) }}><X className="h-5 w-5"/></Button>
 <div className="space-y-2">
 <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2"><Layers className="h-6 w-6" /></div>
 <DialogTitle className="text-3xl font-semibold tracking-tighter text-foreground">{editingEpic ? 'Editar Épica' : 'Nueva Épica'}</DialogTitle>
 </div>
 <div className="space-y-6">
 <div className="grid grid-cols-3 gap-6">
 <div className="col-span-1 space-y-2">
 <Label className="text-[11px] font-semibold uppercase text-muted-foreground">Código</Label>
 <Input value={form.code} onChange={e => { setForm((p) => ({...p, code: e.target.value.toUpperCase()})) }} className="h-12 bg-secondary/30 border-none rounded-xl font-mono font-bold" />
 </div>
 <div className="col-span-2 space-y-2">
 <Label className="text-[11px] font-semibold uppercase text-muted-foreground">Estado</Label>
 <Select value={form.status} onValueChange={v => { setForm((p) => ({...p, status: v as EpicForm['status']})) }}>
 <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-xl font-bold uppercase text-xs tracking-wide"><SelectValue /></SelectTrigger>
 <SelectContent className="rounded-xl border-border bg-popover font-bold text-xs"><SelectItem value="planning">PLANIFICACIÓN</SelectItem><SelectItem value="active">ACTIVO</SelectItem><SelectItem value="completed">COMPLETADO</SelectItem></SelectContent>
 </Select>
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-[11px] font-semibold uppercase text-muted-foreground">Título</Label>
 <Input value={form.title} onChange={e => { setForm((p) => ({...p, title: e.target.value})) }} className="h-14 bg-secondary/30 border-none rounded-xl text-lg font-bold" />
 </div>
 <div className="space-y-2">
 <Label className="text-[11px] font-semibold uppercase text-muted-foreground">Descripción</Label>
 <Textarea value={form.description} onChange={e => { setForm((p) => ({...p, description: e.target.value})) }} className="min-h-[120px] bg-secondary/30 border-none rounded-[1.5rem] resize-none" />
 </div>
 <div className="space-y-4">
 <Label className="text-[11px] font-semibold uppercase text-muted-foreground">Color</Label>
 <div className="flex gap-4">
 {['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
 <button key={c} className={cn("h-10 w-10 rounded-xl transition-all", form.color === c ? "ring-4 ring-primary/20 scale-110" : "opacity-60")} style={{ backgroundColor: c }} onClick={() => { setForm((p) => ({...p, color: c})) }} />
 ))}
 </div>
 </div>
 <div className="flex gap-3 pt-4">
 <Button className="flex-1 h-14 rounded-xl font-semibold" onClick={() => { onSave() }}>{editingEpic ? 'Guardar' : 'Crear'}</Button>
 <Button variant="outline" className="flex-1 h-14 rounded-xl font-bold" onClick={() => { setIsDialogOpen(false) }}>Cancelar</Button>
 </div>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 </>
 )
}
