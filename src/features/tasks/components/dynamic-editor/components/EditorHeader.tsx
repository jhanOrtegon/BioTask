import { Button } from "@/shared/components/button"
import { Input } from "@/shared/components/input"
import { Label } from "@/shared/components/label"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { FileCode, GitMerge, Wand2, ClipboardCopy } from "lucide-react"
import type { TaskDraft } from "../../../types"
import type { Template } from "@/features/templates/types"
import type { Story } from "@/features/stories/types"
import type { TeamMember } from "@/features/team/types"

interface EditorHeaderProps {
 currentTask: TaskDraft
 readOnly: boolean
 templates: Template[]
 stories: Story[]
 members: TeamMember[]
 onApplyTemplate: (id: string) => void
 onApplyStory: (id: string) => void
 onUpdateInfo: (info: Partial<TaskDraft>) => void
 onShowCommit: () => void
 onFillExample: () => void
 onCopyJira: () => void
}

export function EditorHeader({
 currentTask,
 readOnly,
 templates,
 stories,
 members,
 onApplyTemplate,
 onApplyStory,
 onUpdateInfo,
 onShowCommit,
 onFillExample,
 onCopyJira
}: EditorHeaderProps) {
 return (
 <div className="rounded-t-xl border border-border bg-card overflow-hidden">
 <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <FileCode className="h-3.5 w-3.5 text-primary" />
 <span className="text-xs font-bold text-foreground">task.config</span>
 </div>
 
 <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-border/50">
 <Select disabled={readOnly} value={currentTask.templateId || 'free'} onValueChange={onApplyTemplate}>
 <SelectTrigger className="h-7 w-[180px] text-[11px] font-bold border-none shadow-none focus:ring-0">
 <SelectValue placeholder="Sin Plantilla" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="free" className="text-[11px] font-bold text-muted-foreground">✨ Tarea Libre (Todos los campos)</SelectItem>
 {templates.map(t => (
 <SelectItem key={t.id} value={t.id} className="text-[11px]">{t.title}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <div className="w-px h-4 bg-border" />

 <Select disabled={readOnly} value={currentTask.storyId || 'none'} onValueChange={onApplyStory}>
 <SelectTrigger className="h-7 w-[180px] text-[11px] font-bold border-none shadow-none focus:ring-0">
 <SelectValue placeholder="Sin Historia" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="none" className="text-[11px] font-bold text-muted-foreground">🚫 Tarea Suelta</SelectItem>
 {stories.map(s => (
 <SelectItem key={s.id} value={s.id} className="text-[11px]">{s.code} - {s.title}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Button variant="outline" size="sm" className="gap-2 text-[11px] h-7 font-bold text-foreground bg-background border-border" onClick={onShowCommit}>
 <GitMerge className="h-3.5 w-3.5 text-blue-500" /> Auto-Commit
 </Button>
 {!readOnly && (
 <Button variant="ghost" size="sm" className="gap-1.5 text-[11px] h-7 font-bold text-primary hover:text-primary hover:bg-primary/10" onClick={onFillExample}>
 <Wand2 className="h-3 w-3" /> Ejemplo
 </Button>
 )}
 <Button variant="ghost" size="sm" className="gap-1.5 text-[11px] h-7 font-bold text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10" onClick={onCopyJira}>
 <ClipboardCopy className="h-3 w-3" /> Jira
 </Button>
 </div>
 </div>

 <div className="p-5 space-y-4">
 <div className="grid grid-cols-12 gap-3">
 <div className="col-span-12 lg:col-span-2 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">CÓDIGO</Label>
 <Input 
 disabled={readOnly}
 value={currentTask.code || ''}
 onChange={e => { onUpdateInfo({ code: e.target.value }) }}
 className="font-mono text-xs font-bold h-11 bg-background text-primary uppercase"
 placeholder="PROJ-123"
 />
 </div>
 <div className="col-span-12 lg:col-span-1 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">PRE</Label>
 <Select 
 disabled={readOnly}
 value={currentTask.techPrefix || ''} 
 onValueChange={(v: "BE-" | "FE-") => { onUpdateInfo({ techPrefix: v }) }}
 >
 <SelectTrigger className="h-11 bg-background font-mono text-xs font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="BE-">BE-</SelectItem>
 <SelectItem value="FE-">FE-</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="col-span-12 lg:col-span-5 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Título</Label>
 <Input 
 disabled={readOnly}
 value={currentTask.title} 
 onChange={e => { onUpdateInfo({ title: e.target.value }) }}
 className="font-semibold text-[15px] h-11 bg-background"
 placeholder="Nombre de la tarea..."
 />
 </div>
 <div className="col-span-6 lg:col-span-2 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Tipo</Label>
 <Select 
 disabled={readOnly}
 value={currentTask.type} 
 onValueChange={(v: string) => { onUpdateInfo({ type: v as TaskDraft['type'] }) }}
 >
 <SelectTrigger className="h-11 bg-background font-mono text-xs font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="feature">feature</SelectItem>
 <SelectItem value="bug">bug</SelectItem>
 <SelectItem value="refactor">refactor</SelectItem>
 <SelectItem value="chore">chore</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="col-span-6 lg:col-span-2 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Prioridad</Label>
 <Select 
 disabled={readOnly}
 value={currentTask.priority || 'medium'} 
 onValueChange={(v: string) => { onUpdateInfo({ priority: v as TaskDraft['priority'] }) }}
 >
 <SelectTrigger className="h-11 bg-background font-mono text-xs font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="low">🟡 Baja</SelectItem>
 <SelectItem value="medium">🔵 Media</SelectItem>
 <SelectItem value="high">🟠 Alta</SelectItem>
 <SelectItem value="urgent">🔴 Urgente</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="col-span-12 space-y-1.5 mt-1 border-t border-border/10 pt-3">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Asignado a</Label>
 <Select 
 disabled={readOnly}
 value={currentTask.assignedTo || 'unassigned'} 
 onValueChange={(v: string) => { onUpdateInfo({ assignedTo: v === 'unassigned' ? undefined : v }) }}
 >
 <SelectTrigger className="h-11 bg-background font-bold text-xs">
 <SelectValue placeholder="Sin asignar" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-border shadow-2xl">
 <SelectItem value="unassigned" className="text-muted-foreground italic">🚫 Sin asignar</SelectItem>
 {members.map(m => (
 <SelectItem key={m.id} value={m.id}>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-semibold">{m.name.charAt(0)}</span>
 <span>{m.name}</span>
 <span className="text-xs opacity-50">({m.role})</span>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="grid grid-cols-12 gap-3">
 <div className="col-span-6 lg:col-span-3 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Módulo</Label>
 <Input disabled={readOnly} value={currentTask.featureName || ''} onChange={e => { onUpdateInfo({ featureName: e.target.value }) }} placeholder="Auth" className="h-11 bg-background font-mono text-xs" />
 </div>
 <div className="col-span-6 lg:col-span-5 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Ruta</Label>
 <Input disabled={readOnly} value={currentTask.screenPath || ''} onChange={e => { onUpdateInfo({ screenPath: e.target.value }) }} placeholder="/home" className="h-11 bg-background font-mono text-xs" />
 </div>
 <div className="col-span-6 lg:col-span-2 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">Vencimiento</Label>
 <Input disabled={readOnly} type="date" value={currentTask.dueDate || ''} onChange={e => { onUpdateInfo({ dueDate: e.target.value }) }} className="h-11 bg-background font-mono text-xs font-bold" />
 </div>
 <div className="col-span-6 lg:col-span-2 space-y-1.5">
 <Label className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">H. Est.</Label>
 <Input disabled={readOnly} type="number" step="0.5" value={currentTask.estimatedHours || ''} onChange={e => { onUpdateInfo({ estimatedHours: e.target.value ? Number(e.target.value) : undefined }) }} className="h-11 bg-background font-mono text-xs font-bold" />
 </div>
 </div>
 </div>
 </div>
 )
}
