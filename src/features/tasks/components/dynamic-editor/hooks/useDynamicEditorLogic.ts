import { useState, useCallback, useMemo } from "react"
import { useTasksStore } from "../../../store"
import { useTemplatesStore } from "@/features/templates/store"
import { useStoriesStore } from "@/features/stories/store"
import { useTeamStore } from "@/features/team/store"
import { toast } from "sonner"
import type { TaskDraft } from "../../../types"
import type { ServiceDetail } from "@/features/templates/types"
import { generateConventionalCommit, markdownToJira } from "../../../utils"

export function useDynamicEditorLogic(taskProps?: TaskDraft, onUpdate?: (updates: Partial<TaskDraft>) => void) {
 const { currentTask: storeTask, updateTaskData: storeUpdateData, updateTaskInfo: storeUpdateInfo } = useTasksStore()
 const { templates } = useTemplatesStore()
 const { stories } = useStoriesStore()
 const { members } = useTeamStore()

 // Use either the task passed by prop or the one in the store
 const currentTask = taskProps || storeTask

 const [showCommitDialog, setShowCommitDialog] = useState(false)
 const [commitLang, setCommitLang] = useState<'es' | 'en'>('en')
 const [copied, setCopied] = useState(false)

 const updateTaskInfo = useCallback((info: Partial<TaskDraft>) => {
 if (onUpdate) onUpdate(info)
 storeUpdateInfo(info)
 }, [onUpdate, storeUpdateInfo])

 const updateTaskData = useCallback((data: Partial<TaskDraft['data']>) => {
 if (!currentTask) return
 if (onUpdate) onUpdate({ data: { ...currentTask.data, ...data } })
 storeUpdateData(data)
 }, [currentTask, onUpdate, storeUpdateData])

 const handleCopyCommit = useCallback(() => {
 if (!currentTask) return
 const commit = generateConventionalCommit(currentTask, commitLang)
 void navigator.clipboard.writeText(commit).then(() => {
 setCopied(true)
 setTimeout(() => { setCopied(false) }, 2000)
 })
 }, [currentTask, commitLang])

 const handleCopyJira = useCallback(() => {
 if (!currentTask) return
 const jira = markdownToJira(currentTask)
 void navigator.clipboard.writeText(jira).then(() => {
 toast.success('Jira copiado', { description: 'El contenido se ha copiado al portapapeles' })
 })
 }, [currentTask])

 const handleApplyTemplate = useCallback((templateId: string) => {
 if (templateId === 'free') {
 updateTaskInfo({ templateId: undefined })
 return
 }
 const t = templates.find(temp => temp.id === templateId)
 if (t) updateTaskInfo({ templateId: t.id })
 }, [templates, updateTaskInfo])

 const handleApplyStory = useCallback((storyId: string) => {
 if (storyId === 'none') {
 updateTaskInfo({ storyId: undefined })
 return
 }
 updateTaskInfo({ storyId })
 }, [updateTaskInfo])

 const handleAddService = useCallback(() => {
 if (!currentTask) return
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
 }, [currentTask, updateTaskData])

 const handleUpdateService = useCallback((id: string, updates: Partial<ServiceDetail>) => {
 if (!currentTask) return
 updateTaskData({
 services: currentTask.data.services.map(s => s.id === id ? { ...s, ...updates } : s)
 })
 }, [currentTask, updateTaskData])

 const handleRemoveService = useCallback((id: string) => {
 if (!currentTask) return
 updateTaskData({
 services: currentTask.data.services.filter(s => s.id !== id)
 })
 }, [currentTask, updateTaskData])

 const handleAddListItem = useCallback((type: 'requirements' | 'validations') => {
 if (!currentTask) return
 updateTaskData({ [type]: [...currentTask.data[type], ""] })
 }, [currentTask, updateTaskData])

 const handleUpdateListItem = useCallback((type: 'requirements' | 'validations', index: number, value: string) => {
 if (!currentTask) return
 const newList = [...currentTask.data[type]]
 newList[index] = value
 updateTaskData({ [type]: newList })
 }, [currentTask, updateTaskData])

 const handleRemoveListItem = useCallback((type: 'requirements' | 'validations', index: number) => {
 if (!currentTask) return
 updateTaskData({ [type]: currentTask.data[type].filter((_, i) => i !== index) })
 }, [currentTask, updateTaskData])

 const handleAddChecklist = useCallback(() => {
 if (!currentTask) return
 updateTaskInfo({ 
 checklists: [...(currentTask.checklists || []), { id: crypto.randomUUID(), title: "", completed: false }] 
 })
 }, [currentTask, updateTaskInfo])

 const handleUpdateChecklist = useCallback((id: string, updates: { completed?: boolean; title?: string }) => {
 if (!currentTask) return
 updateTaskInfo({
 checklists: (currentTask.checklists || []).map(c => c.id === id ? { ...c, ...updates } : c)
 })
 }, [currentTask, updateTaskInfo])

 const handleRemoveChecklist = useCallback((id: string) => {
 if (!currentTask) return
 updateTaskInfo({
 checklists: (currentTask.checklists || []).filter(c => c.id !== id)
 })
 }, [currentTask, updateTaskInfo])

 const handleFillExample = useCallback(() => {
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
 method: "POST",
 params: "",
 payload: '{\n "provider": "google",\n "code": "auth_code_123",\n "redirectUri": "http://localhost:3000/callback"\n}',
 response: '{\n "accessToken": "eyJhbGc...",\n "refreshToken": "dGhpcyBpcyBh...",\n "expiresIn": 3600,\n "user": {\n "id": "usr_001",\n "email": "user@example.com",\n "name": "John Doe"\n }\n}',
 },
 ],
 requirements: [
 "El formulario de login debe validar email y contraseña antes de enviar",
 "Mostrar spinner de carga durante la autenticación",
 ],
 validations: [
 "Email debe tener formato válido",
 "Contraseña mínimo 8 caracteres",
 ],
 })
 }, [updateTaskInfo, updateTaskData])

 const activeStories = useMemo(() => stories.filter(s => s.status === 'active'), [stories])
 const template = useMemo(() => 
 currentTask?.templateId ? templates.find(t => t.id === currentTask.templateId) : undefined,
 [currentTask, templates])

 return {
 currentTask,
 template,
 templates,
 stories: activeStories,
 members,
 showCommitDialog, setShowCommitDialog,
 commitLang, setCommitLang,
 copied,
 handleCopyCommit,
 handleCopyJira,
 handleApplyTemplate,
 handleApplyStory,
 handleAddService,
 handleUpdateService,
 handleRemoveService,
 handleAddListItem,
 handleUpdateListItem,
 handleRemoveListItem,
 handleAddChecklist,
 handleUpdateChecklist,
 handleRemoveChecklist,
 handleFillExample,
 updateTaskInfo,
 updateTaskData
 }
}
