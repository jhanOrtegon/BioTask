import { Layers, Download } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

export function LoadHeader() {
 return (
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Analítica', href: '/analytics' }, { label: 'Inversión Técnica' }]} />
 <div className="flex items-center gap-3 pt-2">
 <div className="grid place-items-center h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 shadow-inner">
 <Layers className="h-6 w-6 text-primary" />
 </div>
 <h1 className="text-3xl font-semibold tracking-tight text-foreground lining-nums">
 Technical Load Lab
 </h1>
 </div>
 <p className="text-sm font-medium text-muted-foreground pt-1 max-w-xl">
 Mapeo de saturación por desarrollador y distribución de inercia técnica.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button 
 variant="outline" 
 size="lg" 
 className="h-11 px-6 rounded-xl font-bold border-border/50 text-sm font-semibold gap-2 shadow-sm"
 >
 <Download className="h-4 w-4 text-primary" /> Exportar TSV
 </Button>
 </div>
 </header>
 )
}
