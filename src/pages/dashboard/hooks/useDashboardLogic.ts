import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { format, subDays, isSameDay, startOfDay, addDays, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useStoriesStore } from '@/features/stories/store'
import { useAuthStore } from '@/features/auth/store'
import { useTasksStore } from '@/features/tasks/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { useEpicsStore } from '@/features/epics/store'
import { generateSeedData } from '@/shared/utils/seed-data'
import type { DeviationMetrics, SystemForecast, PerformanceMetric } from '../types'

export function useDashboardLogic() {
 const { role } = useAuthStore()
 const navigate = useNavigate()
 const { stories, syncTasksIds, setStories } = useStoriesStore()
 const { startNewTask } = useTasksStore()
 const { sprints, setSprints } = useSprintsStore()
 const { setMembers, getMemberById, members } = useTeamStore()
 const { setEpics } = useEpicsStore()
 
 const handleSync = useCallback(() => {
 syncTasksIds()
 toast.success('Sincronización completada', { description: 'Las tareas sin ID han sido reparadas.' })
 }, [syncTasksIds])

 const handleSeed = useCallback(() => {
 if (confirm('¿Estás seguro? Esto borrará tus datos actuales y cargará la simulación de 1 mes con 15 desarrolladores.')) {
 const data = generateSeedData()
 setMembers(data.members)
 setStories(data.stories)
 setSprints(data.sprints)
 setEpics(data.epics)
 toast.success('Simulación BioTask Alfa Cargada', { 
 description: 'Se han generado 75+ miembros, 8 Sprints, 90 Historias y auditoría técnica completa de 3 meses.' 
 })
 }
 }, [setMembers, setStories, setSprints, setEpics])

 const activeStories = useMemo(() => {
 return stories.filter(s => s.status === 'active')
 }, [stories])

 const teamTasks = useMemo(() => stories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [stories])
 
 const totalTasksCount = useMemo(() => teamTasks.length, [teamTasks])

 const handleQuickTask = useCallback(() => {
 startNewTask()
 void navigate('/editor')
 }, [startNewTask, navigate])

 const teamLoadData = useMemo(() => {
 const load: Record<string, number> = {}
 teamTasks.forEach(t => {
 if (t.assignedTo) {
 const member = getMemberById(t.assignedTo)
 if (member) {
 const hours = (t.timeSpent || 0) / 3600
 load[member.name] = (load[member.name] || 0) + hours
 }
 }
 })
 return Object.entries(load)
 .map(([name, Horas]) => ({ name, Horas: Number(Horas.toFixed(1)) }))
 .sort((a, b) => b.Horas - a.Horas)
 .slice(0, 8)
 }, [teamTasks, getMemberById])

 const pieData = useMemo(() => {
 const typeCount = teamTasks.reduce<Record<string, number>>((acc, task) => {
 acc[task.type] = (acc[task.type] || 0) + 1
 return acc
 }, {})
 return Object.entries(typeCount).map(([name, value]) => ({ name, value }))
 }, [teamTasks])

 const activeSprint = useMemo(() => sprints.find(s => s.status === 'active') || null, [sprints])
 
 const burndownData = useMemo(() => {
 if (!activeSprint) return []
 
 const start = new Date(activeSprint.startDate)
 const end = new Date(activeSprint.endDate)
 const today = new Date()
 
 const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
 const sprintStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
 const totalEstimated = sprintStories.reduce((acc, s) => acc + s.tasks.reduce((tAcc, t) => tAcc + (t.estimatedHours || 0), 0), 0)
 
 const data = []
 for (let i = 0; i < totalDays; i++) {
 const d = new Date(start)
 d.setDate(d.getDate() + i)
 const ideal = Math.max(0, totalEstimated - (totalEstimated / (totalDays - 1)) * i)
 
 let real: number | null = null
 if (d <= today || (d.toDateString() === today.toDateString())) {
 const completedSoFar = sprintStories.reduce((acc, s) => 
 acc + s.tasks.filter(t => t.status === 'completed' && new Date(t.updatedAt) <= d).reduce((tAcc, t) => tAcc + (t.estimatedHours || 0), 0)
 , 0)
 real = Math.max(0, totalEstimated - completedSoFar)
 }

 data.push({
 name: format(d, 'dd MMM', { locale: es }),
 Ideal: Number(ideal.toFixed(1)),
 Real: real !== null ? Number(real.toFixed(1)) : undefined
 })
 }
 return data
 }, [activeSprint, stories])

 const sprintProgress = useMemo(() => {
 if (!activeSprint) return 0
 const sprintStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
 const total = sprintStories.reduce((acc: number, s) => acc + s.tasks.length, 0)
 if (total === 0) return 0
 const completed = sprintStories.reduce((acc: number, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0)
 return Math.round((completed / total) * 100)
 }, [activeSprint, stories])

 const daysLeft = useMemo(() => {
 if (!activeSprint) return 0
 const diff = new Date(activeSprint.endDate).getTime() - new Date().getTime()
 return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
 }, [activeSprint])

 const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i)), [])

 const dailyPerformance: PerformanceMetric[] = useMemo(() => {
 return last7Days.map(day => {
 const dayStart = startOfDay(day)
 let totalSeconds = 0

 stories.forEach(story => {
 story.tasks.forEach(task => {
 if (!task.timeLogs) return

 task.timeLogs.forEach(log => {
 if (!log.startedAt || !log.endedAt) return
 
 const start = new Date(log.startedAt)
 if (isSameDay(start, dayStart)) {
 const end = new Date(log.endedAt)
 totalSeconds += (end.getTime() - start.getTime()) / 1000
 }
 })
 })
 })

 return {
 name: format(day, 'EEE', { locale: es }),
 fullDate: format(day, 'dd MMM', { locale: es }),
 hours: Number((totalSeconds / 3600).toFixed(2)),
 seconds: totalSeconds
 }
 })
 }, [stories, last7Days])

 const systemForecast: SystemForecast | null = useMemo(() => {
 if (!activeSprint || burndownData.length === 0) return null
 
 const sprintStories = stories.filter(s => activeSprint.storyIds.includes(s.id))
 const completedStories = sprintStories.filter(s => s.tasks.every(t => t.status === 'completed'))
 
 const daysSinceStart = differenceInDays(new Date(), new Date(activeSprint.startDate)) || 1
 const velocity = completedStories.length / daysSinceStart
 
 const remainingStories = sprintStories.length - completedStories.length
 const daysToFinish = velocity > 0 ? Math.ceil(remainingStories / velocity) : 99
 
 const predictedEndDate = addDays(new Date(), daysToFinish)
 const deadline = new Date(activeSprint.endDate)
 const isDelayLikely = predictedEndDate > deadline
 
 return {
 predictedEndDate,
 daysToFinish,
 isDelayLikely,
 velocity: velocity.toFixed(2),
 status: isDelayLikely ? 'danger' : (velocity > 0 ? 'healthy' : 'stagnant')
 }
 }, [activeSprint, burndownData, stories])

 const deviationMetrics: DeviationMetrics = useMemo(() => {
 let totalEst = 0
 let totalReal = 0
 
 const typeDeviation: Record<string, { est: number, real: number }> = {
 'BE-': { est: 0, real: 0 },
 'FE-': { est: 0, real: 0 }
 }

 teamTasks.forEach(task => { 
 const est = task.estimatedHours || 0
 const real = (task.timeSpent || 0) / 3600
 totalEst += est
 totalReal += real

 const prefix = task.techPrefix === 'BE-' ? 'BE-' : 'FE-'
 typeDeviation[prefix].est += est
 typeDeviation[prefix].real += real
 })

 const accuracy = totalEst > 0 ? Math.max(0, 100 - (Math.abs(totalReal - totalEst) / totalEst) * 100) : 100
 const status = totalReal > totalEst ? 'Excedido' : totalReal < totalEst * 0.8 ? 'Sub-estimado' : 'Saludable'
 
 return {
 totalEst: Number(totalEst.toFixed(1)),
 totalReal: Number(totalReal.toFixed(1)),
 accuracy: Math.round(accuracy),
 status,
 typeData: [
 { name: 'Backend', Estimado: Number(typeDeviation['BE-'].est.toFixed(1)), Real: Number(typeDeviation['BE-'].real.toFixed(1)) },
 { name: 'Frontend', Estimado: Number(typeDeviation['FE-'].est.toFixed(1)), Real: Number(typeDeviation['FE-'].real.toFixed(1)) }
 ]
 }
 }, [teamTasks])

 const handleGenerateReport = useCallback(() => {
 const today = new Date()
 const todaysWork = stories.flatMap(s => s.tasks.filter(t => 
 t.timeLogs?.some(log => isSameDay(new Date(log.startedAt), today))
 ))

 const report = `
# 🧪 BioTask Daily Lab Report - ${format(today, 'dd/MM/yyyy')}
---
## 🎯 Logros de Hoy
${todaysWork.length > 0 ? todaysWork.map(t => `- [${t.code || 'TASK'}] ${t.title} (${t.status.replace('_', ' ')})`).join('\n') : '- No hay actividad registrada hoy.'}

## 🚀 Próximos Pasos
- Continuar con el avance de las historias activas.
- Revisar cuellos de botella detectados por Bio-Forecast.

## 📊 Estado del Sprint
- **Progreso:** ${String(sprintProgress)}%
- **Pronóstico:** ${systemForecast?.isDelayLikely ? '🚩 Riesgo de Retraso' : '✅ En Tiempo'}
---
*Generado automáticamente por BioTask Intelligence*
 `
 
 const blob = new Blob([report], { type: 'text/markdown' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `BioTask_Report_${format(today, 'yyyy-MM-dd')}.md`
 a.click()
 toast.success('Reporte generado', { description: 'El Lab Report ha sido descargado en formato Markdown.' })
 }, [stories, sprintProgress, systemForecast])

 const todayPerformance = dailyPerformance[dailyPerformance.length - 1]

 const blockedTasks = useMemo(() => teamTasks.filter(t => t.status === 'blocked'), [teamTasks])

 const topPerformers = useMemo(() => {
 const today = startOfDay(new Date())
 const stats: Record<string, number> = {}
 
 stories.forEach(s => {
 s.tasks.forEach(t => {
 if (!t.assignedTo || !t.timeLogs) return
 t.timeLogs.forEach(log => {
 if (isSameDay(new Date(log.startedAt), today)) {
 const start = new Date(log.startedAt).getTime()
 const end = log.endedAt ? new Date(log.endedAt).getTime() : new Date().getTime()
 const mId = t.assignedTo || ''
 stats[mId] = (stats[mId] || 0) + (end - start) / 1000
 }
 })
 })
 })

 return Object.entries(stats)
 .map(([id, seconds]) => ({
 id,
 seconds,
 hours: Number((seconds / 3600).toFixed(1)),
 member: getMemberById(id)
 }))
 .sort((a, b) => b.seconds - a.seconds)
 .slice(0, 5)
 }, [stories, getMemberById])

 return {
 role,
 members,
 activeStories,
 totalTasksCount,
 pieData,
 teamLoadData,
 activeSprint,
 burndownData,
 sprintProgress,
 daysLeft,
 dailyPerformance,
 systemForecast,
 deviationMetrics,
 todayPerformance,
 blockedTasks,
 topPerformers,
 handleSync,
 handleSeed,
 handleQuickTask,
 handleGenerateReport,
 navigate
 }
}

