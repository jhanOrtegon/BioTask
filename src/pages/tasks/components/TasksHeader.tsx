import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Badge } from '@/shared/components/badge'
import { CheckSquare, Search, Filter, Layers, Plus } from 'lucide-react'
import { cn } from '@/shared/utils'
import type { Story } from '@/features/stories/types'
import type { Epic } from '@/features/epics/types'

interface TasksHeaderProps {
 search: string
 onSearchChange: (v: string) => void
 epics: Epic[]
 selectedEpicId: string
 onEpicChange: (v: string) => void
 selectedStoryId: string
 onStoryChange: (v: string) => void
 selectedStatus: string
 onStatusChange: (v: string) => void
 activeStories: Story[]
 showArchived: boolean
 onToggleArchived: () => void
 totalItems: number
 onCreateTask: () => void
}

export function TasksHeader({
 search, onSearchChange,
 epics, selectedEpicId, onEpicChange,
 selectedStoryId, onStoryChange,
 selectedStatus, onStatusChange,
 activeStories,
 showArchived, onToggleArchived,
 totalItems, onCreateTask
}: TasksHeaderProps) {
 return (
 <div className="flex flex-col gap-5 shrink-0 pb-2">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Ejecución' }, { label: 'Gestión de Tareas' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Gestión de <span className="text-primary">Tareas</span>
 </h1>
 <Badge variant="outline" className="bg-primary/5 border-primary/15 text-primary font-medium px-2 py-0.5 text-xs h-5">
 {totalItems} registros
 </Badge>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 size="sm"
 className={cn(
 "rounded-lg transition-all",
 showArchived ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "text-muted-foreground hover:bg-muted"
 )}
 onClick={onToggleArchived}
 >
 {showArchived ? 'Ocultar Archivadas' : 'Ver Archivadas'}
 </Button>

 <Button size="sm" onClick={onCreateTask} className="gap-1.5">
 <Plus className="h-3.5 w-3.5" /> Nueva Tarea
 </Button>
 </div>
 </div>

 <div className="flex flex-col md:flex-row items-center gap-3">
 <div className="relative group flex-1 w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar por título, código o contenido..." 
 className="w-full h-9 bg-background border-border/40 rounded-lg pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all"
 value={search}
 onChange={(e) => { onSearchChange(e.target.value); }}
 />
 </div>

 <div className="flex items-center gap-2 w-full md:w-auto">
 <Select value={selectedEpicId} onValueChange={onEpicChange}>
 <SelectTrigger className="h-9 w-full md:w-[130px] bg-background border-border/40 rounded-lg text-xs font-medium hover:border-primary/30 transition-all">
 <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Épica" />
 </SelectTrigger>
 <SelectContent className="rounded-lg border-border/40">
 <SelectItem value="all" className="text-xs">Todas las Épicas</SelectItem>
 {epics.map(e => (
 <SelectItem key={e.id} value={e.id} className="text-xs">{e.code || e.title}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedStoryId} onValueChange={onStoryChange}>
 <SelectTrigger className="h-9 w-full md:w-[130px] bg-background border-border/40 rounded-lg text-xs font-medium hover:border-primary/30 transition-all">
 <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Historia" />
 </SelectTrigger>
 <SelectContent className="rounded-lg border-border/40">
 <SelectItem value="all" className="text-xs">Todas las Historias</SelectItem>
 {activeStories.map(s => (
 <SelectItem key={s.id} value={s.id} className="text-xs">{s.code || s.title}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedStatus} onValueChange={onStatusChange}>
 <SelectTrigger className="h-9 w-full md:w-[130px] bg-background border-border/40 rounded-lg text-xs font-medium hover:border-primary/30 transition-all">
 <CheckSquare className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Estado" />
 </SelectTrigger>
 <SelectContent className="rounded-lg border-border/40">
 <SelectItem value="all" className="text-xs">Todos los Estados</SelectItem>
 <SelectItem value="pending" className="text-xs">Por Hacer</SelectItem>
 <SelectItem value="in_progress" className="text-xs">En Progreso</SelectItem>
 <SelectItem value="qa" className="text-xs">Revisión / QA</SelectItem>
 <SelectItem value="blocked" className="text-xs">Bloqueada</SelectItem>
 <SelectItem value="completed" className="text-xs">Completada</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 )
}
