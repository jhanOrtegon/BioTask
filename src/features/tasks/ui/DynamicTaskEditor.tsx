import { useTasksStore } from "../store"
import { useTemplatesStore } from "@/features/templates/store"
import { useStoriesStore } from "@/features/stories/store"
import { useTeamStore } from "@/features/team/store"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Plus, Trash2, PlusCircle, Wand2, ChevronRight, Hash, Globe, FileCode, GitMerge, ClipboardCopy, CheckCircle2, CheckSquare } from "lucide-react"
import type { ServiceDetail } from "../../templates/types"
import { generateConventionalCommit, markdownToJira } from "../utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { useState } from "react"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { toast } from "sonner"

// ── Section Header Component ──
const SectionHeader = ({ number, icon: Icon, title, color, action, isRequired }: {
  number: string; icon: React.ElementType; title: string; color: string; action?: React.ReactNode; isRequired?: boolean
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className={`font-mono text-[10px] font-black ${color} bg-current/10 px-1.5 py-0.5 rounded`} style={{ backgroundColor: 'var(--muted)' }}>
          {number}
        </span>
        <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
      </div>
      <Icon className={`h-4 w-4 ${color}`} />
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
        {isRequired && (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-600/10 px-1.5 py-0.5 rounded border border-amber-600/20 uppercase tracking-tighter">
            Obligatorio
          </span>
        )}
      </div>
    </div>
    {action}
  </div>
)

import type { TaskDraft } from "../types"

interface DynamicTaskEditorProps {
  readOnly?: boolean
  task?: TaskDraft
}

export function DynamicTaskEditor({ readOnly = false, task: propTask }: DynamicTaskEditorProps) {
  const store = useTasksStore()
  const currentTask = propTask || store.currentTask
  const { updateTaskData, updateTaskInfo } = store
  const { templates } = useTemplatesStore()
  const { stories } = useStoriesStore()
  
  const { members } = useTeamStore()
  const [showCommitDialog, setShowCommitDialog] = useState(false)
  const [commitLang, setCommitLang] = useState<'es' | 'en'>('en')
  const [copied, setCopied] = useState(false)
  
  if (!currentTask) return null

  const generatedCommit = generateConventionalCommit(currentTask, commitLang)

  const handleCopyCommit = () => {
    void navigator.clipboard.writeText(generatedCommit).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 2000)
    })
  }

  const handleCopyJira = () => {
    const jira = markdownToJira(currentTask)
    void navigator.clipboard.writeText(jira).then(() => {
      toast.success('Jira copiado', { description: 'El contenido se ha copiado al portapapeles' })
    })
  }

  const template = currentTask.templateId 
    ? templates.find(t => t.id === currentTask.templateId)
    : undefined

  const activeStories = stories.filter(s => s.status === 'active')

  // En modo libre (sin plantilla), habilitamos todos los campos por defecto.
  const hasObjective = template ? template.hasObjective : true
  const hasServices = template ? template.hasServices : true
  const hasFunctionalRequirements = template ? template.hasFunctionalRequirements : true
  const hasValidations = template ? template.hasValidations : true

  const handleApplyTemplate = (templateId: string) => {
    if (templateId === 'free') {
      updateTaskInfo({ templateId: undefined })
      return
    }
    const t = templates.find(temp => temp.id === templateId)
    if (t) updateTaskInfo({ templateId: t.id })
  }

  const handleApplyStory = (storyId: string) => {
    if (storyId === 'none') {
      updateTaskInfo({ storyId: undefined })
      return
    }
    updateTaskInfo({ storyId })
  }

  const handleAddService = () => {
    const newService: ServiceDetail = {
      id: crypto.randomUUID(),
      name: '',
      url: '',
      method: 'GET',
      params: '',
      payload: '',
      response: ''
    }
    updateTaskData({ services: [...currentTask.data.services, newService] })
  }

  const handleUpdateService = (id: string, updates: Partial<ServiceDetail>) => {
    updateTaskData({
      services: currentTask.data.services.map(s => s.id === id ? { ...s, ...updates } : s)
    })
  }

  const handleRemoveService = (id: string) => {
    updateTaskData({
      services: currentTask.data.services.filter(s => s.id !== id)
    })
  }

  const handleAddListItem = (type: 'requirements' | 'validations') => {
    updateTaskData({ [type]: [...currentTask.data[type], ""] })
  }

  const handleUpdateListItem = (type: 'requirements' | 'validations', index: number, value: string) => {
    const newList = [...currentTask.data[type]]
    newList[index] = value
    updateTaskData({ [type]: newList })
  }

  const handleRemoveListItem = (type: 'requirements' | 'validations', index: number) => {
    updateTaskData({ [type]: currentTask.data[type].filter((_, i) => i !== index) })
  }

  const handleAddChecklist = () => {
    updateTaskInfo({ 
      checklists: [...(currentTask.checklists || []), { id: crypto.randomUUID(), title: "", completed: false }] 
    })
  }

  const handleUpdateChecklist = (id: string, updates: { completed?: boolean; title?: string }) => {
    updateTaskInfo({
      checklists: (currentTask.checklists || []).map(c => c.id === id ? { ...c, ...updates } : c)
    })
  }

  const handleRemoveChecklist = (id: string) => {
    updateTaskInfo({
      checklists: (currentTask.checklists || []).filter(c => c.id !== id)
    })
  }

  const handleFillExample = () => {
    updateTaskInfo({
      title: "Implementar módulo de autenticación con OAuth 2.0",
      code: "AUTH-101",
      type: "feature",
      priority: "high",
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      featureName: "Auth Module",
      screenPath: "/auth/login",
      checklists: [
        { id: crypto.randomUUID(), title: "Configurar credenciales en Google Console", completed: true },
        { id: crypto.randomUUID(), title: "Implementar callback handler", completed: false },
        { id: crypto.randomUUID(), title: "Pruebas unitarias de flujo fallido", completed: false }
      ]
    })
    updateTaskData({
      objective: "Implementar el flujo completo de autenticación usando OAuth 2.0 con Google y GitHub como proveedores. El usuario debe poder iniciar sesión, registrarse y cerrar sesión correctamente. Se debe manejar la renovación de tokens y la persistencia de la sesión.",
      services: [
        {
          id: crypto.randomUUID(),
          name: "Login OAuth",
          url: "/api/v1/auth/oauth/login",
          method: "POST" as const,
          params: "",
          payload: '{\n  "provider": "google",\n  "code": "auth_code_123",\n  "redirectUri": "http://localhost:3000/callback"\n}',
          response: '{\n  "accessToken": "eyJhbGc...",\n  "refreshToken": "dGhpcyBpcyBh...",\n  "expiresIn": 3600,\n  "user": {\n    "id": "usr_001",\n    "email": "user@example.com",\n    "name": "John Doe"\n  }\n}',
        },
        {
          id: crypto.randomUUID(),
          name: "Refresh Token",
          url: "/api/v1/auth/refresh",
          method: "POST" as const,
          params: "",
          payload: '{\n  "refreshToken": "dGhpcyBpcyBh..."\n}',
          response: '{\n  "accessToken": "newToken...",\n  "expiresIn": 3600\n}',
        },
      ],
      requirements: [
        "El formulario de login debe validar email y contraseña antes de enviar",
        "Mostrar spinner de carga durante la autenticación",
        "Redirigir al dashboard tras login exitoso",
        "Manejar errores de credenciales inválidas con mensaje claro",
        "Persistir sesión en localStorage con token encriptado",
      ],
      validations: [
        "Email debe tener formato válido (regex estándar)",
        "Contraseña mínimo 8 caracteres con mayúscula y número",
        "Token debe renovarse automáticamente 5 min antes de expirar",
        "Al cerrar sesión se deben limpiar todos los datos del store",
      ],
    })
  }

  const currentStory = currentTask.storyId ? stories.find(s => s.id === currentTask.storyId) : undefined

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Breadcrumbs items={[
        { label: 'Tablero Ágil', href: '/' },
        ...(currentStory ? [{ label: currentStory.code, href: `/stories/${currentStory.id}` }] : []),
        { label: currentTask.title || 'Nueva Tarea' }
      ]} />
      {/* ── Header / Metadata ── */}
      <div className="rounded-t-xl border border-border bg-card overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileCode className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">task.config</span>
            </div>
            
            <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-border/50">
              {/* Selector de plantilla */}
              <Select disabled={readOnly} value={currentTask.templateId || 'free'} onValueChange={handleApplyTemplate}>
                <SelectTrigger className="h-7 w-[180px] text-[10px] font-bold border-none shadow-none focus:ring-0">
                  <SelectValue placeholder="Sin Plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free" className="text-[10px] font-bold text-muted-foreground">✨ Tarea Libre (Todos los campos)</SelectItem>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-[10px]">{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="w-px h-4 bg-border" />

              {/* Selector de historia */}
              <Select disabled={readOnly} value={currentTask.storyId || 'none'} onValueChange={handleApplyStory}>
                <SelectTrigger className="h-7 w-[180px] text-[10px] font-bold border-none shadow-none focus:ring-0">
                  <SelectValue placeholder="Sin Historia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-[10px] font-bold text-muted-foreground">🚫 Tarea Suelta (Sin Historia)</SelectItem>
                  {activeStories.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-[10px]">{s.code} - {s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-[10px] h-7 font-bold text-foreground bg-background border-border" 
              onClick={() => { setShowCommitDialog(true) }}
            >
              <GitMerge className="h-3.5 w-3.5 text-blue-500" /> Auto-Commit
            </Button>
            <div className="w-px h-4 bg-border" />
            {!readOnly && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 text-[10px] h-7 font-bold text-primary hover:text-primary hover:bg-primary/10" 
                onClick={() => { handleFillExample() }}
              >
                <Wand2 className="h-3 w-3" /> Llenar Ejemplo
              </Button>
            )}
            <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 text-[10px] h-7 font-bold text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10" 
                onClick={handleCopyJira}
              >
                <ClipboardCopy className="h-3 w-3" /> Copiar Jira
              </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 lg:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">CÓDIGO</Label>
              <Input 
                disabled={readOnly}
                value={currentTask.code || ''}
                onChange={e => { updateTaskInfo({ code: e.target.value }) }}
                className="font-mono text-xs font-bold h-11 bg-background text-primary uppercase placeholder:text-muted-foreground/30"
                placeholder="PROJ-123"
              />
            </div>
            <div className="col-span-12 lg:col-span-1 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">PRE</Label>
              <Select 
                disabled={readOnly}
                value={currentTask.techPrefix || ''} 
                onValueChange={(v: "BE-" | "FE-") => { updateTaskInfo({ techPrefix: v }) }}
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
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Título de la Tarea</Label>
              <Input 
                disabled={readOnly}
                value={currentTask.title} 
                onChange={e => { updateTaskInfo({ title: e.target.value }) }}
                className="font-semibold text-[15px] h-11 bg-background placeholder:text-muted-foreground/30"
                placeholder="Ej: Implementar módulo de login..."
              />
            </div>
            <div className="col-span-6 lg:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tipo</Label>
              <Select 
                disabled={readOnly}
                value={currentTask.type} 
                onValueChange={(v: "feature" | "bug" | "chore" | "refactor") => { updateTaskInfo({ type: v }) }}
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
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Prioridad</Label>
              <Select 
                disabled={readOnly}
                value={currentTask.priority || 'medium'} 
                onValueChange={(v: "low" | "medium" | "high" | "urgent") => { updateTaskInfo({ priority: v }) }}
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
            <div className="col-span-12 lg:col-span-12 space-y-1.5 mt-1 border-t border-border/10 pt-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Asignado a</Label>
              <Select 
                disabled={readOnly}
                value={currentTask.assignedTo || 'unassigned'} 
                onValueChange={(v: string) => { updateTaskInfo({ assignedTo: v === 'unassigned' ? undefined : v }) }}
              >
                <SelectTrigger className="h-11 bg-background font-bold text-xs">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border shadow-2xl">
                  <SelectItem value="unassigned" className="text-muted-foreground italic">🚫 Sin asignar</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{m.name}</span>
                        <span className="text-[10px] opacity-50 font-normal">({m.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6 lg:col-span-3 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Módulo</Label>
              <Input 
                disabled={readOnly}
                value={currentTask.featureName || ''} 
                onChange={e => { updateTaskInfo({ featureName: e.target.value }) }}
                placeholder="Auth Module"
                className="h-11 bg-background font-mono text-xs placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="col-span-6 lg:col-span-5 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Ruta / Pantalla</Label>
              <Input 
                disabled={readOnly}
                value={currentTask.screenPath || ''} 
                onChange={e => { updateTaskInfo({ screenPath: e.target.value }) }}
                placeholder="/auth/login"
                className="h-11 bg-background font-mono text-xs"
              />
            </div>
            <div className="col-span-6 lg:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground" title="Fecha Límite">Vencimiento</Label>
              <Input 
                disabled={readOnly}
                type="date"
                value={currentTask.dueDate || ''} 
                onChange={e => { updateTaskInfo({ dueDate: e.target.value }) }}
                className="h-11 bg-background font-mono text-xs font-bold"
              />
            </div>
            <div className="col-span-6 lg:col-span-2 space-y-1.5">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground" title="Horas Estimadas">H. Estimadas</Label>
              <Input 
                disabled={readOnly}
                type="number"
                min="0"
                step="0.5"
                value={currentTask.estimatedHours || ''} 
                onChange={e => { 
                  updateTaskInfo({ estimatedHours: e.target.value ? Number(e.target.value) : undefined }) 
                }}
                placeholder="0.0"
                className="h-11 bg-background font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Objetivo ── */}
      {hasObjective && (
        <div className="border-x border-[0px] border-b border-border bg-card">
          <div className="p-5 pt-4">
            <SectionHeader 
              number="01" 
              icon={Hash} 
              title="Objetivo" 
              color="text-primary" 
              isRequired={template?.requiredObjective}
            />
            <div className="mt-4">
              <Textarea 
                disabled={readOnly}
                placeholder="Describe el objetivo principal de esta tarea..."
                value={currentTask.data.objective}
                onChange={e => { updateTaskData({ objective: e.target.value }) }}
                className="min-h-[120px] text-sm leading-relaxed bg-background resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Checklists (Sub-tareas) ── */}
      <div className="border-x border-[0px] border-b border-border bg-card">
        <div className="px-5 border-t border-border">
          <SectionHeader 
            number="02" icon={CheckSquare} title="Checklist" color="text-violet-500"
            action={!readOnly && (
              <Button onClick={() => { handleAddChecklist() }} size="sm" variant="ghost" className="h-7 gap-1.5 text-[10px] font-bold text-violet-500 hover:text-violet-500 hover:bg-violet-500/10">
                <PlusCircle className="h-3 w-3" /> Añadir Ítem
              </Button>
            )}
          />
        </div>
        <div className="p-5 pt-4 space-y-2">
          {(currentTask.checklists || []).map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 bg-muted/20 border border-border/50 p-2 rounded-lg group">
              <button 
                disabled={readOnly}
                onClick={() => { handleUpdateChecklist(item.id, { completed: !item.completed }) }}
                className={`shrink-0 flex items-center justify-center w-5 h-5 rounded border transition-colors ${item.completed ? 'bg-violet-500 border-violet-500 text-white' : 'border-border/80 bg-background'} ${readOnly ? 'cursor-default' : ''}`}
              >
                {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
              <Input
                disabled={readOnly}
                value={item.title}
                onChange={e => { handleUpdateChecklist(item.id, { title: e.target.value }) }}
                placeholder={`Elemento de checklist ${String(idx + 1)}`}
                className={`h-8 text-xs bg-transparent border-transparent hover:border-border transition-colors ${item.completed ? 'line-through text-muted-foreground' : ''}`}
              />
              {!readOnly && (
                <Button 
                  variant="ghost" size="icon"
                  className="shrink-0 h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100" 
                  onClick={() => { handleRemoveChecklist(item.id) }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {(currentTask.checklists || []).length === 0 && !readOnly && (
            <div className="text-center py-4 bg-muted/10 rounded-lg border border-dashed border-border/40 cursor-pointer hover:bg-muted/20 transition-colors" onClick={handleAddChecklist}>
              <span className="text-xs text-muted-foreground">Click aquí para agregar subtareas...</span>
            </div>
          )}
          {(currentTask.checklists || []).length === 0 && readOnly && (
            <div className="text-center py-4 bg-muted/5 rounded-lg border border-border/20">
              <span className="text-xs text-muted-foreground italic">Sin subtareas registradas.</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Servicios ── */}
      {hasServices && (
        <div className="border-x border-border bg-card">
          <div className="px-5">
            <SectionHeader 
              number="03" 
              icon={Globe} 
              title="Servicios / API" 
              color="text-blue-500"
              isRequired={template?.requiredServices}
              action={!readOnly && (
                <Button onClick={() => { handleAddService() }} size="sm" variant="ghost" className="h-7 gap-1.5 text-[10px] font-bold text-blue-500 hover:text-blue-500 hover:bg-blue-500/10">
                  <PlusCircle className="h-3 w-3" /> Endpoint
                </Button>
              )}
            />
          </div>
          
          <div className="p-5 pt-4 space-y-3">
            {currentTask.data.services.map((service, idx) => (
              <div key={service.id} className="rounded-lg border border-border/60 bg-background overflow-hidden group">
                {/* Service header bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-black text-muted-foreground">#{String(idx + 1)}</span>
                    <span className="text-xs font-bold text-foreground">{service.name || 'Nuevo servicio'}</span>
                  </div>
                  {!readOnly && (
                    <Button 
                      variant="ghost" size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => { handleRemoveService(service.id) }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Service fields */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 space-y-1">
                      <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Nombre</Label>
                      <Input 
                        disabled={readOnly}
                        placeholder="Login API" 
                        value={service.name}
                        onChange={e => { handleUpdateService(service.id, { name: e.target.value }) }}
                        className="h-9 text-xs bg-muted/20"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Método</Label>
                      <Select 
                        disabled={readOnly}
                        value={service.method}
                        onValueChange={(v: "GET" | "POST" | "PUT" | "DELETE" | "PATCH") => { handleUpdateService(service.id, { method: v }) }}
                      >
                        <SelectTrigger className="h-9 text-xs font-mono font-bold bg-muted/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 space-y-1">
                      <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Endpoint</Label>
                      <Input 
                        disabled={readOnly}
                        placeholder="/api/v1/auth" 
                        value={service.url}
                        onChange={e => { handleUpdateService(service.id, { url: e.target.value }) }}
                        className="h-9 text-xs font-mono bg-muted/20"
                      />
                    </div>
                  </div>

                  {/* Params */}
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">Query Params</Label>
                    <Input 
                      disabled={readOnly}
                      placeholder="?userId=123&status=active" 
                      value={service.params}
                      onChange={e => { handleUpdateService(service.id, { params: e.target.value }) }}
                      className="h-9 text-xs font-mono bg-muted/20"
                    />
                  </div>

                  {/* Code blocks side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black tracking-widest text-blue-400">Payload</Label>
                      <Textarea 
                        disabled={readOnly}
                        placeholder='{ "key": "value" }' 
                        className="font-mono text-[11px] min-h-[120px] bg-[hsl(225,25%,8%)] text-emerald-400/90 border-border/30 resize-none leading-relaxed" 
                        value={service.payload}
                        onChange={e => { handleUpdateService(service.id, { payload: e.target.value }) }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black tracking-widest text-emerald-400">Response</Label>
                      <Textarea 
                        disabled={readOnly}
                        placeholder='{ "status": "ok" }' 
                        className="font-mono text-[11px] min-h-[120px] bg-[hsl(225,25%,8%)] text-sky-400/90 border-border/30 resize-none leading-relaxed" 
                        value={service.response}
                        onChange={e => { handleUpdateService(service.id, { response: e.target.value }) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {currentTask.data.services.length === 0 && !readOnly && (
              <button
                onClick={() => { handleAddService() }}
                className="w-full border-2 border-dashed border-border/40 rounded-lg p-8 text-center text-muted-foreground/60 text-xs font-medium hover:border-blue-500/30 hover:text-blue-500/60 transition-colors cursor-pointer"
              >
                Click para agregar tu primer endpoint
              </button>
            )}
            {currentTask.data.services.length === 0 && readOnly && (
              <div className="text-center py-6 bg-muted/5 rounded-lg border border-border/20">
                <span className="text-xs text-muted-foreground italic">No hay servicios asociados.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Requirements & Validations ── */}
      <div className="rounded-b-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Requirements */}
          {hasFunctionalRequirements && (
            <div>
              <div className="px-5">
                <SectionHeader 
                  number="04" 
                  icon={Hash} 
                  title="Requerimientos" 
                  color="text-emerald-500"
                  isRequired={template?.requiredRequirements}
                  action={!readOnly && (
                    <Button onClick={() => { handleAddListItem('requirements') }} size="sm" variant="ghost" className="h-7 px-2 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10">
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                />
              </div>
              <div className="p-5 pt-3 space-y-1.5">
                {currentTask.data.requirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/40 w-5 text-right shrink-0">{String(i + 1)}</span>
                    <Input 
                      disabled={readOnly}
                      value={req}
                      onChange={e => { handleUpdateListItem('requirements', i, e.target.value) }}
                      placeholder={`Requerimiento ${String(i + 1)}`}
                      className="h-9 text-xs bg-transparent border-transparent hover:border-border focus:border-border transition-colors"
                    />
                    {!readOnly && (
                      <Button 
                        variant="ghost" size="icon"
                        className="shrink-0 h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors" 
                        onClick={() => { handleRemoveListItem('requirements', i) }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <button
                    onClick={() => { handleAddListItem('requirements') }}
                    className="w-full text-left pl-7 py-2 text-[11px] text-muted-foreground/40 hover:text-emerald-500/60 transition-colors cursor-pointer"
                  >
                    + Añadir requerimiento...
                  </button>
                )}
                {currentTask.data.requirements.length === 0 && readOnly && (
                  <span className="text-[11px] text-muted-foreground italic pl-7">Sin requerimientos funcionales.</span>
                )}
              </div>
            </div>
          )}

          {/* Validations */}
          {hasValidations && (
            <div>
              <div className="px-5">
                <SectionHeader 
                  number="05" 
                  icon={Hash} 
                  title="Validaciones" 
                  color="text-amber-500"
                  isRequired={template?.requiredValidations}
                  action={!readOnly && (
                    <Button onClick={() => { handleAddListItem('validations') }} size="sm" variant="ghost" className="h-7 px-2 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10">
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                />
              </div>
              <div className="p-5 pt-3 space-y-1.5">
                {currentTask.data.validations.map((val, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/40 w-5 text-right shrink-0">{String(i + 1)}</span>
                    <Input 
                      disabled={readOnly}
                      value={val}
                      onChange={e => { handleUpdateListItem('validations', i, e.target.value) }}
                      placeholder={`Validación ${String(i + 1)}`}
                      className="h-9 text-xs bg-transparent border-transparent hover:border-border focus:border-border transition-colors"
                    />
                    {!readOnly && (
                      <Button 
                        variant="ghost" size="icon"
                        className="shrink-0 h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors" 
                        onClick={() => { handleRemoveListItem('validations', i) }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {!readOnly && (
                  <button
                    onClick={() => { handleAddListItem('validations') }}
                    className="w-full text-left pl-7 py-2 text-[11px] text-muted-foreground/40 hover:text-amber-500/60 transition-colors cursor-pointer"
                  >
                    + Añadir validación...
                  </button>
                )}
                {currentTask.data.validations.length === 0 && readOnly && (
                  <span className="text-[11px] text-muted-foreground italic pl-7">Sin validaciones de sistema.</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog Auto-Commit ── */}
      <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-blue-500" /> Mensaje de Commit Sugerido
            </DialogTitle>
            <DialogDescription>
              Autogenerado siguiendo Conventional Commits. Elige el idioma que prefieras.
            </DialogDescription>
          </DialogHeader>

          {/* Language Selector */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setCommitLang('en') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                commitLang === 'en'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border/80'
              }`}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => { setCommitLang('es') }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                commitLang === 'es'
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-border/80'
              }`}
            >
              🇪🇸 Español
            </button>
          </div>

          <div className="relative mt-2">
            <pre className="p-4 rounded-xl bg-muted/50 border border-border/50 text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {generatedCommit}
            </pre>
            <Button
              size="sm"
              className="absolute top-3 right-3 gap-2 transition-all"
              variant={copied ? "default" : "secondary"}
              onClick={handleCopyCommit}
            >
              {copied ? (
                <><CheckCircle2 className="h-4 w-4" /> Copiado</>
              ) : (
                <><ClipboardCopy className="h-4 w-4" /> Copiar</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
