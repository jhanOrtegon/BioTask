import { useMemo, useState } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useNavigate } from 'react-router-dom'

import { PlannerSidebar } from './components/PlannerSidebar'
import { PlannerHeader } from './components/PlannerHeader'
import { PlannerStoryCard } from './components/PlannerStoryCard'

import { useEpicsStore } from '@/features/epics/store'

export function SprintPlannerPage() {
 const navigate = useNavigate()
 const { stories, moveTaskToStory, reorderTask, updateTask, reorderStory } = useStoriesStore()
 const { sprints } = useSprintsStore()
 const { epics } = useEpicsStore()
 
 const [selectedSprintId] = useState<string | null>(null)
 const [selectedEpicId, setSelectedEpicId] = useState('all')
 const [searchQuery, setSearchQuery] = useState('')
 const [collapsedStories, setCollapsedStories] = useState<Record<string, boolean>>({})

 const activeSprint = useMemo(() => {
 if (selectedSprintId) return sprints.find(s => s.id === selectedSprintId)
 return sprints.find(s => s.status === 'active' || s.status === 'planning')
 }, [sprints, selectedSprintId])

 const isReadOnly = useMemo(() => activeSprint?.status === 'completed', [activeSprint])

 const sprintStories = useMemo(() => {
 if (!activeSprint) return []
 return stories
 .filter(s => activeSprint.storyIds.includes(s.id))
 .filter(s => selectedEpicId === 'all' || s.epicId === selectedEpicId)
 .map(s => ({
 ...s,
 tasks: s.tasks
 .filter(t => t.status !== 'archived')
 .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
 .sort((a, b) => a.position - b.position)
 }))
 .filter(s => s.tasks.length > 0 || searchQuery === '')
 .sort((a, b) => (a.position || 0) - (b.position || 0))
 }, [stories, activeSprint, searchQuery, selectedEpicId])

 const stats = useMemo(() => {
 const allTasks = sprintStories.flatMap(s => s.tasks)
 const totalHours = allTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
 const spentHours = allTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
 const completedTasks = allTasks.filter(t => t.status === 'completed').length
 const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length
 const pendingTasks = allTasks.filter(t => t.status === 'pending').length
 const unestimatedTasks = allTasks.filter(t => !t.estimatedHours).length

 const chartData = [
 { name: 'Pendientes', value: pendingTasks, color: 'hsl(var(--muted-foreground))' },
 { name: 'En Proceso', value: inProgressTasks, color: 'hsl(var(--primary))' },
 { name: 'Completadas', value: completedTasks, color: '#22c55e' }
 ]

 return {
 totalTasks: allTasks.length,
 completedTasks,
 inProgressTasks,
 totalHours,
 spentHours: parseFloat(spentHours.toFixed(1)),
 progress: allTasks.length > 0 ? (completedTasks / allTasks.length) * 100 : 0,
 chartData,
 unestimatedTasks
 }
 }, [sprintStories])

 const toggleStoryCollapse = (id: string) => {
 setCollapsedStories(prev => ({ ...prev, [id]: !prev[id] }))
 }

 const onDragEnd = (result: DropResult) => {
 const { source, destination, draggableId, type } = result
 
 if (!destination) return
 if (source.droppableId === destination.droppableId && source.index === destination.index) return

 if (type === 'story') {
 const otherStories = sprintStories.filter(s => s.id !== draggableId)
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
 return
 }

 const sourceStoryId = source.droppableId
 const destStoryId = destination.droppableId
 
 const destStory = sprintStories.find(s => s.id === destStoryId)
 if (!destStory) return

 const otherTasks = destStory.tasks.filter(t => t.id !== draggableId)
 let newPosition: number

 if (otherTasks.length === 0) {
 newPosition = 1000
 } else if (destination.index === 0) {
 newPosition = (otherTasks[0].position || 0) / 2
 } else if (destination.index >= otherTasks.length) {
 newPosition = (otherTasks[otherTasks.length - 1].position || 0) + 1000
 } else {
 const prevPos = otherTasks[destination.index - 1].position || 0
 const nextPos = otherTasks[destination.index].position || 0
 newPosition = (prevPos + nextPos) / 2
 }

 if (sourceStoryId === destStoryId) {
 reorderTask(sourceStoryId, draggableId, newPosition)
 } else {
 moveTaskToStory(sourceStoryId, destStoryId, draggableId, newPosition)
 }
 }

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
 <div className="max-w-7xl mx-auto w-full space-y-10 pb-20">
 <PlannerHeader 
 isReadOnly={isReadOnly}
 searchQuery={searchQuery}
 setSearchQuery={setSearchQuery}
 epics={epics}
 selectedEpicId={selectedEpicId}
 onEpicChange={(v) => { setSelectedEpicId(v) }}
 />

 <div className="flex flex-col lg:flex-row gap-8">
 <aside className="w-full lg:w-[300px] shrink-0">
 <PlannerSidebar stats={stats} sprintStories={sprintStories} />
 </aside>

 <main className="flex-1 min-w-0">
 <div className="space-y-6">
 {!activeSprint ? (
 <div className="flex flex-col items-center justify-center text-center p-12 bg-card/10 rounded-xl border-2 border-dashed border-border/40 min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
 <p className="text-muted-foreground font-semibold italic text-xs opacity-40">Seleccione un Sprint para comenzar la planificación dinámica.</p>
 </div>
 ) : (
 <DragDropContext onDragEnd={onDragEnd}>
 <Droppable droppableId="stories" type="story" isDropDisabled={isReadOnly}>
 {(provided) => (
 <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
 {sprintStories.map((story, storyIndex) => (
 <PlannerStoryCard 
 key={story.id}
 story={story}
 index={storyIndex}
 isReadOnly={isReadOnly}
 isCollapsed={collapsedStories[story.id] ?? true} // Default to true
 onToggleCollapse={toggleStoryCollapse}
 onUpdateTask={updateTask}
 onNavigateToEditor={(sId, tId) => { void navigate(`/editor/${sId}/${tId}`) }}
 />
 ))}
 {provided.placeholder}
 </div>
 )}
 </Droppable>
 </DragDropContext>
 )}
 </div>
 </main>
 </div>
 </div>

 <div className="fixed -bottom-48 -left-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 <div className="fixed -top-48 -right-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 </div>
 )
}
