import { useMemo, useState } from 'react'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
 History, 
 Search, 
 Plus, 
 Edit3, 
 Trash2, 
 RefreshCw,
 Clock,
 User as UserIcon,
 Filter,
 ChevronRight,
 ChevronLeft
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/shared/components/input'
import { Badge } from '@/shared/components/badge'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select'
import { Button } from '@/shared/components/button'
import { cn } from '@/shared/utils'

const ITEMS_PER_PAGE = 12

export function ActivityLogPage() {
 const navigate = useNavigate()
 const location = useLocation()
 const { stories } = useStoriesStore()
 const { getMemberById, members } = useTeamStore()
 const [searchTerm, setSearchTerm] = useState('')
 const [actionFilter, setActionFilter] = useState<string>('all')
 const [typeFilter, setTypeFilter] = useState<string>('all')
 const [userFilter, setUserFilter] = useState<string>((location.state as { userId?: string } | null)?.userId || 'all')
 const [currentPage, setCurrentPage] = useState(1)

 const allLogs = useMemo(() => {
 const logs = stories.flatMap(story => 
 story.auditLog.map(entry => ({
 ...entry,
 storyCode: story.code,
 storyTitle: story.title
 }))
 )
 
 return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
 }, [stories])

 const filteredLogs = useMemo(() => {
 return allLogs.filter(log => {
 const matchesSearch = log.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.targetTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
 log.storyCode.toLowerCase().includes(searchTerm.toLowerCase())
 
 const matchesAction = actionFilter === 'all' || log.action === actionFilter
 const matchesType = typeFilter === 'all' || log.targetType === typeFilter
 const matchesUser = userFilter === 'all' || log.performedBy === userFilter
 
 return matchesSearch && matchesAction && matchesType && matchesUser
 })
 }, [allLogs, searchTerm, actionFilter, typeFilter, userFilter])

 // Pagination logic
 const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
 const paginatedLogs = useMemo(() => {
 const start = (currentPage - 1) * ITEMS_PER_PAGE
 return filteredLogs.slice(start, start + ITEMS_PER_PAGE)
 }, [filteredLogs, currentPage])

 const getActionIcon = (action: string) => {
 switch (action) {
 case 'created': return <Plus className="h-3.5 w-3.5 text-emerald-500" />
 case 'updated': return <Edit3 className="h-3.5 w-3.5 text-blue-500" />
 case 'archived': return <Trash2 className="h-3.5 w-3.5 text-rose-500" />
 case 'restored': return <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
 default: return <History className="h-3.5 w-3.5 text-muted-foreground" />
 }
 }

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 relative">
 <div className="max-w-[1700px] mx-auto space-y-10 pb-20">
 
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Monitoreo Reactivo' }, { label: 'Rastreo de Actividad' }]} />
 <div className="flex items-center gap-4 pt-4">
 <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 border border-primary/10 shadow-inner">
 <History className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h1 className="text-4xl font-semibold tracking-tight text-foreground uppercase">
 Rastreo de <span className="text-primary italic">Actividad</span>
 </h1>
 <p className="text-muted-foreground font-bold text-xs mt-1 opacity-60">
 Historial auditado de movimientos operativos.
 </p>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 border border-border/40 rounded-xl">
 <span className="text-xs font-semibold text-muted-foreground/60">{filteredLogs.length} Movimientos</span>
 </div>
 </div>
 </header>

 {/* Improved Integrated Filters */}
 <div className="flex flex-col lg:flex-row items-center gap-4">
 <div className="relative group flex-1 w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar por comentario, tarea o código..." 
 className="w-full h-11 bg-background border-border/40 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium"
 value={searchTerm}
 onChange={(e) => { 
 setSearchTerm(e.target.value)
 setCurrentPage(1)
 }}
 />
 </div>
 
 <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
 <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1); }}>
 <SelectTrigger className="h-11 w-[140px] bg-background border-border/40 rounded-xl text-xs font-medium hover:border-primary/30 transition-all">
 <SelectValue placeholder="Acción" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-xl text-xs">
 <SelectItem value="all">Todas las Acciones</SelectItem>
 <SelectItem value="created">Creación</SelectItem>
 <SelectItem value="updated">Actualización</SelectItem>
 <SelectItem value="archived">Archivo</SelectItem>
 <SelectItem value="restored">Restauración</SelectItem>
 </SelectContent>
 </Select>

 <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
 <SelectTrigger className="h-11 w-[140px] bg-background border-border/40 rounded-xl text-xs font-medium hover:border-primary/30 transition-all">
 <SelectValue placeholder="Tipo" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-xl text-xs">
 <SelectItem value="all">Todos los Tipos</SelectItem>
 <SelectItem value="task">Tarea</SelectItem>
 <SelectItem value="story">Historia</SelectItem>
 <SelectItem value="sprint">Sprint</SelectItem>
 </SelectContent>
 </Select>

 <Select value={userFilter} onValueChange={(v) => { setUserFilter(v); setCurrentPage(1); }}>
 <SelectTrigger className="h-11 w-[160px] bg-background border-border/40 rounded-xl text-xs font-medium hover:border-primary/30 transition-all">
 <SelectValue placeholder="Usuario" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-xl text-xs">
 <SelectItem value="all">Todos los Usuarios</SelectItem>
 {members.map(m => (
 <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Button 
 variant="ghost" 
 className="h-11 rounded-xl px-5 text-sm font-bold text-muted-foreground hover:bg-secondary/80"
 onClick={() => {
 setSearchTerm('')
 setActionFilter('all')
 setTypeFilter('all')
 setUserFilter('all')
 setCurrentPage(1)
 }}
 >
 <Filter className="h-3 w-3 mr-2 opacity-50" />
 Limpiar
 </Button>
 </div>
 </div>

 {/* Logs List */}
 <div className="space-y-4">
 {paginatedLogs.length > 0 ? (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
 {paginatedLogs.map((log) => {
 const member = log.performedBy ? getMemberById(log.performedBy) : null
 
 return (
 <div key={log.id} className="relative group" onClick={() => { void navigate(`/monitoring/activity/${log.id}`) }}>
 <div className="bg-card/40 border border-border/40 hover:border-primary/20 transition-all rounded-xl shadow-sm overflow-hidden cursor-pointer">
 <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="flex gap-4 items-start flex-1 min-w-0 w-full">
 <div className="h-11 w-11 rounded-xl bg-background border border-border/40 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors overflow-hidden">
 {member ? (
 <img src={member.avatarUrl} className="h-full w-full object-cover" alt="" />
 ) : (
 <UserIcon className="h-5 w-5 text-muted-foreground/30" />
 )}
 </div>
 
 <div className="space-y-1 text-sm flex-1 min-w-0">
 <div className="flex items-center gap-2">
 {getActionIcon(log.action)}
 <span className="font-bold text-xs text-muted-foreground/60">
 {log.action} {log.targetType}
 </span>
 </div>
 
 <p className="font-semibold text-sm leading-snug truncate text-foreground/90">
 <span className="text-primary/70 font-mono text-xs mr-2">[{log.storyCode}]</span>
 {log.comment}
 </p>
 
 <div className="flex items-center gap-3 pt-0.5">
 <span className="text-sm font-bold text-foreground/60 shrink-0 capitalize">
 {member?.name || 'Sistema'}
 </span>
 <span className="text-muted-foreground/20 text-xs shrink-0">—</span>
 <span className="truncate text-xs font-medium text-muted-foreground/50 lowercase">
 {log.targetTitle}
 </span>
 </div>
 </div>
 </div>
 
 <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 sm:border-l border-border/10 sm:pl-6 w-full sm:w-auto justify-between sm:justify-center">
 <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/50 bg-secondary/30 px-2 py-1 rounded-lg">
 <Clock className="h-3 w-3 opacity-60" />
 {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: es })}
 </div>
 <Badge variant="outline" className="text-xs font-bold border-border/40 lowercase tracking-tight px-2 py-0.5 bg-background/50 text-muted-foreground/60">
 {log.targetType}
 </Badge>
 </div>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 ) : (
 <div className="text-center py-24 bg-secondary/10 rounded-xl border-2 border-dashed border-border/40">
 <History className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
 <p className="text-base font-semibold text-muted-foreground opacity-30">No se encontraron movimientos registrados.</p>
 </div>
 )}
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 pt-10">
 <Button
 variant="outline"
 size="sm"
 onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)) }}
 disabled={currentPage === 1}
 className="rounded-xl font-semibold text-xs uppercase"
 >
 <ChevronLeft className="h-4 w-4 mr-1" />
 Anterior
 </Button>
 
 <div className="flex gap-1">
 {Array.from({ length: totalPages }).map((_, i) => (
 <Button
 key={i}
 variant={currentPage === i + 1 ?"default" :"outline"}
 size="sm"
 onClick={() => { setCurrentPage(i + 1) }}
 className={cn(
"w-9 h-9 p-0 rounded-xl font-semibold text-xs",
 currentPage === i + 1 ?"bg-primary shadow-lg shadow-primary/20 border-none" :""
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
 className="rounded-xl font-semibold text-xs uppercase"
 >
 Siguiente
 <ChevronRight className="h-4 w-4 ml-1" />
 </Button>
 </div>
 )}
 </div>

 <div className="fixed -bottom-48 -left-48 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-30" />
 <div className="fixed -top-48 -right-48 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 opacity-30" />
 </div>
 )
}
