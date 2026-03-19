import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { BookOpen, Clock, FileDown, Layers3, Edit, History, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import type { Story } from '@/features/stories/types'
import type { TrackedTask } from '@/features/stories/types'

interface StoryHeaderProps {
 story: Story
 isReadOnly: boolean
 activeTasks: TrackedTask[]
 showTimeline: boolean
 onShowTimeline: (show: boolean) => void
 onExport: () => void
 onBulkCreate: () => void
 onEditStory: () => void
 onNewTask: () => void
 formatDate: (iso: string) => string
}

export function StoryHeader({
 story,
 isReadOnly,
 activeTasks,
 showTimeline,
 onShowTimeline,
 onExport,
 onBulkCreate,
 onEditStory,
 onNewTask,
 formatDate
}: StoryHeaderProps) {
 const completedTasksCount = activeTasks.filter(t => t.status === 'completed').length
 const totalTasksCount = activeTasks.length
 const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0
 
 const totalRealHours = Math.round(activeTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600 * 10) / 10
 const totalEstimatedHours = activeTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)

 return (
 <header className="shrink-0 space-y-4 pb-2">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[
 { label: 'Ingeniería' },
 { label: 'Historias', href: '/stories' },
 { label: story.code }
 ]} />
 <div className="flex items-center gap-3 pt-1">
 <h1 className="text-2xl font-bold tracking-tight text-foreground">
 {story.title}
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <BookOpen className="h-3 w-3 text-primary" />
 </div>
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-2">
 <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary font-bold text-xs px-2 rounded-md">
 {story.code}
 </Badge>
 <Badge variant="outline" className="bg-secondary/30 border-border/40 text-muted-foreground font-bold text-xs px-2 rounded-md">
 {story.module}
 </Badge>
 {isReadOnly && (
 <Badge variant="destructive" className="font-bold text-xs px-2 rounded-md">
 Modo Lectura
 </Badge>
 )}
 </div>
 </div>
 
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
 <div className="flex-1 w-full max-w-md space-y-2">
 <div className="flex justify-between items-center text-xs font-bold text-muted-foreground/60 ">
 <span>Progreso de implementación</span>
 <span>{progressPercent}% Completado</span>
 </div>
 <div className="h-1.5 w-full bg-secondary/30 overflow-hidden rounded-full border border-border/40">
 <div
 className="h-full bg-primary transition-all duration-700 ease-out"
 style={{ width: `${String(progressPercent)}%` }}
 />
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-2 shrink-0">
 <Button
 variant="ghost"
 size="sm"
 className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-secondary/50 border border-border/40"
 onClick={onExport}
 >
 <FileDown className="h-3.5 w-3.5 opacity-60" /> Exportar Spec
 </Button>
 
 {!isReadOnly && (
 <>
 <Button
 variant="ghost"
 size="sm"
 className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-secondary/50 border border-border/40"
 onClick={onBulkCreate}
 >
 <Layers3 className="h-3.5 w-3.5 opacity-60" /> Carga Masiva
 </Button>
 
 <Button
 variant="ghost"
 size="sm"
 className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-secondary/50 border border-border/40"
 onClick={onEditStory}
 >
 <Edit className="h-3.5 w-3.5 opacity-60" /> Editar
 </Button>
 </>
 )}
 
 <Button
 variant="ghost"
 size="sm"
 className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-secondary/50 border border-border/40"
 onClick={() => { onShowTimeline(!showTimeline) }}
 >
 <History className="h-3.5 w-3.5 opacity-60" /> {showTimeline ? 'Cerrar' : 'Historial'}
 </Button>
 
 {!isReadOnly && (
 <Button
 className="h-9 px-4 gap-2 font-bold text-xs rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95 ml-2"
 onClick={onNewTask}
 >
 <Plus className="h-4 w-4" /> Nueva Tarea
 </Button>
 )}
 </div>
 </div>
 
 {story.description && (
 <div className="max-w-3xl pt-2">
 <p className="text-[13px] text-muted-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4">
 {story.description}
 </p>
 </div>
 )}
 
 <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground/40 pt-2">
 <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Cuentas: {formatDate(story.createdAt)}</span>
 <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> última mod: {formatDate(story.updatedAt)}</span>
 {totalEstimatedHours > 0 && (
 <span className="flex items-center gap-1.5 text-primary/60 border-l border-border/40 pl-4 uppercase">
 Inversión: {totalRealHours}H de {totalEstimatedHours}H proyectadas
 </span>
 )}
 </div>
 </header>
 )
}
