import { Button } from '@/shared/components/button'
import { Plus, Target } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface SprintsHeaderProps {
 totalCycles: number
 activeCycles: number
 onNewSprint: () => void
}

export function SprintsHeader({ totalCycles, activeCycles, onNewSprint }: SprintsHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-2">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Planificación' }, { label: 'Gestión de Sprints' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Planificación de <span className="text-primary">Sprints</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <Target className="h-3 w-3 text-primary" />
 </div>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-muted/30 border border-border/40 rounded-lg">
 <div className="text-center">
 <span className="block text-xs font-medium text-muted-foreground/50 leading-none mb-0.5">Total</span>
 <span className="text-sm font-bold tabular-nums">{totalCycles}</span>
 </div>
 <div className="w-px h-4 bg-border/30" />
 <div className="text-center">
 <span className="block text-xs font-medium text-muted-foreground/50 leading-none mb-0.5">Activos</span>
 <span className="text-sm font-bold tabular-nums text-primary">{activeCycles}</span>
 </div>
 </div>
 <Button size="sm" onClick={onNewSprint} className="gap-1.5">
 <Plus className="h-3.5 w-3.5" /> Nuevo Sprint
 </Button>
 </div>
 </header>
 )
}
