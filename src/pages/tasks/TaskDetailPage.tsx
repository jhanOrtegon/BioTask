import { useParams, useNavigate } from 'react-router-dom'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { BioTaskDetail } from '@/features/tasks/components/BioTaskDetail'
import { Button } from '@/shared/components/button'
import { ArrowLeft, Edit3, Share2, MoreVertical, Trash2, Cpu } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { 
 DropdownMenu, 
 DropdownMenuContent, 
 DropdownMenuItem, 
 DropdownMenuTrigger 
} from '@/shared/components/dropdown-menu'

export function TaskDetailPage() {
 const { id } = useParams()
 const navigate = useNavigate()
 const { stories } = useStoriesStore()
 const { getMemberById } = useTeamStore()

 const task = stories.flatMap(s => s.tasks).find(t => t.id === id)

 if (!task) {
 return (
 <div className="min-h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
 <div className="h-24 w-24 rounded-xl bg-secondary/[0.03] border border-border/40 flex items-center justify-center mb-6">
 <Trash2 className="h-10 w-10 text-muted-foreground/20" />
 </div>
 <h2 className="text-2xl font-semibold text-foreground mb-2">Entidad no Encontrada</h2>
 <p className="text-xs text-muted-foreground font-bold opacity-40 mb-8 text-center">El identificador analizado no reside en el núcleo de datos activo</p>
 <Button onClick={() => { void navigate('/tasks'); }} className="h-12 px-8 rounded-xl font-semibold text-xs ">Volver al Listado</Button>
 </div>
 )
 }

 return (
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
 <div className="max-w-7xl mx-auto space-y-10">
 
 {/* Header Section */}
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
 <div className="space-y-1">
 <Breadcrumbs items={[
 { label: 'BioTask', href: '/' },
 { label: 'Repositorio de Tareas', href: '/tasks' },
 { label: task.code || 'Detalle' }
 ]} />
 
 <div className="flex items-center gap-4 pt-2">
 <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
 <Cpu className="h-6 w-6 text-primary" />
 </div>
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-foreground uppercase leading-tight">
 Detalle de <span className="text-primary italic">Tarea</span>
 </h1>
 <p className="text-xs font-semibold text-muted-foreground/40 mt-1">Revisión completa de la arquitectura y ejecución</p>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 <Button 
 variant="outline" 
 size="icon" 
 onClick={() => { void navigate(-1); }}
 className="h-11 w-11 rounded-xl border-border/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all active:scale-95"
 >
 <ArrowLeft className="h-5 w-5" />
 </Button>

 <Button 
 variant="outline" 
 className="h-11 rounded-xl border-border/40 font-semibold text-xs px-5 hover:bg-primary/5 gap-2 hidden md:flex"
 >
 <Share2 className="h-4 w-4 text-primary" />
 Exportar Entity
 </Button>
 
 <Button 
 onClick={() => { void navigate(`/tasks/${task.id}/edit`); }}
 className="h-11 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-semibold text-xs px-6 hover:scale-105 active:scale-95 transition-all"
 >
 <Edit3 className="h-4 w-4 mr-2" />
 Intervenir
 </Button>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl border border-border/40">
 <MoreVertical className="h-5 w-5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-border/40 shadow-2xl">
 <DropdownMenuItem className="rounded-lg font-semibold text-xs py-3 cursor-pointer">
 Duplicar Estructura
 </DropdownMenuItem>
 <DropdownMenuItem className="rounded-lg font-semibold text-xs py-3 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-500/5">
 Archivar Entidad
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>

 {/* Content Section */}
 <section className="pb-20">
 <BioTaskDetail 
 task={task} 
 getMemberById={getMemberById}
 onEdit={() => { void navigate(`/tasks/${task.id}/edit`); }}
 />
 </section>
 </div>

 {/* Background Decor Elements (Consistent with App aesthetic) */}
 <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
 <div className="absolute top-[10%] left-[15%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
 <div className="absolute bottom-[10%] right-[15%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
 </div>
 </div>
 )
}
