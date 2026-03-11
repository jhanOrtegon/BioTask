import { useEffect, useState, useRef } from "react"
import { useTasksStore } from "@/features/tasks/store"
import { useStoriesStore } from "@/features/stories/store"
import { DynamicTaskEditor } from "@/features/tasks/ui/DynamicTaskEditor"
import { JiraPreview } from "@/features/tasks/ui/JiraPreview"
import { markdownToJira } from "@/features/tasks/utils"
import { Button } from "@/shared/ui/button"
import { ArrowLeft, Send, Eye, PanelRightClose, PanelRightOpen, FileJson2, Download, Eraser } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { toast } from "sonner"

export function EditorPage() {
  const { currentTask, startNewTask, setJiraContent, updateTaskData, updateTaskInfo } = useTasksStore()
  const { addTaskToStory } = useStoriesStore()
  const navigate = useNavigate()
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-initialize libre si el usuario vino sin tarea
  useEffect(() => {
    if (!currentTask) {
      startNewTask()
    }
  }, [currentTask, startNewTask])

  const taskDataString = JSON.stringify(currentTask?.data)
  const taskInfoString = `${currentTask?.title || ''}-${currentTask?.type || ''}-${currentTask?.featureName || ''}-${currentTask?.screenPath || ''}`

  useEffect(() => {
    if (currentTask) {
      const jira = markdownToJira(currentTask)
      if (jira !== currentTask.jiraContent) {
        setJiraContent(jira)
      }
    }
  }, [taskDataString, taskInfoString, setJiraContent])

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        // Actualizar info general
        if (json.title) updateTaskInfo({ title: json.title })
        if (json.type) updateTaskInfo({ type: json.type })
        if (json.featureName) updateTaskInfo({ featureName: json.featureName })
        if (json.screenPath) updateTaskInfo({ screenPath: json.screenPath })

        // Actualizar data
        const data: Record<string, unknown> = {}
        if (json.objective) data.objective = json.objective
        if (json.services) data.services = (json.services as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
          ...s,
          id: (s.id as string) || crypto.randomUUID(),
          payload: typeof s.payload === 'object' ? JSON.stringify(s.payload, null, 2) : (s.payload || ''),
          response: typeof s.response === 'object' ? JSON.stringify(s.response, null, 2) : (s.response || ''),
        }))
        if (json.requirements) data.requirements = json.requirements
        if (json.validations) data.validations = json.validations
        // También soporta data envuelto
        if (json.data) {
          if (json.data.objective) data.objective = json.data.objective
          if (json.data.services) data.services = (json.data.services as Array<Record<string, unknown>>).map((s: Record<string, unknown>) => ({
            ...s,
            id: (s.id as string) || crypto.randomUUID(),
            payload: typeof s.payload === 'object' ? JSON.stringify(s.payload, null, 2) : (s.payload || ''),
            response: typeof s.response === 'object' ? JSON.stringify(s.response, null, 2) : (s.response || ''),
          }))
          if (json.data.requirements) data.requirements = json.data.requirements
          if (json.data.validations) data.validations = json.data.validations
        }

        if (Object.keys(data).length > 0) {
          updateTaskData(data)
        }

        toast.success("JSON importado", { description: `Campos llenados desde ${file.name}` })
      } catch {
        toast.error("Error al importar", { description: "El archivo no es un JSON válido." })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleFinish = () => {
    if (!currentTask) return
    if (!currentTask.title.trim()) {
      toast.error('La tarea debe tener un título')
      return
    }

    if (currentTask.storyId) {
      // Guardarla en la historia correspondiente
      addTaskToStory(currentTask.storyId, currentTask)
      toast.success('Tarea guardada en la historia', { description: currentTask.title })
      void navigate(`/stories/${currentTask.storyId}`)
    } else {
      // Tarea suelta, solo se puede copiar el Markdown/Jira
      const jira = currentTask.jiraContent || ''
      if (!jira) {
        toast.error('No hay contenido Jira para copiar')
        return
      }
      navigator.clipboard.writeText(jira).then(() => {
        toast.success('Jira copiado al portapapeles', { description: 'Tarea suelta finalizada' })
        void navigate('/dashboard')
      }).catch(() => {
        toast.error('Error al copiar el Jira generado')
      })
    }
  }

  const handleClearAll = () => {
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
            <h2 className="text-lg font-bold tracking-tight">Editor de Molde Dynamic</h2>
            <p className="text-xs text-muted-foreground">Completa los campos para generar tu Jira</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Descargar JSON de ejemplo */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs font-bold"
            onClick={() => {
              const example = {
                title: "Implementar módulo de autenticación con OAuth 2.0",
                type: "feature",
                featureName: "Auth Module",
                screenPath: "/auth/login",
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

          {/* Importar JSON */}
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
            onClick={handleClearAll}
          >
            <Eraser className="h-3.5 w-3.5" /> Limpiar Todo
          </Button>

          <Button variant="outline" size="sm" onClick={() => { void navigate("/dashboard") }}>
            Cancelar
          </Button>
          <Button size="sm" className="gap-2 font-bold shadow-lg hover:shadow-primary/20 transition-all" onClick={handleFinish}>
            <Send className="h-3.5 w-3.5" /> Finalizar
          </Button>
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
            <div className="p-8 max-w-3xl mx-auto">
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Vista Previa de Jira
                </h3>
              </div>
              <JiraPreview />
            </div>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
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
    </div>
  )
}
