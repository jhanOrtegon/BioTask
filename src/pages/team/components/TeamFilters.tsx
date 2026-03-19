import { Search, Filter } from 'lucide-react'
import { Input } from '@/shared/components/input'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/shared/components/select"

interface TeamFiltersProps {
 searchTerm: string
 setSearchTerm: (v: string) => void
 groupBy: string
 setGroupBy: (v: string) => void
}

export function TeamFilters({ searchTerm, setSearchTerm, groupBy, setGroupBy }: TeamFiltersProps) {
 return (
 <div className="flex flex-col md:flex-row items-center gap-4">
 <div className="relative group flex-1 w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
 <Input 
 placeholder="Rastrear perfil (nombre, email, stack)..." 
 value={searchTerm}
 onChange={(e) => { setSearchTerm(e.target.value) }}
 className="w-full h-11 bg-background border-border/40 rounded-xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all font-medium"
 />
 </div>
 
 <div className="flex items-center gap-2 w-full md:w-auto">
 <Select value={groupBy} onValueChange={setGroupBy}>
 <SelectTrigger className="h-11 w-full md:w-[220px] bg-background border-border/40 rounded-xl text-xs font-medium hover:border-primary/30 transition-all">
 <div className="flex items-center gap-2">
 <Filter className="h-3.5 w-3.5 text-muted-foreground/40" />
 <SelectValue placeholder="Matriz de Vista" />
 </div>
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-xl">
 <SelectItem value="none" className="text-xs">Estado Normal</SelectItem>
 <SelectItem value="role" className="text-xs">Por Jerarquía</SelectItem>
 <SelectItem value="specialty" className="text-xs">Por Especialidad</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 )
}
