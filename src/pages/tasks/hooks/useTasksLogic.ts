import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { useEpicsStore } from '@/features/epics/store'
import { toast } from 'sonner'
import type { TrackedTask, Story } from '@/features/stories/types'
import type { TaskDraft } from '@/features/tasks/types'

export function useTasksLogic() {
 const { stories, updateTask, stopTaskTimer, archiveTask, addTaskToStory } = useStoriesStore()
 const { getMemberById, members } = useTeamStore()
 const { epics } = useEpicsStore()
 const navigate = useNavigate()
 
 const [selectedEpicId, setSelectedEpicId] = useState('all')
 const [selectedStoryId, setSelectedStoryId] = useState('all')
 const [selectedStatus, setSelectedStatus] = useState('all')
 const [showArchived, setShowArchived] = useState(false)
 const [search, setSearch] = useState('')
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(10)

 const [archiveDialogData, setArchiveDialogData] = useState<{ taskId: string; title: string; storyId: string } | null>(null)
 const [viewTask, setViewTask] = useState<TrackedTask | null>(null)
 const [editTask, setEditTask] = useState<TrackedTask | null>(null)
 const [isCreatingTask, setIsCreatingTask] = useState(false)
 const [pendingUpdate, setPendingUpdate] = useState<{ taskId: string; storyId: string; data: Partial<TrackedTask> } | null>(null)

 const activeStories = useMemo(() => {
 return stories.filter(s => 
 s.status !== 'archived' && 
 (selectedEpicId === 'all' || s.epicId === selectedEpicId)
 )
 }, [stories, selectedEpicId])
 
 const allTasks = useMemo(() => {
 let tasks: (TrackedTask & { storyData: Story })[] = []
 for (const story of activeStories) {
 if (selectedStoryId !== 'all' && story.id !== selectedStoryId) continue
 
 const filteredTasks = story.tasks
 .filter(t => (showArchived ? t.status === 'archived' : t.status !== 'archived'))
 .filter(t => selectedStatus === 'all' || t.status === selectedStatus)
 .filter(t => {
 if (!search) return true
 const term = search.toLowerCase()
 return t.title.toLowerCase().includes(term) || (t.code && t.code.toLowerCase().includes(term))
 })
 .map(t => ({ ...t, storyData: story }))
 tasks = tasks.concat(filteredTasks)
 }
 return tasks
 }, [activeStories, selectedStoryId, selectedStatus, showArchived, search])

 const totalPages = Math.ceil(allTasks.length / itemsPerPage)
 const paginatedTasks = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage
 return allTasks.slice(start, start + itemsPerPage)
 }, [allTasks, currentPage, itemsPerPage])

 const handleStatusChange = useCallback((task: TrackedTask, newStatus: string) => {
 if (newStatus === 'archived') {
 setArchiveDialogData({ taskId: task.id, title: task.title, storyId: task.storyId })
 } else if (newStatus === 'completed') {
 stopTaskTimer(task.storyId, task.id)
 updateTask(task.storyId, task.id, { status: 'completed' }, 'Estado cambiado a Completada')
 } else {
 const statusNames: Record<string, string> = { 
 'pending': 'Por Hacer', 
 'in_progress': 'En Progreso', 
 'qa': 'En Revisión / QA',
 'blocked': 'Bloqueado',
 'completed': 'Completada' 
 }
 updateTask(task.storyId, task.id, { status: (newStatus as TrackedTask['status']) }, `Estado cambiado a ${statusNames[newStatus] || newStatus}`)
 }
 }, [updateTask, stopTaskTimer])

 const handlePriorityChange = useCallback((task: TrackedTask, newPriority: string) => {
 const priorityNames: Record<string, string> = { 'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Crítica' }
 updateTask(task.storyId, task.id, { priority: (newPriority as TrackedTask['priority']) }, `Prioridad cambiada a ${priorityNames[newPriority] || newPriority}`)
 toast.success('Prioridad actualizada')
 }, [updateTask])

 const handleConfirmUpdate = useCallback((comment: string) => {
 if (!pendingUpdate) return
 const { storyId, taskId, data } = pendingUpdate
 updateTask(storyId, taskId, data, comment)
 toast.success('Cambio registrado')
 setPendingUpdate(null)
 setEditTask(null)
 }, [pendingUpdate, updateTask])

 const handleConfirmArchive = useCallback((comment: string) => {
 if (!archiveDialogData) return
 archiveTask(archiveDialogData.storyId, archiveDialogData.taskId, comment)
 setArchiveDialogData(null)
 toast.success('Tarea eliminada')
 }, [archiveDialogData, archiveTask])

 const handleCreateTask = useCallback((data: Partial<TaskDraft> & { storyId: string }) => {
 const { storyId, title, type, data: taskData, priority, estimatedHours } = data
 if (!title || !type || !taskData) return

 addTaskToStory(storyId, {
 title,
 type,
 data: taskData,
 priority: priority || 'medium',
 estimatedHours: estimatedHours || 0
 })
 setIsCreatingTask(false)
 toast.success('Tarea creada correctamente')
 }, [addTaskToStory])

 return {
 tasks: paginatedTasks,
 activeStories,
 epics,
 members,
 getMemberById,
 selectedEpicId, setSelectedEpicId,
 selectedStoryId, setSelectedStoryId,
 selectedStatus, setSelectedStatus,
 showArchived, setShowArchived,
 search, setSearch,
 currentPage, setCurrentPage,
 totalPages,
 totalItems: allTasks.length,
 itemsPerPage, setItemsPerPage,
 archiveDialogData, setArchiveDialogData,
 viewTask, setViewTask,
 editTask, setEditTask,
 isCreatingTask, setIsCreatingTask,
 pendingUpdate, setPendingUpdate,
 handleStatusChange,
 handlePriorityChange,
 handleConfirmUpdate,
 handleConfirmArchive,
 handleCreateTask,
 navigate
 }
}
