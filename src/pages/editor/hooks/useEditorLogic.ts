import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTasksStore } from "@/features/tasks/store"
import { useStoriesStore } from "@/features/stories/store"
import { useSprintsStore } from "@/features/sprints/store"
import { useAuthStore } from "@/features/auth/store"
import { toast } from "sonner"
import { markdownToJira } from "@/features/tasks/utils"
import type { TaskDraft } from "@/features/tasks/types"

export function useEditorLogic() {
 const { role } = useAuthStore()
 const { currentTask, startNewTask, setCurrentTask, setJiraContent, updateTaskData, updateTaskInfo, resetTask } = useTasksStore()
 const { stories, addTaskToStory, updateTask } = useStoriesStore()
 const { sprints } = useSprintsStore()
 const navigate = useNavigate()
 const { storyId, taskId } = useParams<{ storyId?: string; taskId?: string }>()
 const fileInputRef = useRef<HTMLInputElement>(null)

 const [showPreviewPanel, setShowPreviewPanel] = useState(false)
 const [previewTab, setPreviewTab] = useState<'jira' | 'visual'>('visual')
 const [previewModalOpen, setPreviewModalOpen] = useState(false)
 const [justificationModalOpen, setJustificationModalOpen] = useState(false)
 const [showClearConfirm, setShowClearConfirm] = useState(false)
 const [showFinishConfirm, setShowFinishConfirm] = useState(false)
 const [importFile, setImportFile] = useState<File | null>(null)

 const isReadOnly = useMemo(() => {
 const sid = storyId || currentTask?.storyId
 if (!sid) return false
 const sprint = sprints.find(s => s.storyIds.includes(sid))
 return sprint?.status === 'completed'
 }, [storyId, currentTask?.storyId, sprints])

 useEffect(() => {
 if (storyId && taskId) {
 const story = stories.find(s => s.id === storyId)
 const task = story?.tasks.find(t => t.id === taskId)
 if (task) {
 if (!currentTask || currentTask.id !== task.id) {
 setCurrentTask(task as unknown as TaskDraft)
 }
 } else {
 toast.error("No se encontró la tarea")
 void navigate('/dashboard')
 }
 } else if (!currentTask) {
 startNewTask()
 }
 }, [storyId, taskId, stories, currentTask, setCurrentTask, startNewTask, navigate])

 useEffect(() => {
 if (currentTask) {
 const jira = markdownToJira(currentTask)
 if (jira !== currentTask.jiraContent) {
 setJiraContent(jira)
 }
 }
 }, [currentTask, setJiraContent])

 const handleFinish = useCallback(() => {
 if (!currentTask) return
 if (!currentTask.title.trim()) {
 toast.error('La tarea requiere un título')
 return
 }
 setShowFinishConfirm(true)
 }, [currentTask])

 const confirmFinish = useCallback(() => {
 if (!currentTask) return
 if (currentTask.id) {
 setJustificationModalOpen(true)
 return
 }
 if (currentTask.storyId) {
 addTaskToStory(currentTask.storyId, currentTask)
 resetTask()
 void navigate(`/stories/${currentTask.storyId}`)
 } else {
 const jira = currentTask.jiraContent || ''
 void navigator.clipboard.writeText(jira).then(() => {
 toast.success('Jira copiado')
 resetTask()
 void navigate('/dashboard')
 })
 }
 }, [currentTask, addTaskToStory, resetTask, navigate])

 const handleConfirmJustification = useCallback((comment: string) => {
 if (!currentTask || !currentTask.id || !currentTask.storyId) return
 const { status, ...rest } = currentTask
 updateTask(currentTask.storyId, currentTask.id, { ...rest, status: status === 'draft' ? undefined : status }, comment)
 resetTask()
 void navigate(`/stories/${currentTask.storyId}`)
 }, [currentTask, updateTask, resetTask, navigate])

 return {
 role,
 currentTask,
 isReadOnly,
 showPreviewPanel, setShowPreviewPanel,
 previewTab, setPreviewTab,
 previewModalOpen, setPreviewModalOpen,
 justificationModalOpen, setJustificationModalOpen,
 showClearConfirm, setShowClearConfirm,
 showFinishConfirm, setShowFinishConfirm,
 importFile, setImportFile,
 fileInputRef,
 handleFinish,
 confirmFinish,
 handleConfirmJustification,
 resetTask,
 updateTaskData,
 updateTaskInfo,
 navigate
 }
}
