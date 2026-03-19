import { Input } from '@/shared/components/input'
import { Button } from '@/shared/components/button'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"
import { Search, Filter, Layers } from 'lucide-react'
import { cn } from '@/shared/utils'
import type { Epic } from '@/features/epics/types'

interface StoriesFilterProps {
 search: string
 onSearchChange: (value: string) => void
 epicFilter: string
 onEpicFilterChange: (value: string) => void
 epics: Epic[]
 showArchived: boolean
 onToggleArchived: () => void
}

export function StoriesFilter({
 search,
 onSearchChange,
 epicFilter,
 onEpicFilterChange,
 epics,
 showArchived,
 onToggleArchived
}: StoriesFilterProps) {
 return (
 <div className="flex flex-col md:flex-row items-center gap-3">
 <div className="relative group flex-1 w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Buscar historias por código o título..." 
 value={search}
 onChange={e => { onSearchChange(e.target.value) }}
 className="w-full h-9 bg-background border-border/40 rounded-lg pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 transition-all"
 />
 </div>
 
 <div className="flex items-center gap-2 w-full md:w-auto">
 <Select value={epicFilter} onValueChange={onEpicFilterChange}>
 <SelectTrigger className="h-9 w-full md:w-[200px] bg-background border-border/40 rounded-lg text-xs font-medium hover:border-primary/30 transition-all">
 <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Filtrar por Épica" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 <SelectItem value="all" className="text-xs">Todas las Épicas</SelectItem>
 {epics.map(e => (
 <SelectItem key={e.id} value={e.id} className="text-xs">{e.code} - {e.title}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Button
 variant="ghost"
 size="sm"
 className={cn(
 "rounded-lg transition-all",
 showArchived ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "text-muted-foreground hover:bg-muted"
 )}
 onClick={onToggleArchived}
 >
 <Filter className="h-3.5 w-3.5 mr-1.5" />
 {showArchived ? 'Ocultar Archivadas' : 'Ver Archivadas'}
 </Button>
 </div>
 </div>
 )
}
