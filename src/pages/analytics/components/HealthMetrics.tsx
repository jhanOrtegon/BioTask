import { Card, CardContent } from '@/shared/components/card'
import { BrainCircuit, Zap, Activity } from 'lucide-react'
import { cn } from '@/shared/utils'

interface HealthMetricsProps {
 metrics: {
 risk: number
 completion: number
 blocked: number
 }
}

export function HealthMetrics({ metrics }: HealthMetricsProps) {
 return (
 <Card className="md:col-span-2 rounded-xl border-primary/10 overflow-hidden relative shadow-xl">
 <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
 <BrainCircuit className="h-32 w-32 text-primary" />
 </div>
 <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-10">
 <div className="relative h-40 w-40 shrink-0">
 <svg className="h-full w-full -rotate-90">
 <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-secondary/30" />
 <circle 
 cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" 
 strokeDasharray={String(2 * Math.PI * 70)} 
 strokeDashoffset={String(2 * Math.PI * 70 * (1 - metrics.risk / 100))} 
 className={cn(
"transition-all duration-1000",
 metrics.risk > 70 ?"text-red-500" : metrics.risk > 40 ?"text-amber-500" :"text-primary"
 )}
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-3xl font-semibold italic">{Math.round(metrics.risk)}%</span>
 <span className="text-xs font-medium text-muted-foreground/60">Riesgo</span>
 </div>
 </div>
 <div className="space-y-5 flex-1 w-full">
 <div className="space-y-1 text-center md:text-left">
 <h3 className="text-xl font-semibold italic">Análisis de Integridad</h3>
 <p className="text-[13px] font-medium text-muted-foreground leading-relaxed">Incidencia estimada en el Synchrony Puntaje: <span className="text-foreground font-bold">{Math.round(metrics.risk)}%</span>.</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
 <div className="flex items-center gap-2 mb-1">
 <Zap className="h-3 w-3 text-primary" />
 <span className="text-xs font-medium text-muted-foreground/40">Velocidad</span>
 </div>
 <p className="text-lg font-semibold italic">{Math.round(metrics.completion * 1.2)}%</p>
 </div>
 <div className="p-4 rounded-xl bg-secondary/20 border border-white/5">
 <div className="flex items-center gap-2 mb-1">
 <Activity className="h-3 w-3 text-red-500" />
 <span className="text-xs font-medium text-muted-foreground/40">Bloqueos</span>
 </div>
 <p className="text-lg font-semibold italic">{metrics.blocked} Activos</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
