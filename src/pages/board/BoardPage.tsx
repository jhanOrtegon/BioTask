import { useMemo, useCallback, useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { DropResult } from '@hello-pangea/dnd'
import { DragDropContext } from '@hello-pangea/dnd'
import { useStoriesStore } from '@/features/stories/store'
import { useNavigate } from 'react-router-dom'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { useEpicsStore } from '@/features/epics/store'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/shared/components/confirm-dialog'
import { cn } from '@/shared/utils'

import { BoardHeader } from './components/BoardHeader'
import { BoardEmptyState } from './components/BoardEmptyState'
import { BoardColumn } from './components/BoardColumn'

type ColumnType = 'pending' | 'in_progress' | 'qa' | 'blocked' | 'completed'

const COLUMN_DOT: Record<ColumnType, string> = {
 pending: 'bg-amber-500',
 in_progress: 'bg-blue-500',
 qa: 'bg-violet-500',
 blocked: 'bg-rose-500',
 completed: 'bg-emerald-500',
}

const COLUMNS: { id: ColumnType, title: string }[] = [
 { id: 'pending', title: 'Por Hacer' },
 { id: 'in_progress', title: 'En Progreso' },
 { id: 'qa', title: 'En Revisión' },
 { id: 'blocked', title: 'Bloqueado' },
 { id: 'completed', title: 'Completada' }
]

export function BoardPage() {
 const navigate = useNavigate()
 const { stories, updateTask, startTaskTimer, pauseTaskTimer, stopTaskTimer, resetTaskTimer, reorderTask, syncTasksIds } = useStoriesStore()
 const { sprints } = useSprintsStore()
 const { startNewTask } = useTasksStore()
 const { getMemberById, members } = useTeamStore()
 const { epics } = useEpicsStore()

 const [resetTimerDialog, setResetTimerDialog] = useState<{ storyId: string; taskId: string; title: string } | null>(null)
 
 const [selectedSprintId, setSelectedSprintId] = useState('')
 const [selectedEpicId, setSelectedEpicId] = useState('all')
 const [selectedStoryId, setSelectedStoryId] = useState('all')
 const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
 const [searchQuery, setSearchQuery] = useState('')

 const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])
 const currentSprint = useMemo(() => {
 if (selectedSprintId) return sprints.find(s => s.id === selectedSprintId)
 return activeSprint
 }, [sprints, selectedSprintId, activeSprint])

 useEffect(() => {
 syncTasksIds()
 }, [syncTasksIds])

 const sprintTasks = useMemo(() => {
 if (!currentSprint) return []

 return stories
 .filter(s => currentSprint.storyIds.includes(s.id))
 .flatMap(s => s.tasks.map(t => ({ ...t, storyCode: s.code, storyTitle: s.title, storyId: s.id })))
 .filter(t => t.status !== 'archived' && t.id && t.storyId)
 }, [stories, currentSprint])

 const allTasks = useMemo(() => {
 return sprintTasks
 .filter(t => {
 // Epic filter
 const story = stories.find(s => s.id === t.storyId)
 if (selectedEpicId !== 'all' && story?.epicId !== selectedEpicId) return false
 
 // Story filter
 if (selectedStoryId !== 'all' && t.storyId !== selectedStoryId) return false

 // Member filter
 if (selectedMemberIds.length > 0 && (!t.assignedTo || !selectedMemberIds.includes(t.assignedTo))) return false

 // Search query
 if (!searchQuery) return true
 const query = searchQuery.toLowerCase()
 return (
 t.title.toLowerCase().includes(query) ||
 (t.code && t.code.toLowerCase().includes(query)) ||
 t.storyCode.toLowerCase().includes(query) ||
 t.storyTitle.toLowerCase().includes(query)
 )
 })
 .sort((a, b) => a.position - b.position)
 }, [stories, sprintTasks, selectedEpicId, selectedStoryId, selectedMemberIds, searchQuery])

 const activeMembers = useMemo(() => {
 const memberIdsWithTasks = new Set(sprintTasks.map(t => t.assignedTo).filter(Boolean) as string[])
 return members.filter(m => memberIdsWithTasks.has(m.id))
 }, [members, sprintTasks])

 const sprintStories = useMemo(() => {
 if (!currentSprint) return []
 return stories.filter(s => 
 currentSprint.storyIds.includes(s.id) &&
 (selectedEpicId === 'all' || s.epicId === selectedEpicId)
 )
 }, [stories, currentSprint, selectedEpicId])

 const triggerConfetti = useCallback(() => {
 void confetti({
 particleCount: 150,
 spread: 70,
 origin: { y: 0.6 },
 colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
 })
 }, [])

 const onDragEnd = (result: DropResult) => {
 const { source, destination, draggableId } = result
 
 if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
 return
 }

 const taskToMove = allTasks.find(t => t.id === draggableId)
 if (!taskToMove) return

 const newStatus = destination.droppableId as ColumnType
 const destTasks = allTasks.filter(t => t.status === newStatus && t.id !== draggableId)
 
 let newPosition: number
 if (destTasks.length === 0) {
 newPosition = 1000
 } else if (destination.index === 0) {
 newPosition = (destTasks[0].position || 0) / 2
 } else if (destination.index >= destTasks.length) {
 newPosition = (destTasks[destTasks.length - 1].position || 0) + 1000
 } else {
 const prevPos = destTasks[destination.index - 1].position
 const nextPos = destTasks[destination.index].position
 newPosition = (prevPos + nextPos) / 2
 }

 if (newStatus === 'completed' && taskToMove.status !== 'completed') {
 stopTaskTimer(taskToMove.storyId, taskToMove.id)
 reorderTask(taskToMove.storyId, taskToMove.id, newPosition)
 triggerConfetti()
 } else {
 if (newStatus === 'pending' || newStatus === 'blocked') {
 pauseTaskTimer(taskToMove.storyId, taskToMove.id)
 } else if (newStatus === 'in_progress' && taskToMove.status !== 'in_progress') {
 startTaskTimer(taskToMove.storyId, taskToMove.id)
 }

 updateTask(
 taskToMove.storyId, 
 taskToMove.id, 
 { 
 status: newStatus,
 position: newPosition
 }, 
 `Movido a ${newStatus}`
 )
 }
 }

 return (
 <div className="flex flex-col h-full bg-background px-4 md:px-6 lg:px-8 py-4 animate-in fade-in duration-300 relative overflow-hidden">
 <div className="max-w-full mx-auto w-full flex flex-col h-full min-h-0">
 <BoardHeader 
 activeSprint={activeSprint}
 sprints={sprints}
 sprintStories={sprintStories}
 epics={epics}
 members={activeMembers}
 selectedSprintId={selectedSprintId}
 setSelectedSprintId={setSelectedSprintId}
 selectedEpicId={selectedEpicId}
 setSelectedEpicId={setSelectedEpicId}
 selectedStoryId={selectedStoryId}
 setSelectedStoryId={setSelectedStoryId}
 selectedMemberIds={selectedMemberIds}
 setSelectedMemberIds={setSelectedMemberIds}
 searchQuery={searchQuery}
 setSearchQuery={setSearchQuery}
 tasksCount={allTasks.length}
 />

 {currentSprint && (
 <div className="shrink-0 flex items-center gap-1.5 py-2">
 {COLUMNS.map(col => {
 const count = allTasks.filter(t => t.status === col.id).length
 const pct = allTasks.length > 0 ? Math.round((count / allTasks.length) * 100) : 0
 return (
 <div key={col.id} className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/50 border border-border/30 min-w-0 group hover:border-border/60 transition-colors">
 <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', COLUMN_DOT[col.id as ColumnType])} />
 <span className="text-[11px] font-medium text-muted-foreground/50 truncate hidden md:block">{col.title}</span>
 <span className="text-xs font-semibold tabular-nums ml-auto text-foreground/70">{count}</span>
 {allTasks.length > 0 && (
 <span className="text-[10px] font-medium text-muted-foreground/30 hidden lg:block">{pct}%</span>
 )}
 </div>
 )
 })}
 </div>
 )}

 <DragDropContext onDragEnd={onDragEnd}>
 <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
 {!currentSprint ? (
 <BoardEmptyState onNavigateToSprints={() => { void navigate('/sprints') }} />
 ) : (
 <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin scrollbar-thumb-border/40 hover:scrollbar-thumb-border/80 scrollbar-track-transparent h-full min-h-0">
 {COLUMNS.map(column => (
 <div key={column.id} className="flex-1 min-w-[250px] w-full h-full flex flex-col min-h-0">
 <BoardColumn 
 id={column.id}
 title={column.title}
 tasks={allTasks.filter(t => t.status === column.id)}
 isCompletedSprint={currentSprint.status === 'completed'}
 onQuickTask={() => {
 const activeStory = stories.find(s => s.status === 'active')
 startNewTask(undefined, activeStory?.id)
 void navigate('/editor')
 }}
 getMemberById={getMemberById}
 pauseTaskTimer={pauseTaskTimer}
 startTaskTimer={startTaskTimer}
 stopTaskTimer={stopTaskTimer}
 triggerConfetti={triggerConfetti}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 </DragDropContext>
 </div>
 
 <ConfirmDialog
 open={!!resetTimerDialog}
 onOpenChange={(open) => { if (!open) setResetTimerDialog(null) }}
 onConfirm={() => {
 if (resetTimerDialog) {
 resetTaskTimer(resetTimerDialog.storyId, resetTimerDialog.taskId)
 toast.success("Contador reiniciado")
 }
 }}
 title="¿Reiniciar Contador?"
 description={`Se perderá todo el tiempo registrado para "${resetTimerDialog?.title || 'esta tarea'}".`}
 confirmText="Reiniciar"
 variant="destructive"
 />
 </div>
 )
}
