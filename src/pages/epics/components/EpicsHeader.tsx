import { Button } from '@/shared/components/button'
import { Layers, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface EpicsHeaderProps {
 onNewEpic: () => void
}

export function EpicsHeader({ onNewEpic }: EpicsHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 pb-2">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Planificación' }, { label: 'Arquitectura de Épicas' }]} />
 <div className="flex items-center gap-3 pt-1">
 <h1 className="text-2xl font-bold tracking-tight text-foreground">
 Gestión de <span className="text-primary">Épicas</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <Layers className="h-3 w-3 text-primary" />
 </div>
 </div>
 </div>
 <Button 
 onClick={onNewEpic}
 className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-[11px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 gap-2"
 >
 <Plus className="h-4 w-4" /> Crear Épica
 </Button>
 </header>
 )
}
