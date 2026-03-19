import { useState } from 'react'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Textarea } from '@/shared/components/textarea'
import { 
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { 
 Plus, 
 ChevronRight,
 Sparkles,
 Target,
 Clock,
 Layout,
 Globe,
 Trash2,
 Activity
} from 'lucide-react'
import type { TeamMember } from '@/features/team/types'
import type { Story } from '@/features/stories/types'
import type { TaskDraft } from '@/features/tasks/types'
import type { TaskType, ServiceDetail } from '@/features/templates/types'
import { cn } from '@/shared/utils'
import { JsonTextarea } from '@/shared/components/json-textarea'

interface BioTaskCreateProps {
 stories: Story[]
 members: TeamMember[]
 onCreate: (data: Partial<TaskDraft> & { storyId: string }) => void
 onCancel: () => void
}

export function BioTaskCreate({ stories, members, onCreate, onCancel }: BioTaskCreateProps) {
 const [step, setStep] = useState(1)
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 storyId: '',
 assignedTo: '',
 priority: 'medium' as TaskDraft['priority'],
 type: 'feature' as TaskType,
 estimatedHours: 4,
 services: [] as ServiceDetail[]
 })

 const addService = () => {
 const newService: ServiceDetail = {
 id: crypto.randomUUID(),
 name: '',
 url: '',
 method: 'GET',
 response: ''
 }
 setFormData({ ...formData, services: [...formData.services, newService] })
 }

 const updateService = (id: string, updates: Partial<ServiceDetail>) => {
 setFormData({
 ...formData,
 services: formData.services.map(s => s.id === id ? { ...s, ...updates } : s)
 })
 }

 const removeService = (id: string) => {
 setFormData({
 ...formData,
 services: formData.services.filter(s => s.id !== id)
 })
 }

 const activeStories = stories.filter(s => s.status === 'active')

 const handleCreate = () => {
 onCreate({
 ...formData,
 status: 'pending',
 data: {
 objective: formData.description,
 services: formData.services,
 requirements: [],
 validations: []
 }
 } as Partial<TaskDraft> & { storyId: string })
 }

 return (
 <div className="flex flex-col h-full bg-background rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-right duration-500">
 <div className="flex-1 flex flex-col p-8 pt-12 max-w-2xl mx-auto w-full">
 {/* Header */}
 <div className="mb-12">
 <div className="flex items-center gap-3 mb-4">
 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
 <Sparkles className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-2xl font-semibold text-foreground ">Configurar <span className="text-primary italic">Nodo</span></h2>
 <p className="text-[11px] font-semibold text-muted-foreground opacity-60">Inicialización de Tarea BioTask</p>
 </div>
 </div>
 
 {/* Step Indicator */}
 <div className="flex items-center gap-2">
 {[1, 2, 3].map((s) => (
 <div 
 key={s} 
 className={cn(
 "h-1.5 rounded-full transition-all duration-300",
 step === s ? "w-12 bg-primary" : "w-1.5 bg-muted"
 )} 
 />
 ))}
 </div>
 </div>

 <div className="flex-1 space-y-8">
 {step === 1 ? (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Título de la Tarea</label>
 <Input 
 placeholder="Ej: Optimizar Pipeline de Datos"
 value={formData.title}
 onChange={(e) => { setFormData({ ...formData, title: e.target.value }) }}
 className="h-14 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-6 text-lg font-bold placeholder:font-medium transition-all focus:ring-2 focus:ring-primary/20 shadow-sm"
 />
 </div>

 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Descripción y Objetivos</label>
 <Textarea 
 placeholder="Describe los alcances y metas de esta ejecución..."
 value={formData.description}
 onChange={(e) => { setFormData({ ...formData, description: e.target.value }) }}
 className="min-h-[120px] bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-sm font-medium resize-none transition-all focus:ring-2 focus:ring-primary/20 shadow-sm"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Tipo de Tarea</label>
 <Select value={formData.type} onValueChange={(v) => { setFormData({ ...formData, type: v as TaskType }) }}>
 <SelectTrigger className="h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold shadow-sm">
 <div className="flex items-center gap-2">
 <Layout className="h-4 w-4 text-primary" />
 <SelectValue />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 <SelectItem value="feature">✨ Feature</SelectItem>
 <SelectItem value="bug">🐞 Bugfix</SelectItem>
 <SelectItem value="refactor">🛠️ Refactor</SelectItem>
 <SelectItem value="docs">📄 Docs</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Urgencia</label>
 <Select value={formData.priority as string} onValueChange={(v) => { setFormData({ ...formData, priority: v as TaskDraft['priority'] }) }}>
 <SelectTrigger className="h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold shadow-sm">
 <div className="flex items-center gap-2">
 <Target className="h-4 w-4 text-primary" />
 <SelectValue />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 <SelectItem value="low">Baja</SelectItem>
 <SelectItem value="medium">Media</SelectItem>
 <SelectItem value="high">Alta</SelectItem>
 <SelectItem value="urgent">Crítica</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 ) : step === 2 ? (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Historia Relacionada</label>
 <Select value={formData.storyId} onValueChange={(v) => { setFormData({ ...formData, storyId: v }) }}>
 <SelectTrigger className="h-14 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-6 font-bold shadow-sm">
 <SelectValue placeholder="Vincular a una historia activa..." />
 </SelectTrigger>
 <SelectContent className="max-h-[300px] rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 {activeStories.map((s) => (
 <SelectItem key={s.id} value={s.id} className="py-3">
 <div className="space-y-0.5">
 <p className="font-bold">{s.title}</p>
 <p className="text-[11px] font-semibold text-primary opacity-60 ">{s.code}</p>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Dueño de Acción</label>
 <Select value={formData.assignedTo} onValueChange={(v) => { setFormData({ ...formData, assignedTo: v }) }}>
 <SelectTrigger className="h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold shadow-sm">
 <SelectValue placeholder="Sin asignar responsable" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 {members.map((m) => (
 <SelectItem key={m.id} value={m.id}>
 <div className="flex items-center gap-2">
 <img 
 src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} 
 className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
 alt={m.name}
 />
 <span className="font-bold text-xs">{m.name}</span>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <label className="text-[11px] font-medium text-slate-500 ml-1">Esfuerzo Estimado (h)</label>
 <div className="flex items-center gap-3 h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
 <Clock className="h-4 w-4 text-primary shrink-0" />
 <input 
 type="number" 
 className="bg-transparent border-none w-full font-semibold text-center focus:outline-none" 
 value={formData.estimatedHours}
 onChange={(e) => { setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 }) }}
 />
 </div>
 </div>
 </div>
 </div>
 ) : (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
 <Globe className="h-4 w-4" />
 </div>
 <h3 className="text-sm font-semibold text-foreground">Definición de Servicios</h3>
 </div>
 <Button variant="outline" size="sm" onClick={() => { addService() }} className="h-9 rounded-xl border-primary/20 hover:bg-primary/5 text-primary font-bold px-4">
 <Plus className="h-3.5 w-3.5 mr-2" /> Añadir
 </Button>
 </div>

 <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
 {formData.services.length === 0 ? (
 <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
 <div className="p-3 rounded-xl bg-slate-50 dark:bg-card text-slate-400">
 <Activity className="h-6 w-6" />
 </div>
 <p className="text-[11px] font-medium text-slate-400">No hay servicios definidos para esta tarea</p>
 </div>
 ) : (
 formData.services.map((service) => (
 <div key={service.id} className="p-5 bg-white dark:bg-card border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 relative group hover:border-primary/30 transition-all shadow-sm">
 <Button 
 variant="ghost" 
 size="icon" 
 onClick={() => { removeService(service.id) }}
 className="absolute top-4 right-4 h-8 w-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
 >
 <Trash2 className="h-4 w-4" />
 </Button>

 <div className="grid grid-cols-1 gap-4">
 <div className="flex gap-2">
 <Select 
 value={service.method} 
 onValueChange={(v) => { updateService(service.id, { method: v as ServiceDetail['method'] }) }}
 >
 <SelectTrigger className="w-[100px] h-11 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-[11px]">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
 <SelectItem value="GET" className="text-emerald-500 font-bold">GET</SelectItem>
 <SelectItem value="POST" className="text-blue-500 font-bold">POST</SelectItem>
 <SelectItem value="PUT" className="text-amber-500 font-bold">PUT</SelectItem>
 <SelectItem value="DELETE" className="text-rose-500 font-bold">DELETE</SelectItem>
 </SelectContent>
 </Select>
 <Input 
 placeholder="Nombre del Endpoint"
 value={service.name}
 onChange={(e) => { updateService(service.id, { name: e.target.value }) }}
 className="h-11 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs"
 />
 </div>
 <Input 
 placeholder="/api/v1/resource/path..."
 value={service.url}
 onChange={(e) => { updateService(service.id, { url: e.target.value }) }}
 className="h-11 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[11px] font-mono"
 />
 <JsonTextarea 
 placeholder="Contrato de respuesta..."
 value={service.response}
 onChange={(e) => { updateService(service.id, { response: e.target.value }) }}
 onPrettify={(val) => { updateService(service.id, { response: val }) }}
 />

 {['POST', 'PUT', 'PATCH'].includes(service.method) && (
 <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
 <div className="flex items-center justify-between">
 <label className="text-[11px] font-medium text-slate-500">Payload Request</label>
 <Select 
 value={service.payloadType || 'JSON'} 
 onValueChange={(v) => { updateService(service.id, { payloadType: v as ServiceDetail['payloadType'] }) }}
 >
 <SelectTrigger className="w-[100px] h-7 bg-white dark:bg-background border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-xl">
 <SelectItem value="JSON">JSON</SelectItem>
 <SelectItem value="FormData">FormData</SelectItem>
 <SelectItem value="Text">Text</SelectItem>
 <SelectItem value="None">None</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <JsonTextarea 
 placeholder="Estructura del Body..."
 value={service.payload}
 onChange={(e) => { updateService(service.id, { payload: e.target.value }) }}
 onPrettify={(val) => { updateService(service.id, { payload: val }) }}
 />
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>

 {/* Footer Actions */}
 <div className="flex items-center justify-between pt-12">
 <Button variant="ghost" onClick={() => { onCancel() }} className="rounded-xl h-14 px-8 font-semibold opacity-40 hover:opacity-100 hover:bg-transparent">
 Cancelar Operación
 </Button>
 
 <div className="flex gap-3">
 {step > 1 && (
 <Button 
 variant="outline" 
 onClick={() => { setStep(step - 1) }} 
 className="rounded-xl h-14 px-8 font-semibold bg-background border-border hover:bg-secondary/5 transition-all text-[11px] "
 >
 Anterior
 </Button>
 )}
 
 <Button 
 onClick={step < 3 ? () => { setStep(step + 1) } : () => { handleCreate() }} 
 disabled={step === 1 && !formData.title}
 className="rounded-xl h-14 px-10 font-semibold bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 text-[11px]"
 >
 {step < 3 ? (
 <div className="flex items-center gap-2">
 {step === 1 ? 'Continuar a Vinculación' : 'Revisar Servicios'} <ChevronRight className="h-4 w-4" />
 </div>
 ) : (
 <div className="flex items-center gap-2">
 Inicializar Nodo <Plus className="h-4 w-4" />
 </div>
 )}
 </Button>
 </div>
 </div>
 </div>
 </div>
 )
}
