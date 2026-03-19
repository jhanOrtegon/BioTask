import { useMemo, useState } from 'react'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'

import { AnalyticsHeader } from './components/AnalyticsHeader'
import { AnalyticsStats } from './components/AnalyticsStats'
import { AnalyticsOverviewTab } from './components/AnalyticsOverviewTab'
import { AnalyticsTeamTab } from './components/AnalyticsTeamTab'
import { AnalyticsVelocityTab } from './components/AnalyticsVelocityTab'
import { AnalyticsInsights } from './components/AnalyticsInsights'

export function AnalyticsPage() {
 const { stories } = useStoriesStore()
 const { sprints } = useSprintsStore()
 const { members, getMemberById } = useTeamStore()
 
 const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints.find(s => s.status === 'active')?.id || 'all')
 const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
 const [activeTab, setActivoTab] = useState('overview')
 const [currentPage, setCurrentPage] = useState(1)
 const ITEMS_PER_PAGE = 5

 const filteredTasks = useMemo(() => {
 return stories.flatMap(s => s.tasks.filter(t => {
 const sprintMatch = selectedSprintId === 'all' || t.sprintId === selectedSprintId
 let specialtyMatch = true
 if (selectedSpecialty !== 'all' && t.assignedTo) {
 const member = getMemberById(t.assignedTo)
 specialtyMatch = member?.specialty === selectedSpecialty
 }
 return sprintMatch && specialtyMatch && t.status !== 'archived'
 }))
 }, [stories, selectedSprintId, selectedSpecialty, getMemberById])

 const stats = useMemo(() => {
 const total = filteredTasks.length
 const completed = filteredTasks.filter(t => t.status === 'completed').length
 const blocked = filteredTasks.filter(t => t.status === 'blocked').length
 const totalHours = filteredTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
 const estimatedHours = filteredTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
 
 return {
 total,
 completed,
 blocked,
 completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
 totalHours: Number(totalHours.toFixed(1)),
 estimatedHours,
 accuracy: estimatedHours > 0 ? Math.round(Math.min(100, (totalHours / estimatedHours) * 100)) : 0
 }
 }, [filteredTasks])

 const teamRendimiento = useMemo(() => {
 const data: Record<string, { name: string, completed: number, active: number, hours: number, avatar?: string }> = {}
 
 filteredTasks.forEach(t => {
 if (!t.assignedTo) return
 const member = getMemberById(t.assignedTo)
 if (!member) return
 
 // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
 if (!data[t.assignedTo]) {
 data[t.assignedTo] = { 
 name: member.name.split(' ')[0], 
 completed: 0, 
 active: 0, 
 hours: 0,
 avatar: member.avatarUrl
 }
 }
 
 if (t.status === 'completed') data[t.assignedTo].completed++
 else data[t.assignedTo].active++
 
 data[t.assignedTo].hours += (t.timeSpent || 0) / 3600
 })
 
 return Object.values(data).sort((a, b) => b.hours - a.hours)
 }, [filteredTasks, getMemberById])

 const totalPages = Math.ceil(teamRendimiento.length / ITEMS_PER_PAGE)
 const paginatedTeamRendimiento = useMemo(() => {
 const start = (currentPage - 1) * ITEMS_PER_PAGE
 return teamRendimiento.slice(start, start + ITEMS_PER_PAGE)
 }, [teamRendimiento, currentPage])

 const velocityData = useMemo(() => {
 return sprints
 .filter(s => s.status === 'completed' || s.status === 'active')
 .slice(-4)
 .map(s => {
 const sprintStories = stories.filter(st => s.storyIds.includes(st.id))
 const points = sprintStories.reduce((acc, st) => acc + st.tasks.reduce((tAcc, t) => tAcc + (t.estimatedHours || 1), 0), 0)
 const completedPoints = sprintStories.reduce((acc, st) => 
 acc + st.tasks.filter(t => t.status === 'completed').reduce((tAcc, t) => tAcc + (t.estimatedHours || 1), 0), 0)
 
 return {
 name: s.name.split(':')[0],
 Total: points,
 Completed: completedPoints
 }
 })
 }, [sprints, stories])

 const typeDistribution = useMemo(() => {
 const counts: Record<string, number> = {}
 filteredTasks.forEach(t => {
 counts[t.type] = (counts[t.type] || 0) + 1
 })
 return Object.entries(counts).map(([name, value]) => ({ 
 name: name.charAt(0).toUpperCase() + name.slice(1), 
 value 
 }))
 }, [filteredTasks])

 const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
 
 <AnalyticsHeader 
 sprints={sprints}
 members={members}
 selectedSprintId={selectedSprintId}
 setSelectedSprintId={setSelectedSprintId}
 selectedSpecialty={selectedSpecialty}
 setSelectedSpecialty={setSelectedSpecialty}
 />

 <AnalyticsStats stats={stats} />

 <Tabs value={activeTab} onValueChange={setActivoTab} className="space-y-6">
 <TabsList className="bg-muted/40 p-1 rounded-lg border border-border/40 w-fit h-auto flex-wrap">
 <TabsTrigger value="overview" className="rounded-md px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pulso General</TabsTrigger>
 <TabsTrigger value="team" className="rounded-md px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Equipo</TabsTrigger>
 <TabsTrigger value="velocity" className="rounded-md px-4 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Velocidad</TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-8">
 <AnalyticsOverviewTab 
 typeDistribution={typeDistribution}
 velocityData={velocityData}
 COLORS={COLORS}
 />
 </TabsContent>

 <TabsContent value="team" className="space-y-8">
 <AnalyticsTeamTab 
 teamRendimiento={teamRendimiento}
 paginatedTeamRendimiento={paginatedTeamRendimiento}
 currentPage={currentPage}
 totalPages={totalPages}
 setCurrentPage={setCurrentPage}
 />
 </TabsContent>

 <TabsContent value="velocity" className="space-y-8">
 <AnalyticsVelocityTab velocityData={velocityData} />
 </TabsContent>
 </Tabs>

 <AnalyticsInsights 
 velocityValue={velocityData[velocityData.length-1]?.Completed || 0}
 blockedCount={stats.blocked}
 totalCount={stats.total}
 />
 </div>
 <div className="fixed -bottom-48 -left-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
 <div className="fixed -top-48 -right-48 w-[400px] h-[400px] bg-primary/3 blur-[120px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
