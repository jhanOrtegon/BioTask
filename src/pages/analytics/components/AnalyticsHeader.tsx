import { Layers, Users, BarChart3 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/shared/components/select'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import type { Sprint } from '@/features/sprints/types'
import type { TeamMember } from '@/features/team/types'

interface AnalyticsHeaderProps {
 sprints: Sprint[]
 members: TeamMember[]
 selectedSprintId: string
 setSelectedSprintId: (v: string) => void
 selectedSpecialty: string
 setSelectedSpecialty: (v: string) => void
}

export function AnalyticsHeader({
 sprints,
 members,
 selectedSprintId,
 setSelectedSprintId,
 selectedSpecialty,
 setSelectedSpecialty
}: AnalyticsHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-2">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Reportes' }, { label: 'Centro de Inteligencia' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-semibold tracking-tight text-foreground">
 Analítica de <span className="text-primary">Rendimiento</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <BarChart3 className="h-3 w-3 text-primary" />
 </div>
 </div>
 </div>
 
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/40">
 <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
 <SelectTrigger className="h-8 w-[160px] bg-background border-none shadow-sm rounded-md text-sm font-medium">
 <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Sprint" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 <SelectItem value="all" className="text-xs">Todos los Sprints</SelectItem>
 {sprints.map(s => (
 <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 
 <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
 <SelectTrigger className="h-8 w-[160px] bg-background border-none shadow-sm rounded-md text-sm font-medium">
 <Users className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/40" />
 <SelectValue placeholder="Especialidad" />
 </SelectTrigger>
 <SelectContent className="bg-popover border-border/40 rounded-lg">
 <SelectItem value="all" className="text-xs">Todas las Especialidades</SelectItem>
 {Array.from(new Set(members.map(m => m.specialty))).filter((spec): spec is string => Boolean(spec)).map(spec => (
 <SelectItem key={spec} value={spec} className="text-xs">{spec}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </header>
 )
}
