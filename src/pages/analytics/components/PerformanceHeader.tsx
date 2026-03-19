import { Trophy } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

export function PerformanceHeader() {
 return (
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-0 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Analítica', href: '/analytics' }, { label: 'Rendimiento Lab' }]} />
 <div className="flex items-center gap-3 pt-2">
 <div className="grid place-items-center h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
 <Trophy className="h-6 w-6 text-amber-500" />
 </div>
 <h1 className="text-3xl font-semibold tracking-tight text-foreground lining-nums">
 Rendimiento Lab
 </h1>
 </div>
 <p className="text-sm font-medium text-muted-foreground pt-1 max-w-xl">
 Monitoreo detallado de eficiencia y ritmo por cada desarrollador del core.
 </p>
 </div>
 </header>
 )
}
