import { useEffect, useState, useRef } from "react"
import { useTasksStore } from "@/features/tasks/store"
import { useStoriesStore } from "@/features/stories/store"
import { DynamicTaskEditor } from "@/features/tasks/ui/DynamicTaskEditor"
import { JiraPreview } from "@/features/tasks/ui/JiraPreview"
import { markdownToJira } from "@/features/tasks/utils"
import { Button } from "@/shared/ui/button"
import { ArrowLeft, Send, Eye, PanelRightClose, PanelRightOpen, FileJson2, Download, Eraser, Edit } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { CommentDialog } from "@/shared/ui/comment-dialog"
import { toast } from "sonner"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import type { TaskDraft } from "@/features/tasks/types"

export function EditorPage() {
  const { role } = useAuthStore()
  const { currentTask, startNewTask, setCurrentTask, setJiraContent, updateTaskData, updateTaskInfo, resetTask } = useTasksStore()
  const { stories, addTaskToStory, updateTask } = useStoriesStore()
  const navigate = useNavigate()
  const { storyId, taskId } = useParams<{ storyId?: string; taskId?: string }>()

  const [showPreviewPanel, setShowPreviewPanel] = useState(false)
  const [previewTab, setPreviewTab] = useState<'jira' | 'visual'>('visual')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [justificationModalOpen, setJustificationModalOpen] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showFinishConfirm, setShowFinishConfirm] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar tarea si vienen IDs por la URL
  useEffect(() => {
    if (storyId && taskId) {
      const story = stories.find(s => s.id === storyId)
      const task = story?.tasks.find(t => t.id === taskId)

      if (task) {
        // Solo establecer si es diferente a la actual para evitar bucles
        if (!currentTask || currentTask.id !== task.id) {
          setCurrentTask(task as unknown as TaskDraft)
        }
      } else {
        toast.error("Tarea no encontrada")
        void navigate('/dashboard')
      }
    } else if (!currentTask) {
      // Si no hay params y no hay tarea actual, iniciar una nueva
      startNewTask()
    }
  }, [storyId, taskId, stories, currentTask, setCurrentTask, startNewTask, navigate])

  const taskDataString = JSON.stringify(currentTask?.data)
  const taskInfoString = `${currentTask?.title || ''}-${currentTask?.type || ''}-${currentTask?.featureName || ''}-${currentTask?.screenPath || ''}`

  useEffect(() => {
    if (currentTask) {
      const jira = markdownToJira(currentTask)
      if (jira !== currentTask.jiraContent) {
        setJiraContent(jira)
      }
    }
  }, [currentTask, taskDataString, taskInfoString, setJiraContent])

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
  }

  const processImport = () => {
    if (!importFile) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as Record<string, unknown>

        // Actualizar info general
        if (typeof json.title === 'string') updateTaskInfo({ title: json.title })
        if (typeof json.type === 'string' && ['feature', 'bug', 'chore', 'refactor'].includes(json.type)) {
          updateTaskInfo({ type: json.type as 'feature' | 'bug' | 'chore' | 'refactor' })
        }
        if (typeof json.featureName === 'string') updateTaskInfo({ featureName: json.featureName })
        if (typeof json.screenPath === 'string') updateTaskInfo({ screenPath: json.screenPath })

        if (typeof json.code === 'string') updateTaskInfo({ code: json.code })
        if (typeof json.priority === 'string' && ['low', 'medium', 'high', 'urgent'].includes(json.priority)) {
          updateTaskInfo({ priority: json.priority as 'low' | 'medium' | 'high' | 'urgent' })
        }
        if (typeof json.dueDate === 'string') updateTaskInfo({ dueDate: json.dueDate })
        if (typeof json.estimatedHours === 'number') updateTaskInfo({ estimatedHours: json.estimatedHours })
        if (Array.isArray(json.checklists)) {
          const checklists = json.checklists.map((c: unknown) => {
            const item = c as Record<string, unknown>;
            return {
              id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
              title: typeof item.title === 'string' ? item.title : (typeof item.text === 'string' ? item.text : ''),
              completed: typeof item.completed === 'boolean' ? item.completed : false
            }
          })
          updateTaskInfo({ checklists })
        }

        // Actualizar data
        const data: Record<string, unknown> = {}
        if (typeof json.objective === 'string') data.objective = json.objective

        const mapServices = (services: unknown[]) => services.map((s) => {
          const service = s as Record<string, unknown>
          return {
            ...service,
            id: (typeof service.id === 'string') ? service.id : crypto.randomUUID(),
            payload: typeof service.payload === 'object' && service.payload !== null ? JSON.stringify(service.payload, null, 2) : (service.payload || ''),
            response: typeof service.response === 'object' && service.response !== null ? JSON.stringify(service.response, null, 2) : (service.response || ''),
          }
        })

        if (Array.isArray(json.services)) {
          data.services = mapServices(json.services)
        }
        if (Array.isArray(json.requirements)) data.requirements = json.requirements
        if (Array.isArray(json.validations)) data.validations = json.validations

        // También soporta data envuelto
        const wrappedData = json.data as Record<string, unknown> | undefined
        if (wrappedData) {
          if (typeof wrappedData.objective === 'string') data.objective = wrappedData.objective
          if (Array.isArray(wrappedData.services)) {
            data.services = mapServices(wrappedData.services)
          }
          if (Array.isArray(wrappedData.requirements)) data.requirements = wrappedData.requirements
          if (Array.isArray(wrappedData.validations)) data.validations = wrappedData.validations
        }

        if (Object.keys(data).length > 0) {
          updateTaskData(data)
        }

        toast.success("JSON importado", { description: `Campos llenados desde ${importFile.name}` })
      } catch {
        toast.error("Error al importar", { description: "El archivo no es un JSON válido." })
      }
    }
    reader.readAsText(importFile)
    setImportFile(null)
  }

  const handleFinish = () => {
    if (!currentTask) return
    if (!currentTask.title.trim()) {
      toast.error('La tarea debe tener un título')
      return
    }
    setShowFinishConfirm(true)
  }

  const confirmFinish = () => {
    if (!currentTask) return

    // Si es edición, pedimos justificación
    if (currentTask.id) {
      setJustificationModalOpen(true)
      return
    }

    // Si es nueva y tiene storyId, guardamos
    if (currentTask.storyId) {
      addTaskToStory(currentTask.storyId, currentTask)
      toast.success('Tarea guardada en la historia', { description: currentTask.title })
      resetTask()
      void navigate(`/stories/${currentTask.storyId}`)
    } else {
      // Tarea suelta, solo se puede copiar el Markdown/Jira
      finishDraftTask()
    }
  }

  const handleConfirmJustification = (comment: string) => {
    if (!currentTask || !currentTask.id || !currentTask.storyId) return

    const { status, ...rest } = currentTask
    const updateData = {
      ...rest,
      status: status === 'draft' ? undefined : status
    }

    updateTask(currentTask.storyId, currentTask.id, updateData, comment)
    toast.success('Tarea actualizada', { description: currentTask.title })

    resetTask()
    void navigate(`/stories/${currentTask.storyId}`)
  }

  const finishDraftTask = () => {
    if (!currentTask) return
    const jira = currentTask.jiraContent || ''
    if (!jira) {
      toast.error('No hay contenido Jira para copiar')
      return
    }
    navigator.clipboard.writeText(jira).then(() => {
      toast.success('Jira copiado al portapapeles', { description: 'Tarea suelta finalizada' })
      resetTask()
      void navigate('/dashboard')
    }).catch(() => {
      toast.error('Error al copiar el Jira generado')
    })
  }

  const handleClearAll = () => {
    setShowClearConfirm(false)
    updateTaskInfo({
      title: 'Nueva tarea',
      featureName: '',
      screenPath: ''
    })
    updateTaskData({
      objective: '',
      services: [],
      requirements: [],
      validations: []
    })
    toast.success('Formulario limpiado')
  }

  // Prevenir renderizado hasta que el auto-init actúe
  if (!currentTask) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card/50 backdrop-blur-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => { void navigate("/dashboard") }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight">Editor</h2>
            <p className="text-xs text-muted-foreground">Completa los campos para generar tu Jira</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Descargar JSON de ejemplo */}
          {role !== 'Editor' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold"
              onClick={() => {
                const example = {
                  title: "Implementar módulo de autenticación con OAuth 2.0",
                  code: "AUTH-101",
                  type: "feature",
                  priority: "high",
                  estimatedHours: 8,
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  featureName: "Auth Module",
                  screenPath: "/auth/login",
                  checklists: [
                    { id: "1", title: "Configurar credenciales en Google Console", completed: true },
                    { id: "2", title: "Implementar callback handler", completed: false },
                    { id: "3", title: "Pruebas unitarias de flujo fallido", completed: false }
                  ],
                  objective: "Implementar el flujo completo de autenticación usando OAuth 2.0 con Google y GitHub como proveedores.",
                  services: [
                    {
                      name: "Login OAuth",
                      url: "/api/v1/auth/oauth/login",
             method: "POST",
                      params: "",
                      payload: {
                        provider: "google",
                        code: "auth_code_123",
                        redirectUri: "http://localhost:3000/callback"
                      },
                      response: {
                        accessToken: "eyJhbGc...",
                        refreshToken: "dGhpcyBpcyBh...",
                        expiresIn: 3600,
                        user: {
                          id: "usr_001",
                          email: "user@example.com",
                          name: "John Doe"
                        }
                      }
                    }
                  ],
                  requirements: [
                    "Validar email y contraseña antes de enviar",
                    "Mostrar spinner durante autenticación",
                    "Redirigir al dashboard tras login exitoso"
                  ],
                  validations: [
                    "Email debe tener formato válido",
                    "Contraseña mínimo 8 caracteres"
                  ]
                }
                const blob = new Blob([JSON.stringify(example, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'tarea-ejemplo.json'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('JSON de ejemplo descargado', { description: 'Edítalo y luego impórtalo con "Importar JSON"' })
              }}
            >
              <Download className="h-3.5 w-3.5" /> JSON Ejemplo
            </Button>
          )}

          {/* Importar JSON */}
          {role !== 'Editor' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-bold"
                onClick={() => { fileInputRef.current?.click() }}
              >
                <FileJson2 className="h-3.5 w-3.5" /> Importar JSON
              </Button>
            </>
          )}

          {/* Preview en modal */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-bold"
            onClick={() => { setPreviewModalOpen(true) }}
          >
            <Eye className="h-3.5 w-3.5" /> Vista Previa
          </Button>

          {/* Toggle panel lateral */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-bold"
            onClick={() => { setShowPreviewPanel(!showPreviewPanel) }}
          >
            {showPreviewPanel ? (
              <><PanelRightClose className="h-3.5 w-3.5" /> Ocultar Panel</>
            ) : (
              <><PanelRightOpen className="h-3.5 w-3.5" /> Mostrar Panel</>
            )}
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => { setShowClearConfirm(true) }}
          >
            <Eraser className="h-3.5 w-3.5" /> Limpiar Todo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetTask()
              if (currentTask.storyId) {
                void navigate(`/stories/${currentTask.storyId}`)
              } else {
                void navigate("/dashboard")
              }
            }}
          >
            Cancelar
          </Button>
          {role !== 'Editor' && (
            <Button size="sm" className="gap-2 font-bold shadow-lg hover:shadow-primary/20 transition-all" onClick={handleFinish}>
              {currentTask.id ? (
                <><Edit className="h-3.5 w-3.5" /> Actualizar Tarea</>
              ) : (
                <><Send className="h-3.5 w-3.5" /> Finalizar</>
              )}
            </Button>
          )}
        </div>
      </header>

      <div className={`flex-1 min-h-0 grid ${showPreviewPanel ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Panel Izquierdo: Editor */}
        <div className="border-r bg-muted/10 min-h-0 overflow-y-auto">
          <div className={`p-6 mx-auto ${showPreviewPanel ? 'max-w-4xl' : 'max-w-6xl'}`}>
            <DynamicTaskEditor />
          </div>
        </div>

        {/* Panel Derecho: Preview (solo si showPreviewPanel) */}
        {showPreviewPanel && (
          <div className="bg-card/30 min-h-0 overflow-y-auto">
            <div className="p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Previsualización
                </h3>
                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                  <Button
                    variant={previewTab === 'visual' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-[10px] font-bold px-3"
                    onClick={() => { setPreviewTab('visual') }}
                  >
                    Visual
                  </Button>
                  <Button
                    variant={previewTab === 'jira' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 text-[10px] font-bold px-3"
                    onClick={() => { setPreviewTab('jira') }}
                  >
                    Jira
                  </Button>
                </div>
              </div>

              {previewTab === 'visual' ? <DynamicTaskEditor readOnly /> : <JiraPreview />}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      <Dialog open={previewModalOpen} onOpenChange={(open) => { setPreviewModalOpen(open) }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-border bg-popover shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Vista Previa de Jira
            </DialogTitle>
          </DialogHeader>
          <JiraPreview />
        </DialogContent>
      </Dialog>

      {/* Modal de Justificación */}
      <CommentDialog
        open={justificationModalOpen}
        onOpenChange={(open) => { setJustificationModalOpen(open) }}
        title="Justificar Cambio"
        description="Explica brevemente por qué estás editando esta tarea. Este comentario quedará registrado en el historial."
        confirmLabel="Actualizar y Guardar"
        onConfirm={handleConfirmJustification}
      />

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClearAll}
        title="¿Limpiar todo el formulario?"
        description="Esta acción eliminará todos los datos que hayas ingresado en la tarea actual. No se puede deshacer."
        confirmText="Sí, limpiar todo"
        variant="destructive"
      />

      <ConfirmDialog
        open={showFinishConfirm}
        onOpenChange={setShowFinishConfirm}
        onConfirm={confirmFinish}
        title={currentTask.id ? "¿Actualizar tarea?" : "¿Finalizar y guardar tarea?"}
        description={currentTask.id ? "Se guardarán los cambios realizados en la tarea actual." : "La tarea se guardará en la historia seleccionada."}
        confirmText="Confirmar"
      />

      <ConfirmDialog
        open={!!importFile}
        onOpenChange={(open) => { if (!open) setImportFile(null) }}
        onConfirm={processImport}
        title="¿Importar datos desde JSON?"
        description="Al importar un archivo, se sobrescribirán los campos actuales de la tarea. ¿Deseas continuar?"
        confirmText="Sí, importar"
      />
    </div>
  )
}
