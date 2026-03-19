import { KanbanSquare, Calendar, Filter, Search, Layers } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Input } from '@/shared/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { 
 DropdownMenu, 
 DropdownMenuContent, 
 DropdownMenuTrigger 
} from '@/shared/components/dropdown-menu'
import { ScrollArea } from '@/shared/components/scroll-area'
import { cn } from '@/shared/utils'
import type { Sprint } from '@/features/sprints/types'
import type { Story } from '@/features/stories/types'
import type { TeamMember } from '@/features/team/types'
import type { Epic } from '@/features/epics/types'

interface BoardHeaderProps {
 activeSprint: Sprint | undefined
 sprints: Sprint[]
 sprintStories: Story[]
 epics: Epic[]
 members: TeamMember[]
 selectedSprintId: string
 setSelectedSprintId: (v: string) => void
 selectedEpicId: string
 setSelectedEpicId: (v: string) => void
 selectedStoryId: string
 setSelectedStoryId: (v: string) => void
 selectedMemberIds: string[]
 setSelectedMemberIds: (ids: string[]) => void
 searchQuery: string
 setSearchQuery: (v: string) => void
 tasksCount: number
}

export function BoardHeader({
 activeSprint,
 sprints,
 sprintStories,
 epics,
 members,
 selectedSprintId,
 setSelectedSprintId,
 selectedEpicId,
 setSelectedEpicId,
 selectedStoryId,
 setSelectedStoryId,
 selectedMemberIds,
 setSelectedMemberIds,
 searchQuery,
 setSearchQuery,
 tasksCount
}: BoardHeaderProps) {
 const toggleMember = (id: string) => {
 if (selectedMemberIds.includes(id)) {
 setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id))
 } else {
 setSelectedMemberIds([...selectedMemberIds, id])
 }
 }
 return (
 <header className="shrink-0 space-y-3 pb-1">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Ejecución' }, { label: 'Tablero Ágil' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Tablero <span className="text-primary">Estratégico</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <KanbanSquare className="h-3 w-3 text-primary" />
 </div>
 {activeSprint && (
 <Badge variant="outline" className="bg-primary/5 border-primary/15 text-primary text-xs font-medium px-2 py-0.5">
 {activeSprint.name}
 </Badge>
 )}
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/40">
 <Select value={selectedSprintId || (activeSprint?.id || '')} onValueChange={setSelectedSprintId}>
 <SelectTrigger className="h-8 w-[150px] bg-background border-none shadow-sm rounded-md text-[11px] font-medium">
 <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Sprint" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 {sprints.map(s => (
 <SelectItem key={s.id} value={s.id} className="text-xs">
 {s.status === 'active' && '⭐ '}{s.name}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
 <SelectTrigger className="h-8 w-[130px] bg-background border-none shadow-sm rounded-md text-[11px] font-medium">
 <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Épica" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 <SelectItem value="all" className="text-xs">Todas las épicas</SelectItem>
 {epics.map(e => (
 <SelectItem key={e.id} value={e.id} className="text-xs">{e.code}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
 <SelectTrigger className="h-8 w-[130px] bg-background border-none shadow-sm rounded-md text-[11px] font-medium">
 <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Historia" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 <SelectItem value="all" className="text-xs">Todas las historias</SelectItem>
 {sprintStories.map(s => (
 <SelectItem key={s.id} value={s.id} className="text-xs">{s.code}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-3 animate-in fade-in duration-500">
 <div className="relative group w-full max-w-xl">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar tareas, historias o códigos..." 
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); }}
 className="w-full h-9 bg-background border border-border/40 rounded-lg pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all"
 />
 </div>

 <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 border border-border/40 rounded-lg">
 <span className="text-xs font-medium text-muted-foreground">{tasksCount} tareas visibles</span>
 </div>

 <div className="flex items-center">
 <TooltipProvider delayDuration={100}>
 <div className="flex items-center -space-x-1.5 mr-2">
 {members.slice(0, 10).map(member => (
 <Tooltip key={member.id}>
 <TooltipTrigger asChild>
 <button
 onClick={() => { toggleMember(member.id) }}
 className={cn(
 "h-7 w-7 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden bg-card hover:z-20",
 selectedMemberIds.includes(member.id) 
 ? "border-primary scale-110 z-20 shadow-md ring-2 ring-primary/10" 
 : "border-background dark:border-card hover:border-primary/40 hover:scale-110 z-10"
 )}
 >
 {member.avatarUrl ? (
 <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
 ) : (
 <span className="text-xs font-bold text-primary uppercase">{member.name.charAt(0)}</span>
 )}
 </button>
 </TooltipTrigger>
 <TooltipContent side="bottom" className="text-xs font-medium bg-foreground text-background border-none px-2.5 py-1 rounded-md shadow-lg">
 <div className="flex flex-col">
 <span>{member.name}</span>
 <span className="text-xs opacity-60">{member.specialty}</span>
 </div>
 </TooltipContent>
 </Tooltip>
 ))}

 {members.length > 10 && (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button className="h-7 w-7 rounded-full border-2 border-background dark:border-card bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-all z-0 hover:z-20 text-xs font-bold">
 +{members.length - 10}
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[200px] rounded-lg border-border/40 p-2 space-y-1">
 <div className="px-2 py-1.5 mb-2">
 <p className="text-xs font-semibold text-muted-foreground/60">Otros integrantes</p>
 </div>
 <ScrollArea className="h-[200px]">
 {members.slice(10).map(member => (
 <div 
 key={member.id} 
 onClick={() => { toggleMember(member.id) }}
 className={cn(
 "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-primary/5 transition-all",
 selectedMemberIds.includes(member.id) ? "bg-primary/10" : ""
 )}
 >
 <div className="relative h-7 w-7 rounded-md overflow-hidden border border-border/20 shrink-0">
 {member.avatarUrl ? (
 <img src={member.avatarUrl} className="h-full w-full object-cover" alt="" />
 ) : (
 <div className="h-full w-full bg-secondary flex items-center justify-center text-xs font-bold">{member.name[0]}</div>
 )}
 {selectedMemberIds.includes(member.id) && (
 <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
 <KanbanSquare className="h-3 w-3 text-primary" />
 </div>
 )}
 </div>
 <div className="min-w-0">
 <p className="text-[11px] font-semibold truncate leading-none">{member.name}</p>
 <p className="text-xs font-medium text-muted-foreground/60 truncate mt-0.5">{member.specialty}</p>
 </div>
 </div>
 ))}
 </ScrollArea>
 </DropdownMenuContent>
 </DropdownMenu>
 )}
 </div>

 {selectedMemberIds.length > 0 && (
 <button
 onClick={() => { setSelectedMemberIds([]) }}
 className="h-7 px-2.5 rounded-md text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all ml-1 animate-in fade-in zoom-in"
 >
 Limpiar
 </button>
 )}
 </TooltipProvider>
 </div>
 </div>
 </header>
 )
}
