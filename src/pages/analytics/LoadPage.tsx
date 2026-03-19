import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { useSprintsStore } from '@/features/sprints/store'
import { Layers } from 'lucide-react'

import { LoadHeader } from './components/LoadHeader'
import { LoadInsights } from './components/LoadInsights'
import { LoadCharts } from './components/LoadCharts'
import { LoadTable } from './components/LoadTable'

export function LoadPage() {
 const navigate = useNavigate()
 const { stories } = useStoriesStore()
 const { getMemberById } = useTeamStore()
 const { sprints } = useSprintsStore()
 const [currentPage, setCurrentPage] = useState(1)
 const ITEMS_PER_PAGE = 5

 const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])

 const sprintStories = useMemo(() => {
 if (!activeSprint) return []
 return stories.filter(s => activeSprint.storyIds.includes(s.id))
 }, [stories, activeSprint])

 const sprintTasks = useMemo(() => sprintStories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [sprintStories])

 const devLoadData = useMemo(() => {
 const load = new Map<string, { hours: number, tasks: number }>()
 sprintTasks.forEach(t => {
 if (t.assignedTo) {
 const member = getMemberById(t.assignedTo)
 if (member) {
 const stats = load.get(member.name) || { hours: 0, tasks: 0 }
 stats.hours += (t.timeSpent || 0) / 3600
 stats.tasks += 1
 load.set(member.name, stats)
 }
 }
 })
 return Array.from(load.entries())
 .map(([name, stats]) => ({ 
 name, 
 Horas: Number(stats.hours.toFixed(1)),
 Tareas: stats.tasks
 }))
 .sort((a, b) => b.Horas - a.Horas)
 }, [sprintTasks, getMemberById])

 const moduleLoadData = useMemo(() => {
 const load: Record<string, number> = {}
 sprintStories.forEach(s => {
 const hours = s.tasks.reduce((acc, t) => acc + (t.timeSpent || 0) / 3600, 0)
 load[s.module] = (load[s.module] || 0) + hours
 })
 return Object.entries(load)
 .map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
 .sort((a, b) => b.value - a.value)
 }, [sprintStories])

 const totalPages = Math.ceil(devLoadData.length / ITEMS_PER_PAGE)
 const paginatedDevLoad = useMemo(() => {
 const start = (currentPage - 1) * ITEMS_PER_PAGE
 return devLoadData.slice(start, start + ITEMS_PER_PAGE)
 }, [devLoadData, currentPage])

 if (!activeSprint) {
 return (
 <div className="h-full flex items-center justify-center p-8 bg-background">
 <Card className="max-w-md w-full border-dashed border-primary/20">
 <CardContent className="p-12 text-center space-y-6">
 <Layers className="h-12 w-12 text-primary/40 mx-auto animate-pulse" />
 <div className="space-y-2">
 <h2 className="text-xl font-semibold italic">No hay Sprint Activo</h2>
 <p className="text-sm text-muted-foreground font-medium">Activa un sprint en el Lab para visualizar el análisis de carga.</p>
 </div>
 <Button onClick={() => { void navigate('/sprints') }} className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20">
 Ir al Lab de Sprints
 </Button>
 </CardContent>
 </Card>
 </div>
 )
 }

 const totalInverted = devLoadData.reduce((acc, d) => acc + d.Horas, 0)
 const avgHours = totalInverted / (devLoadData.length || 1)

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
 <div className="max-w-[1400px] mx-auto w-full space-y-10 animate-in fade-in duration-700 pb-20">
 <LoadHeader />
 <LoadInsights 
 data={{
 totalHours: totalInverted,
 avgHours: avgHours,
 activeModules: moduleLoadData.length,
 sprintDevs: devLoadData.length
 }} 
 />
 <LoadCharts devLoadData={devLoadData} moduleLoadData={moduleLoadData} />
 <div className="max-h-[500px] flex flex-col">
 <LoadTable 
 data={paginatedDevLoad}
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 />
 </div>
 </div>
 <div className="fixed -bottom-48 -left-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 <div className="fixed -top-48 -right-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 </div>
 )
}
