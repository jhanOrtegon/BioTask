import { useMemo, useState } from 'react'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { startOfDay, isSameDay } from 'date-fns'
import { 
 Activity, 
 Clock, 
 AlertCircle, 
 CheckCircle2, 
 Zap, 
 Coffee,
 ArrowRight,
 Search,
 Filter,
 ChevronLeft,
 ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Progress } from '@/shared/components/progress'
import { cn } from '@/shared/utils'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Input } from '@/shared/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select'
import { Button } from '@/shared/components/button'
import type { TrackedTask } from '@/features/stories/types'

type MonitoringTask = TrackedTask & { storyCode: string }

const ITEMS_PER_PAGE = 8

export function OperationalPulsePage() {
 const navigate = useNavigate()
 const { stories } = useStoriesStore()
 const { members } = useTeamStore()
 const [searchTerm, setSearchTerm] = useState('')
 const [statusFilter, setStatusFilter] = useState<string>('all')
 const [specialtyFilter, setSpecialtyFilter] = useState<string>('all')
 const [currentPage, setCurrentPage] = useState(1)
 
 const allMonitorData = useMemo(() => {
 const today = startOfDay(new Date())
 
 return members.map(member => {
 let activeTask: MonitoringTask | null = null
 let blockedTask: MonitoringTask | null = null
 let todaySeconds = 0
 let completedToday = 0
 
 for (const story of stories) {
 for (const task of story.tasks) {
 if (task.assignedTo === member.id) {
 // Hours today
 const logs = task.timeLogs || []
 for (const log of logs) {
 if (isSameDay(new Date(log.startedAt), today)) {
 const start = new Date(log.startedAt).getTime()
 const end = log.endedAt ? new Date(log.endedAt).getTime() : new Date().getTime()
 todaySeconds += (end - start) / 1000
 }
 }
 
 // Current status
 if (task.status === 'in_progress') {
 activeTask = { ...task, storyCode: story.code } as MonitoringTask
 }
 if (task.status === 'blocked') {
 blockedTask = { ...task, storyCode: story.code } as MonitoringTask
 }
 if (task.status === 'completed' && isSameDay(new Date(task.updatedAt), today)) {
 completedToday++
 }
 }
 }
 }
 
 const hours = todaySeconds / 3600
 const loadFactor = Math.min(100, (hours / 8) * 100)
 
 let currentStatus: 'working' | 'blocked' | 'idle' = 'idle'
 if (activeTask !== null) currentStatus = 'working'
 else if (blockedTask !== null) currentStatus = 'blocked'
 
 return {
 member,
 activeTask,
 blockedTask,
 hours: Number(hours.toFixed(1)),
 completedToday,
 loadFactor,
 status: currentStatus
 }
 })
 }, [members, stories])

 const specialties = useMemo(() => {
 const specs = new Set(members.map(m => m.specialty).filter(Boolean))
 return Array.from(specs)
 }, [members])

 const filteredData = useMemo(() => {
 const searchLower = searchTerm.toLowerCase()
 return allMonitorData.filter(item => {
 const nameMatches = item.member.name.toLowerCase().includes(searchLower)
 const activeMatches = item.activeTask?.title.toLowerCase().includes(searchLower) ?? false
 const blockedMatches = item.blockedTask?.title.toLowerCase().includes(searchLower) ?? false
 
 const matchesSearch = nameMatches || activeMatches || blockedMatches
 const matchesStatus = statusFilter === 'all' || item.status === statusFilter
 const matchesSpecialty = specialtyFilter === 'all' || item.member.specialty === specialtyFilter
 
 return matchesSearch && matchesStatus && matchesSpecialty
 })
 }, [allMonitorData, searchTerm, statusFilter, specialtyFilter])

 // Pagination
 const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
 const paginatedData = useMemo(() => {
 const start = (currentPage - 1) * ITEMS_PER_PAGE
 return filteredData.slice(start, start + ITEMS_PER_PAGE)
 }, [filteredData, currentPage])

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 relative">
 <div className="max-w-[1700px] mx-auto space-y-10 pb-20">
 
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Monitoreo en Vivo' }, { label: 'Pulso Operativo' }]} />
 <div className="flex items-center gap-4 pt-4">
 <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 border border-primary/10 shadow-inner">
 <Activity className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-semibold tracking-tight text-foreground">
 Pulso Operativo
 </h1>
 <p className="text-muted-foreground text-sm font-medium mt-1">
 Sincroniza el flujo. Controla el pulso.
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="px-6 py-2.5 bg-primary/5 rounded-xl border border-primary/10 hidden xl:flex items-center gap-3">
 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
 <span className="text-xs font-medium text-primary/60">Pipeline de Ejecución Activo</span>
 </div>
 </div>
 </header>

 {/* Filters */}
 <Card className="border-border/40 bg-card/30 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
 <CardContent className="p-6">
 <div className="flex flex-col lg:flex-row gap-6">
 <div className="flex-1 relative group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar desarrollador o tarea activa..." 
 className="pl-11 h-10 bg-background/50 border-border/40 rounded-lg text-sm font-medium"
 value={searchTerm}
 onChange={(e) => { 
 setSearchTerm(e.target.value)
 setCurrentPage(1)
 }}
 />
 </div>
 
 <div className="flex flex-wrap items-center gap-3">
 <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
 <SelectTrigger className="h-10 rounded-lg bg-background/50 border-border/40 text-sm font-medium w-[150px]">
 <SelectValue placeholder="Estado" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Todos</SelectItem>
 <SelectItem value="working">En Lab</SelectItem>
 <SelectItem value="blocked">Bloqueados</SelectItem>
 <SelectItem value="idle">En Pausa</SelectItem>
 </SelectContent>
 </Select>

 <Select value={specialtyFilter} onValueChange={(v) => { setSpecialtyFilter(v); setCurrentPage(1); }}>
 <SelectTrigger className="h-10 rounded-lg bg-background/50 border-border/40 text-sm font-medium w-[180px]">
 <SelectValue placeholder="Especialidad" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">Especialidades</SelectItem>
 {specialties.map((spec) => (
 <SelectItem key={spec as string} value={spec as string}>{spec as string}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Button 
 variant="ghost" 
 className="rounded-lg font-medium text-sm h-10 px-6 gap-2"
 onClick={() => {
 setSearchTerm('')
 setStatusFilter('all')
 setSpecialtyFilter('all')
 setCurrentPage(1)
 }}
 >
 <Filter className="h-4 w-4 mr-2" />
 Reset
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Members Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {paginatedData.map(({ member, activeTask, blockedTask, hours, completedToday, loadFactor, status }) => (
 <Card 
 key={member.id} 
 onClick={() => { void navigate(`/monitoring/live/${member.id}`) }}
 className={cn(
"group relative overflow-hidden transition-all duration-300 border-border/40 hover:shadow-2xl rounded-xl bg-card/60 backdrop-blur-sm cursor-pointer hover:translate-y-[-4px]",
 status === 'blocked' ?"border-red-500/30 bg-red-500/[0.03]" :"hover:border-primary/30"
 )}
 >
 <CardContent className="p-6 space-y-6">
 {/* Header: Member Info */}
 <div className="flex items-center gap-4">
 <div className="relative">
 <img src={member.avatarUrl} className="h-14 w-14 rounded-xl border-2 border-background shadow-lg object-cover" alt="" />
 <div className={cn(
"absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background shadow-sm",
 status === 'working' ?"bg-emerald-500 animate-pulse" : status === 'blocked' ?"bg-red-500" :"bg-slate-400"
 )} />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-base font-semibold truncate">{member.name}</h3>
 <div className="flex items-center gap-1.5 opacity-60">
 <Badge variant="outline" className="text-xs font-semibold px-1 h-4 border-primary/20 bg-primary/5">
 {member.specialty}
 </Badge>
 </div>
 </div>
 <div className="text-right">
 <span className="text-2xl font-semibold block leading-none tabular-nums text-primary">{hours}h</span>
 <span className="text-xs font-medium text-muted-foreground opacity-60 mt-1">Hoy</span>
 </div>
 </div>

 {/* Status Indicator */}
 <div className="space-y-3">
 <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
 <span>Rendimiento</span>
 <span className={cn(hours > 8 ?"text-orange-500" :"text-primary")}>{Math.round(loadFactor)}%</span>
 </div>
 <Progress value={loadFactor} className="h-2 rounded-full bg-secondary" />
 </div>

 {/* Activity Content */}
 <div className="min-h-[110px] flex flex-col justify-center bg-background/40 rounded-xl p-4 border border-border/10 relative overflow-hidden group-hover:bg-background/60 transition-colors">
 {status === 'working' && activeTask ? (
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
 <span className="text-xs font-medium text-amber-600">Activo</span>
 </div>
 <p className="text-sm font-medium leading-tight line-clamp-2">
 <span className="text-primary font-semibold mr-1">{activeTask.storyCode}:</span>
 {activeTask.title}
 </p>
 </div>
 ) : status === 'blocked' && blockedTask ? (
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <AlertCircle className="h-3.5 w-3.5 text-red-500" />
 <span className="text-xs font-medium text-red-600">Bloqueado</span>
 </div>
 <p className="text-xs font-semibold leading-tight line-clamp-2 italic text-red-900/70">
 {blockedTask.storyCode}: {blockedTask.title}
 </p>
 </div>
 ) : (
 <div className="text-center space-y-2 opacity-30">
 <Coffee className="h-5 w-5 text-muted-foreground mx-auto" />
 <p className="text-xs font-medium text-muted-foreground">Sin actividad detectada</p>
 </div>
 )}
 </div>

 {/* Footer Metrics */}
 <div className="grid grid-cols-2 gap-3 pt-2">
 <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
 <div className="leading-tight">
 <span className="text-xs font-semibold block tabular-nums">{completedToday}</span>
 <span className="text-xs font-medium text-muted-foreground">Éxitos</span>
 </div>
 </div>
 <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
 <Clock className="h-4 w-4 text-blue-500" />
 <div className="leading-tight">
 <span className="text-xs font-semibold block">{member.active ? 'On' : 'Off'}</span>
 <span className="text-xs font-medium text-muted-foreground">Red</span>
 </div>
 </div>
 </div>

 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
 <ArrowRight className="h-4 w-4 text-primary" />
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 pt-10">
 <Button
 variant="outline"
 size="sm"
 onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)) }}
 disabled={currentPage === 1}
 className="rounded-xl font-semibold text-xs h-10 px-6 border-border/40"
 >
 <ChevronLeft className="h-4 w-4 mr-2" />
 Anterior
 </Button>
 
 <div className="flex gap-2">
 {Array.from({ length: totalPages }).map((_, i) => (
 <Button
 key={i}
 variant={currentPage === i + 1 ?"default" :"outline"}
 size="sm"
 onClick={() => { setCurrentPage(i + 1) }}
 className={cn(
"w-10 h-10 p-0 rounded-xl font-semibold text-sm transition-all",
 currentPage === i + 1 ?"bg-primary shadow-xl shadow-primary/20 border-none scale-110" :"bg-card/40 border-border/40"
 )}
 >
 {i + 1}
 </Button>
 ))}
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)) }}
 disabled={currentPage === totalPages}
 className="rounded-xl font-semibold text-xs h-10 px-6 border-border/40"
 >
 Siguiente
 <ChevronRight className="h-4 w-4 ml-2" />
 </Button>
 </div>
 )}
 </div>

 <div className="fixed -bottom-48 -left-48 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 <div className="fixed -top-48 -right-48 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
