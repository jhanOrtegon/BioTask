import { useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useEpicsStore } from '@/features/epics/store'
import { toast } from 'sonner'

export function useStoriesLogic() {
 const { stories, addStory, updateStory, archiveStory, restoreStory, reorderStory } = useStoriesStore()
 const { epics } = useEpicsStore()
 const location = useLocation()
 const navigate = useNavigate()
 
 const [search, setSearch] = useState('')
 const locationState = location.state as { epicId?: string } | null
 const [epicFilter, setEpicFilter] = useState<string>(locationState?.epicId || 'all')
 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(10)

 const [isCreateOpen, setIsCreateOpen] = useState(false)
 const [showArchived, setShowArchived] = useState(false)
 const [archiveDialogId, setArchiveDialogId] = useState<string | null>(null)
 const [editStoryId, setEditStoryId] = useState<string | null>(null)
 const [editCommentDialog, setEditCommentDialog] = useState(false)
 
 const [editForm, setEditForm] = useState({
 code: '',
 title: '',
 module: '',
 description: '',
 epicId: ''
 })

 const [formCode, setFormCode] = useState('')
 const [formTitle, setFormTitle] = useState('')
 const [formModule, setFormModule] = useState('')
 const [formDesc, setFormDesc] = useState('')
 const [formEpicId, setFormEpicId] = useState('')

 const filteredStories = useMemo(() => {
 return stories
 .filter(s => showArchived ? s.status === 'archived' : s.status === 'active')
 .filter(s => {
 const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
 s.code.toLowerCase().includes(search.toLowerCase())
 const matchesEpic = epicFilter === 'all' || s.epicId === epicFilter
 return matchesSearch && matchesEpic
 })
 .sort((a, b) => (a.position || 0) - (b.position || 0))
 }, [stories, showArchived, search, epicFilter])

 const paginatedStories = useMemo(() => {
 return filteredStories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
 }, [filteredStories, currentPage, itemsPerPage])

 const totalPages = Math.ceil(filteredStories.length / itemsPerPage)

 const handleDragEnd = useCallback((result: { source: { index: number }; destination: { index: number } | null | undefined; draggableId: string }) => {
 const { source, destination, draggableId } = result
 if (!destination) return
 if (source.index === destination.index) return

 const otherStories = filteredStories.filter(s => s.id !== draggableId)
 let newPosition: number

 if (otherStories.length === 0) {
 newPosition = 1000
 } else if (destination.index === 0) {
 newPosition = (otherStories[0].position || 0) / 2
 } else if (destination.index >= otherStories.length) {
 newPosition = (otherStories[otherStories.length - 1].position || 0) + 1000
 } else {
 const prevPos = otherStories[destination.index - 1].position || 0
 const nextPos = otherStories[destination.index].position || 0
 newPosition = (prevPos + nextPos) / 2
 }
 reorderStory(draggableId, newPosition)
 }, [filteredStories, reorderStory])

 const handleCreateStory = useCallback(() => {
 if (!formCode.trim() || !formTitle.trim() || !formModule.trim()) {
 toast.error('Campos obligatorios incompletos')
 return
 }
 const story = addStory({
 code: formCode.trim(),
 title: formTitle.trim(),
 module: formModule.trim(),
 description: formDesc.trim() || undefined,
 epicId: formEpicId || undefined,
 })
 toast.success('Historia creada', { description: story.code })
 setFormCode(''); setFormTitle(''); setFormModule(''); setFormDesc(''); setFormEpicId('')
 setIsCreateOpen(false)
 }, [formCode, formTitle, formModule, formDesc, formEpicId, addStory])

 const handleArchiveStory = useCallback((comment: string) => {
 if (!archiveDialogId) return
 archiveStory(archiveDialogId, comment)
 setArchiveDialogId(null)
 toast.warning('Historia eliminada')
 }, [archiveDialogId, archiveStory])

 const handleRestoreStory = useCallback((id: string) => {
 restoreStory(id, 'Restaurada')
 toast.success('Historia restaurada')
 }, [restoreStory])

 const handleSaveEdit = useCallback((comment: string) => {
 if (!editStoryId) return
 updateStory(editStoryId, editForm, comment)
 setEditStoryId(null)
 setEditCommentDialog(false)
 toast.success('Historia actualizada')
 }, [editStoryId, editForm, updateStory])

 return {
 stories: paginatedStories,
 allFilteredStories: filteredStories,
 epics,
 search, setSearch,
 epicFilter, setEpicFilter,
 currentPage, setCurrentPage,
 totalPages,
 totalItems: filteredStories.length,
 itemsPerPage, setItemsPerPage,
 isCreateOpen, setIsCreateOpen,
 showArchived, setShowArchived,
 archiveDialogId, setArchiveDialogId,
 editStoryId, setEditStoryId,
 editCommentDialog, setEditCommentDialog,
 editForm, setEditForm,
 formFields: {
 code: formCode, setCode: setFormCode,
 title: formTitle, setTitle: setFormTitle,
 module: formModule, setModule: setFormModule,
 description: formDesc, setDesc: setFormDesc,
 epicId: formEpicId, setEpicId: setFormEpicId
 },
 handleDragEnd,
 handleCreateStory,
 handleArchiveStory,
 handleRestoreStory,
 handleSaveEdit,
 updateStory,
 navigate
 }
}
