import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { BrainCircuit } from 'lucide-react'

import { HealthHeader } from './components/HealthHeader'
import { HealthMetrics } from './components/HealthMetrics'
import { HealthForecast } from './components/HealthForecast'
import { HealthAlerts } from './components/HealthAlerts'

export function HealthPage() {
 const navigate = useNavigate()
 const { stories } = useStoriesStore()
 const { sprints } = useSprintsStore()

 const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])

 const sprintStories = useMemo(() => {
 if (!activeSprint) return []
 return stories.filter(s => activeSprint.storyIds.includes(s.id))
 }, [stories, activeSprint])

 const sprintTasks = useMemo(() => sprintStories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [sprintStories])

 const healthMetrics = useMemo(() => {
 const total = sprintTasks.length
 if (total === 0) return { completion: 0, pending: 0, blocked: 0, health: 'good', risk: 0 }

 const completed = sprintTasks.filter(t => t.status === 'completed').length
 const blocked = sprintTasks.filter(t => t.status === 'blocked').length
 const completion = Math.round((completed / total) * 100)
 
 let health: 'good' | 'warning' | 'critical' = 'good'
 if (blocked > total * 0.2 || completion < 20) health = 'critical'
 else if (blocked > 0 || completion < 50) health = 'warning'

 return {
 completion,
 pending: total - completed,
 blocked,
 health,
 risk: Math.min(100, (blocked * 10) + (100 - completion) / 2)
 }
 }, [sprintTasks])

 const forecastData = useMemo(() => {
 return [0, 1, 2].map(i => {
 const date = addDays(new Date(), i + 1)
 const hash = Math.abs(Math.sin(date.getTime()) * 10000)
 return {
 date,
 dayName: format(date, 'EEEE', { locale: es }),
 dayNum: format(date, 'dd'),
 hours: 8 + Math.floor(hash % 5),
 stories: 1 + Math.floor(hash % 3)
 }
 })
 }, [])

 if (!activeSprint) {
 return (
 <div className="h-full flex items-center justify-center p-8 bg-background">
 <Card className="max-w-md w-full border-dashed border-primary/20">
 <CardContent className="p-12 text-center space-y-6">
 <BrainCircuit className="h-12 w-12 text-primary/40 mx-auto animate-pulse" />
 <div className="space-y-2">
 <h2 className="text-xl font-semibold italic">No hay Sprint Activo</h2>
 <p className="text-sm text-muted-foreground font-medium">Activa un sprint en el Lab para visualizar la telemetría de salud.</p>
 </div>
 <Button onClick={() => { void navigate('/sprints') }} className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20">
 Ir al Lab de Sprints
 </Button>
 </CardContent>
 </Card>
 </div>
 )
 }

 const daysRemaining = differenceInDays(new Date(activeSprint.endDate), new Date())

 return (
 <div className="min-h-full flex flex-col bg-background p-4 md:p-6 lg:p-8 relative transition-all duration-500">
 <div className="max-w-[1400px] mx-auto w-full space-y-8 animate-in fade-in duration-700 pb-20">
 
 <HealthHeader 
 daysRemaining={daysRemaining} 
 health={healthMetrics.health as 'good' | 'warning' | 'critical'} 
 />

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <HealthMetrics metrics={healthMetrics} />
 <HealthForecast data={forecastData} />
 </div>

 <HealthAlerts blocked={healthMetrics.blocked} />
 </div>
 <div className="fixed -bottom-48 -left-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 <div className="fixed -top-48 -right-48 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-50" />
 </div>
 )
}
