import { useNavigate } from 'react-router-dom'
import { 
 HeartPulse, 
 Timer,
 Activity
} from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { cn } from '@/shared/utils'

interface HealthHeaderProps {
 daysRemaining: number
 health: 'good' | 'warning' | 'critical'
}

export function HealthHeader({ daysRemaining, health }: HealthHeaderProps) {
 const navigate = useNavigate()
 return (
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Analítica', href: '/analytics' }, { label: 'Salud de Sprint' }]} />
 <div className="flex items-center gap-3 pt-2">
 <div className="grid place-items-center h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 shadow-inner">
 <HeartPulse className="h-6 w-6 text-red-500" />
 </div>
 <h1 className="text-3xl font-semibold tracking-tight text-foreground lining-nums">
 Delivery-Forecast Lab
 </h1>
 </div>
 <p className="text-sm font-medium text-muted-foreground pt-1 max-w-xl">
 Métricas de salud y rendimiento del sprint basados en telemetría de tareas.
 </p>
 </div>

 <div className="flex items-center gap-4">
 <div className="bg-muted/30 px-6 py-3 rounded-xl border border-border/50 flex items-center gap-6">
 <div className="text-center">
 <span className="block text-xs font-semibold text-muted-foreground leading-none mb-1">Días Restantes</span>
 <div className="flex items-center justify-center gap-1.5 font-semibold text-lg">
 <Timer className="h-4 w-4 text-primary" />
 <span className="lining-nums">{daysRemaining}</span>
 </div>
 </div>
 
 <div className="w-px h-8 bg-border/50" />
 
 <div className="text-center">
 <span className="block text-xs font-semibold text-muted-foreground leading-none mb-1">Estatus Bio</span>
 <Badge className={cn(
"rounded-lg font-semibold text-xs py-1 border-none shadow-sm",
 health === 'good' ?"bg-emerald-500 text-white" : 
 health === 'warning' ?"bg-amber-500 text-white" :"bg-red-500 text-white"
 )}>
 {health === 'good' ? 'Óptimo' : health === 'warning' ? 'Precaución' : 'Crítico'}
 </Badge>
 </div>
 </div>
 
 <Button 
 onClick={() => { void navigate('/planner') }}
 size="lg"
 className="h-11 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-95"
 >
 <Activity className="h-4 w-4 mr-2" /> Optimizar Flujo
 </Button>
 </div>
 </header>
 )
}
