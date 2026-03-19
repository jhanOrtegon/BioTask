import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
 History, 
 ChevronLeft, 
 Calendar, 
 User, 
 Target, 
 MessageSquare,
 Zap,
 Tag,
 Clock,
 ExternalLink
} from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Separator } from '@/shared/components/separator'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/shared/utils'

export function ActivityDetailPage() {
 const { id } = useParams()
 const navigate = useNavigate()
 const { stories } = useStoriesStore()
 const { members } = useTeamStore()

 const data = useMemo(() => {
 for (const s of stories) {
 const foundLog = s.auditLog.find(l => l.id === id)
 if (foundLog) {
 const foundTask = s.tasks.find(t => t.id === foundLog.targetId)
 return { log: foundLog, story: s, task: foundTask || null }
 }
 }
 return null
 }, [stories, id])

 const log = data?.log || null
 const story = data?.story || null
 const task = data?.task || null

 const performer = useMemo(() => 
 log ? members.find(m => m.id === log.performedBy) : null, 
 [log, members])

 if (!data || !log || !story) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
 <h2 className="text-2xl font-semibold opacity-40">Evento no encontrado</h2>
 <Button onClick={() => { void navigate('/monitoring/activity') }} className="rounded-xl font-semibold text-xs px-8">
 Regresar al Rastreo
 </Button>
 </div>
 )
 }

 const actionColors: Record<string, string> = {
 created: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
 updated: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
 archived: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
 restored: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
 deleted: 'bg-red-500/10 text-red-500 border-red-500/20'
 }

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-700 relative">
 <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
 
 <header className="space-y-6">
 <Breadcrumbs items={[
 { label: 'Monitoreo Reactivo', href: '/monitoring/activity' }, 
 { label: 'Rastreo de Actividad', href: '/monitoring/activity' }, 
 { label: 'Detalle de Operación' }
 ]} />
 
 <div className="flex items-center gap-6 pt-4">
 <Button 
 variant="outline" 
 size="icon" 
 className="h-14 w-14 rounded-xl border-border/40 hover:bg-secondary/50 transition-all shrink-0"
 onClick={() => { void navigate('/monitoring/activity') }}
 >
 <ChevronLeft className="h-6 w-6" />
 </Button>
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
 <History className="h-10 w-10" />
 </div>
 <div>
 <h1 className="text-4xl font-semibold tracking-tight leading-none">Detalle de <span className="text-primary italic">Operación</span></h1>
 <p className="text-xs font-bold text-muted-foreground mt-2 opacity-60">ID Registro: {log.id}</p>
 </div>
 </div>
 </div>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 
 {/* Main Detail Info */}
 <div className="md:col-span-2 space-y-6">
 <Card className="rounded-2xl border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
 <CardContent className="p-10 space-y-8">
 
 <div className="flex items-center justify-between">
 <Badge variant="outline" className={cn("rounded-full px-4 py-1 font-semibold text-xs", actionColors[log.action] || "")}>
 {log.action}
 </Badge>
 <div className="flex items-center gap-2 text-muted-foreground opacity-60">
 <Calendar className="h-4 w-4" />
 <span className="text-xs font-semibold uppercase">{format(new Date(log.timestamp),"PPPP 'a las' HH:mm", { locale: es })}</span>
 </div>
 </div>

 <div className="space-y-4">
 <h2 className="text-3xl font-semibold leading-tight tracking-tight">
 {log.comment || 'Sin comentario descriptivo'}
 </h2>
 <div className="flex items-center gap-4">
 <Badge variant="secondary" className="bg-secondary/50 font-semibold uppercase text-xs tracking-wide rounded-lg px-3">
 {log.targetType === 'story' ? 'User Story' : 'Task'}
 </Badge>
 <span className="h-1.5 w-1.5 rounded-full bg-border" />
 <span className="text-sm font-bold opacity-60 italic">"{log.targetTitle}"</span>
 </div>
 </div>

 <Separator className="bg-border/20" />

 <div className="space-y-6">
 <h3 className="text-xs font-semibold text-primary">Contexto Técnico</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Tag className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">Código</span>
 </div>
 <p className="text-base font-semibold text-foreground">{story.code}</p>
 </div>
 
 {task && (
 <div className="space-y-3">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Zap className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">Tipo de Tarea</span>
 <p className="text-base font-semibold text-foreground uppercase">{task.type}</p>
 </div>
 </div>
 )}

 <div className="space-y-3">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Target className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">Estado Final</span>
 <Badge className="rounded-full font-semibold uppercase text-xs px-3">{task ? task.status : story.status}</Badge>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center gap-2 text-muted-foreground">
 <Clock className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">Última Modificación</span>
 <p className="text-sm font-bold uppercase">{format(new Date(task ? task.updatedAt : story.updatedAt), 'HH:mm:ss', { locale: es })}</p>
 </div>
 </div>
 </div>
 </div>

 <div className="pt-4">
 <Button 
 variant="outline" 
 onClick={() => { void navigate(task ? `/editor/${story.id}/${task.id}` : `/stories/${story.id}`) }}
 className="w-full h-14 rounded-xl font-semibold text-sm group border-primary/20 hover:bg-primary/[0.05]"
 >
 Ver Recurso Vinculado
 <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
 </Button>
 </div>

 </CardContent>
 </Card>
 </div>

 {/* Performer Sidebar */}
 <div className="space-y-8">
 <h3 className="text-xs font-semibold text-muted-foreground/40 pl-4">Realizado por</h3>
 
 <Card className="rounded-xl border-border/40 bg-card/20 backdrop-blur-sm overflow-hidden text-center group">
 <CardContent className="p-10 space-y-6">
 {performer ? (
 <>
 <div className="relative inline-block">
 <img src={performer.avatarUrl} className="h-24 w-24 rounded-2xl border-4 border-background shadow-2xl mx-auto object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
 <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center">
 <User className="h-3 w-3 text-white" />
 </div>
 </div>
 <div>
 <h4 className="text-xl font-semibold tracking-tight">{performer.name}</h4>
 <p className="text-xs font-bold text-muted-foreground opacity-60">{performer.role}</p>
 </div>
 <Separator className="bg-border/10" />
 <div className="space-y-4">
 <p className="text-xs font-semibold text-muted-foreground">Histórico de Actividad</p>
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 rounded-xl bg-background/50 border border-border/40">
 <p className="text-lg font-semibold">{performer.active ? 'Activo' : 'Offline'}</p>
 <p className="text-xs font-bold uppercase opacity-40">Estado</p>
 </div>
 <div className="p-3 rounded-xl bg-background/50 border border-border/40">
 <p className="text-lg font-semibold">{performer.specialty?.charAt(0)}</p>
 <p className="text-xs font-bold uppercase opacity-40">Área</p>
 </div>
 </div>
 <Button 
 variant="ghost" 
 size="sm" 
 className="text-xs font-medium hover:text-primary"
 onClick={() => { void navigate(`/monitoring/member/${performer.id}`) }}
 >
 Ver Perfil de Monitoreo
 </Button>
 </div>
 </>
 ) : (
 <div className="py-10 space-y-4 opacity-30">
 <User className="h-12 w-12 mx-auto" />
 <p className="text-xs font-semibold leading-tight">Agente Desconocido o Externo</p>
 </div>
 )}
 </CardContent>
 </Card>

 <div className="p-6 bg-primary/[0.03] rounded-xl border border-primary/10">
 <div className="flex gap-4">
 <MessageSquare className="h-5 w-5 text-primary shrink-0" />
 <div className="space-y-1">
 <p className="text-xs font-bold text-primary italic tracking-tighter leading-tight">"Esta operación ha sido registrada por el sistema de auditoría biométrica de BioTask."</p>
 </div>
 </div>
 </div>
 </div>

 </div>

 </div>

 <div className="fixed -bottom-48 -left-48 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 <div className="fixed -top-48 -right-48 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
 </div>
 )
}
