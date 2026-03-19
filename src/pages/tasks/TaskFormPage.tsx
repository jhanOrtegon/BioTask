import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
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
 ArrowLeft, 
 Save, 
 Trash2, 
 Layout, 
 Target, 
 Clock, 
 Plus,
 X,
 CheckCircle2,
 FileText,
 AlertCircle,
 Globe
} from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { toast } from 'sonner'
import type { TaskDraft } from '@/features/tasks/types'
import type { TaskType, ServiceDetail } from '@/features/templates/types'
import type { SectionData } from '@/features/stories/types'
import { JsonTextarea } from '@/shared/components/json-textarea'

export function TaskFormPage() {
 const { id } = useParams()
 const isEdit = !!id
 const navigate = useNavigate()
 const { stories, addTaskToStory, updateTask, archiveTask } = useStoriesStore()
 const { members } = useTeamStore()

 const existingTask = isEdit ? stories.flatMap(s => s.tasks).find(t => t.id === id) : null

 const [formData, setFormData] = useState(() => {
 if (existingTask) {
 return {
 title: existingTask.title,
 description: existingTask.data.objective,
 storyId: existingTask.storyId,
 assignedTo: existingTask.assignedTo || '',
 priority: existingTask.priority,
 type: existingTask.type,
 estimatedHours: existingTask.estimatedHours || 0,
 requirements: existingTask.data.requirements,
 validations: existingTask.data.validations,
 services: existingTask.data.services || [] as ServiceDetail[]
 }
 }
 return {
 title: '',
 description: '',
 storyId: '',
 assignedTo: '',
 priority: 'medium' as TaskDraft['priority'],
 type: 'feature' as TaskType,
 estimatedHours: 4,
 requirements: [] as string[],
 validations: [] as string[],
 services: [] as ServiceDetail[]
 }
 })

 // Synchronize storyId if it changes externally (e.g. initial load of existingTask)
 useEffect(() => {
 if (existingTask && existingTask.id === id) {
 setFormData({
 title: existingTask.title,
 description: existingTask.data.objective,
 storyId: existingTask.storyId,
 assignedTo: existingTask.assignedTo || '',
 priority: existingTask.priority,
 type: existingTask.type,
 estimatedHours: existingTask.estimatedHours || 0,
 requirements: existingTask.data.requirements,
 validations: existingTask.data.validations,
 services: existingTask.data.services || []
 })
 }
 }, [id, existingTask])

 const activeStories = stories.filter(s => s.status === 'active')

 const handleSave = () => {
 if (!formData.title || !formData.storyId) {
 toast.error('El título y la historia son obligatorios')
 return
 }

 const taskData: SectionData = {
 objective: formData.description,
 requirements: formData.requirements,
 validations: formData.validations,
 services: formData.services
 }

 const payload = {
 title: formData.title,
 type: formData.type,
 priority: (formData.priority || 'medium') as NonNullable<TaskDraft['priority']>,
 assignedTo: formData.assignedTo,
 estimatedHours: formData.estimatedHours,
 data: taskData
 }

 if (isEdit && id) {
 updateTask(formData.storyId, id, payload, 'Tarea actualizada')
 toast.success('Tarea actualizada correctamente')
 } else {
 addTaskToStory(formData.storyId, {
 ...payload,
 // @ts-expect-error code is not in signature
 code: `TSK-${String(Math.floor(Math.random() * 900) + 100)}`
 })
 toast.success('Nueva tarea creada')
 }
 void navigate('/tasks')
 }

 const handleDelete = () => {
 if (isEdit && id && existingTask) {
 archiveTask(existingTask.storyId, id, 'Tarea eliminada')
 toast.success('Tarea enviada al archivo')
 void navigate('/tasks')
 }
 }

 const addRequirement = () => {
 setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))
 }

 const updateRequirement = (index: number, val: string) => {
 const next = [...formData.requirements]
 next[index] = val
 setFormData(prev => ({ ...prev, requirements: next }))
 }

 const removeRequirement = (index: number) => {
 setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))
 }

 const addValidation = () => {
 setFormData(prev => ({ ...prev, validations: [...prev.validations, ''] }))
 }

 const updateValidation = (index: number, val: string) => {
 const next = [...formData.validations]
 next[index] = val
 setFormData(prev => ({ ...prev, validations: next }))
 }

 const removeValidation = (index: number) => {
 setFormData(prev => ({ ...prev, validations: prev.validations.filter((_, i) => i !== index) }))
 }

 const addService = () => {
 const newService: ServiceDetail = {
 id: crypto.randomUUID(),
 name: '',
 url: '',
 method: 'GET',
 response: ''
 }
 setFormData(prev => ({ ...prev, services: [...prev.services, newService] }))
 }

 const updateService = (id: string, updates: Partial<ServiceDetail>) => {
 setFormData(prev => ({
 ...prev,
 services: prev.services.map(s => s.id === id ? { ...s, ...updates } : s)
 }))
 }

 const removeService = (id: string) => {
 setFormData(prev => ({
 ...prev,
 services: prev.services.filter(s => s.id !== id)
 }))
 }

 return (
 <div className="min-h-full bg-[#f8fafc] dark:bg-background transition-all duration-500 pb-20">
 <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
 <div className="space-y-1">
 <Breadcrumbs items={[
 { label: 'Gestión', href: '/tasks' },
 { label: isEdit ? 'Editar Tarea' : 'Nueva Tarea' }
 ]} />
 <div className="flex items-center gap-4">
 <Button 
 variant="outline" 
 size="icon" 
 onClick={() => { void navigate(-1); }}
 className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 h-10 w-10"
 >
 <ArrowLeft className="h-5 w-5" />
 </Button>
 <h1 className="text-2xl font-bold text-foreground">
 {isEdit ? 'Modificar' : 'Crear'} <span className="text-primary italic">Tarea</span>
 </h1>
 </div>
 </div>

 <div className="flex items-center gap-3">
 {isEdit && (
 <Button 
 variant="ghost"
 onClick={() => { handleDelete(); }}
 className="rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold px-4 h-11 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/30"
 >
 <Trash2 className="h-4 w-4 mr-2" />
 Eliminar
 </Button>
 )}
 <Button 
 size="sm"
 onClick={() => { handleSave(); }}
 className="rounded-lg gap-2"
 >
 <Save className="h-4 w-4" />
 {isEdit ? 'Guardar Cambios' : 'Confirmar Tarea'}
 </Button>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Form Detail Section */}
 <div className="lg:col-span-2 space-y-8">
 <section className="bg-white dark:bg-card/40 border border-slate-200 dark:border-slate-800 p-8 rounded-xl space-y-8 shadow-sm">
 <div className="space-y-3">
 <div className="flex items-center gap-2 mb-1">
 <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
 <FileText className="h-4 w-4" />
 </div>
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Título de la Tarea</label>
 </div>
 <Input 
 placeholder="Ej: Implementar autenticación OAuth"
 value={formData.title}
 onChange={(e) => { setFormData({ ...formData, title: e.target.value }); }}
 className="h-10 bg-background border-border/40 rounded-lg px-4 text-sm font-semibold focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
 />
 </div>

 <div className="space-y-3">
 <div className="flex items-center gap-2 mb-1">
 <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
 <AlertCircle className="h-4 w-4" />
 </div>
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Objetivo y Contexto</label>
 </div>
 <Textarea 
 placeholder="Describe brevemente el propósito de esta tarea y qué se espera lograr..."
 value={formData.description}
 onChange={(e) => { setFormData({ ...formData, description: e.target.value }); }}
 className="min-h-[140px] bg-background border-border/40 rounded-lg p-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all resize-none shadow-sm"
 />
 </div>
 </section>

 {/* Requirements Section */}
 <section className="bg-white dark:bg-card/40 border border-slate-200 dark:border-slate-800 p-8 rounded-xl space-y-6 shadow-sm">
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Requerimientos Técnicos</h3>
 <p className="text-xs font-bold text-slate-400 uppercase">Detalla lo que debe incluirse</p>
 </div>
 </div>
 <Button variant="outline" size="sm" onClick={() => { addRequirement(); }} className="rounded-lg gap-2">
 <Plus className="h-4 w-4" />
 Añadir
 </Button>
 </div>
 
 <div className="space-y-3">
 {formData.requirements.length === 0 ? (
 <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
 <p className="text-xs font-bold text-slate-400 uppercase italic">No hay requerimientos definidos aún</p>
 </div>
 ) : (
 formData.requirements.map((req, i) => (
 <div key={i} className="flex gap-3 items-center group animate-in slide-in-from-left-4 duration-300">
 <div className="flex-1">
 <Input 
 value={req}
 onChange={e => { updateRequirement(i, e.target.value); }}
 placeholder={`Requerimiento #${String(i + 1)}...`}
 className="h-12 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-primary transition-all"
 />
 </div>
 <Button variant="ghost" size="icon" onClick={() => { removeRequirement(i); }} className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-200 transition-all h-12 w-12">
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))
 )}
 </div>
 </section>

 <section className="bg-white dark:bg-card/40 border border-slate-200 dark:border-slate-800 p-8 rounded-xl space-y-6 shadow-sm">
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
 <Globe className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Servicios e Interfaces</h3>
 <p className="text-xs font-bold text-slate-400 uppercase">Define endpoints y contratos</p>
 </div>
 </div>
 <Button variant="outline" size="sm" onClick={() => { addService(); }} className="rounded-lg gap-2">
 <Plus className="h-4 w-4" />
 Añadir
 </Button>
 </div>

 <div className="space-y-4">
 {formData.services.length === 0 ? (
 <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
 <p className="text-xs font-bold text-slate-400 uppercase italic">No hay servicios definidos</p>
 </div>
 ) : (
 formData.services.map((service) => (
 <div key={service.id} className="p-6 bg-slate-50 dark:bg-background/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 relative group">
 <Button 
 variant="ghost" 
 size="icon" 
 onClick={() => { removeService(service.id); }} 
 className="absolute top-4 right-4 h-9 w-9 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-200 transition-all opacity-0 group-hover:opacity-100"
 >
 <X className="h-4 w-4" />
 </Button>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-slate-400">Nombre del Servicio</label>
 <Input 
 value={service.name}
 onChange={(e) => { updateService(service.id, { name: e.target.value }); }}
 placeholder="Ej: GetUserProfile"
 className="h-11 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm"
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium text-slate-400">Verbo HTTP</label>
 <Select 
 value={service.method} 
 onValueChange={(v) => { updateService(service.id, { method: v as ServiceDetail['method'] }); }}
 >
 <SelectTrigger className="h-11 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-xs">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
 <SelectItem value="GET" className="text-emerald-500 font-bold">GET</SelectItem>
 <SelectItem value="POST" className="text-blue-500 font-bold">POST</SelectItem>
 <SelectItem value="PUT" className="text-amber-500 font-bold">PUT</SelectItem>
 <SelectItem value="DELETE" className="text-rose-500 font-bold">DELETE</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-medium text-slate-400">Ruta / Endpoint</label>
 <Input 
 value={service.url}
 onChange={(e) => { updateService(service.id, { url: e.target.value }); }}
 placeholder="/api/v1/user/:id"
 className="h-11 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs font-mono"
 />
 </div>

 <div className="space-y-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-slate-400">Respuesta Estructural</label>
 <JsonTextarea 
 value={service.response}
 onChange={(e) => { updateService(service.id, { response: e.target.value }); }}
 onPrettify={(val) => { updateService(service.id, { response: val }); }}
 placeholder="Estructura de respuesta esperada..."
 />
 </div>

 {['POST', 'PUT', 'PATCH'].includes(service.method) && (
 <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
 <div className="flex items-center justify-between">
 <label className="text-xs font-medium text-slate-400">Body / Payload de Envío</label>
 <Select 
 value={service.payloadType || 'JSON'} 
 onValueChange={(v) => { updateService(service.id, { payloadType: v as ServiceDetail['payloadType'] }); }}
 >
 <SelectTrigger className="w-[120px] h-8 bg-white dark:bg-card border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs ">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-xl">
 <SelectItem value="JSON">JSON</SelectItem>
 <SelectItem value="FormData">FormData</SelectItem>
 <SelectItem value="Text">Plain Text</SelectItem>
 <SelectItem value="None">Sin Body</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <JsonTextarea 
 value={service.payload}
 onChange={(e) => { updateService(service.id, { payload: e.target.value }); }}
 onPrettify={(val) => { updateService(service.id, { payload: val }); }}
 placeholder="Estructura del Payload..."
 />
 </div>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </section>

 {/* Validations Section */}
 <section className="bg-white dark:bg-card/40 border border-slate-200 dark:border-slate-800 p-8 rounded-xl space-y-6 shadow-sm">
 <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
 <Target className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Criterios de Aceptación</h3>
 <p className="text-xs font-bold text-slate-400 uppercase">Valida antes de completar</p>
 </div>
 </div>
 <Button variant="outline" size="sm" onClick={() => { addValidation(); }} className="rounded-lg gap-2">
 <Plus className="h-4 w-4" />
 Añadir
 </Button>
 </div>

 <div className="space-y-3">
 {formData.validations.length === 0 ? (
 <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
 <p className="text-xs font-bold text-slate-400 uppercase italic">No hay criterios de detección definidos</p>
 </div>
 ) : (
 formData.validations.map((val, i) => (
 <div key={i} className="flex gap-3 items-center group animate-in slide-in-from-right-4 duration-300">
 <div className="flex-1">
 <Input 
 value={val}
 onChange={e => { updateValidation(i, e.target.value); }}
 placeholder={`Puntos de validación #${String(i + 1)}...`}
 className="h-12 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-emerald-500 transition-all"
 />
 </div>
 <Button variant="ghost" size="icon" onClick={() => { removeValidation(i); }} className="rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-200 transition-all h-12 w-12">
 <X className="h-4 w-4" />
 </Button>
 </div>
 ))
 )}
 </div>
 </section>
 </div>

 {/* Configuration Sidebar */}
 <div className="space-y-6">
 <div className="bg-white dark:bg-card border border-slate-200 dark:border-slate-800 p-8 rounded-xl space-y-8 shadow-sm">
 <div className="space-y-3">
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">Historia Relacionada</label>
 <Select value={formData.storyId} onValueChange={(v) => { setFormData({ ...formData, storyId: v }); }}>
 <SelectTrigger className="h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold text-xs shadow-sm hover:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all">
 <SelectValue placeholder="Vincular a Historia" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
 {activeStories.map((s) => (
 <SelectItem key={s.id} value={s.id} className="py-2.5">
 <span className="font-bold text-slate-700 dark:text-slate-200">{s.title}</span>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-3">
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">Miembro Responsable</label>
 <Select value={formData.assignedTo} onValueChange={(v) => { setFormData({ ...formData, assignedTo: v }); }}>
 <SelectTrigger className="h-12 bg-white dark:bg-background border border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold text-xs shadow-sm hover:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all">
 <SelectValue placeholder="Sin asignar responsable" />
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
 {members.map((m) => (
 <SelectItem key={m.id} value={m.id} className="py-2.5">
 <div className="flex items-center gap-2">
 <img 
 src={m.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.id}`} 
 className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
 alt={m.name}
 />
 <span className="font-bold">{m.name}</span>
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="grid grid-cols-1 gap-6">
 <div className="space-y-3">
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">Tipo de Tarea</label>
 <Select value={formData.type} onValueChange={v => { setFormData({ ...formData, type: v as TaskType }); }}>
 <SelectTrigger className="h-11 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold text-xs shadow-sm">
 <div className="flex items-center gap-2">
 <Layout className="h-3.5 w-3.5 text-primary" />
 <SelectValue />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 <SelectItem value="feature" className="font-bold">✨ Nueva Característica</SelectItem>
 <SelectItem value="bug" className="font-bold">🐞 Corrección de Error</SelectItem>
 <SelectItem value="refactor" className="font-bold">🛠️ Refactorización</SelectItem>
 <SelectItem value="docs" className="font-bold">📄 Documentación</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-3">
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">Nivel de Prioridad</label>
 <Select value={(formData.priority || 'medium') as string} onValueChange={v => { setFormData({ ...formData, priority: v as TaskDraft['priority'] }); }}>
 <SelectTrigger className="h-11 bg-slate-50 dark:bg-background border-slate-200 dark:border-slate-800 rounded-xl px-4 font-bold text-xs shadow-sm">
 <div className="flex items-center gap-2">
 <Target className="h-3.5 w-3.5 text-primary" />
 <SelectValue />
 </div>
 </SelectTrigger>
 <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
 <SelectItem value="low" className="font-bold">🔵 Baja prioridad</SelectItem>
 <SelectItem value="medium" className="font-bold">🟡 Prioridad Media</SelectItem>
 <SelectItem value="high" className="font-bold">🟠 Prioridad Alta</SelectItem>
 <SelectItem value="urgent" className="font-bold">🔴 Urgente / Crítica</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-3 pt-2">
 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 ml-1">Estimación (Horas)</label>
 <div className="flex items-center gap-3 h-12 bg-white dark:bg-background rounded-xl px-4 border border-slate-200 dark:border-slate-800 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
 <Clock className="h-4 w-4 text-primary shrink-0 opacity-60" />
 <input 
 type="number" 
 className="bg-transparent border-none w-full font-semibold text-center focus:outline-none lining-nums" 
 value={formData.estimatedHours}
 onChange={(e) => { setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 }); }}
 />
 </div>
 </div>
 </div>

 <div className="p-6 rounded-xl bg-slate-900 dark:bg-card border border-slate-800 dark:border-primary/20 space-y-3 shadow-xl">
 <div className="flex items-center gap-2 mb-1">
 <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
 <span className="text-xs font-medium text-slate-200">Guía de Gestión</span>
 </div>
 <p className="text-xs font-bold text-slate-400 leading-relaxed opacity-80">
 Este creador permite la configuración completa de tareas ágiles. Los bordes definidos y la estructura clara garantizan una entrada de datos precisa para el equipo de desarrollo.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
