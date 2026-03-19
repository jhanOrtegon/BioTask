import { Card } from '@/shared/components/card'
import { Zap, AlertCircle } from 'lucide-react'

interface AnalyticsInsightsProps {
 velocityValue: number
 blockedCount: number
 totalCount: number
}

export function AnalyticsInsights({ velocityValue, blockedCount, totalCount }: AnalyticsInsightsProps) {
 const riskPercent = totalCount > 0 ? (blockedCount / totalCount) * 100 : 0

 return (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 <Card className="lg:col-span-2 border-emerald-500/10 bg-emerald-500/[0.02] rounded-xl overflow-hidden shadow-sm hover:border-emerald-500/20 transition-all">
 <div className="p-6 flex items-start gap-5">
 <div className="p-2.5 bg-emerald-500/10 rounded-xl flex-shrink-0">
 <Zap className="h-5 w-5 text-emerald-500" />
 </div>
 <div className="min-w-0">
 <h5 className="text-xs font-semibold text-emerald-600 mb-1.5">Análisis Proactivo Neural</h5>
 <p className="text-xs font-semibold text-foreground/70 leading-relaxed italic">
"Con una velocidad proyectada de <span className="text-emerald-600 font-semibold lining-nums">{velocityValue}</span> unidades/ciclo, la célula mantiene un delta positivo del <span className="font-semibold text-emerald-600">15%</span>. Estabilidad de arquitectura: Óptima."
 </p>
 </div>
 </div>
 </Card>
 
 <Card className="border-rose-500/10 bg-rose-500/[0.02] rounded-xl overflow-hidden shadow-sm hover:border-rose-500/20 transition-all">
 <div className="p-6 flex items-start gap-5">
 <div className="p-2.5 bg-rose-500/10 rounded-xl flex-shrink-0">
 <AlertCircle className="h-5 w-5 text-rose-500" />
 </div>
 <div className="flex-1 min-w-0">
 <h5 className="text-xs font-semibold text-rose-600 mb-2">Vector de Riesgo</h5>
 <div className="space-y-3 pt-1">
 <div className="flex items-center justify-between">
 <span className="text-xs font-semibold text-muted-foreground/60 tracking-tighter">Latencia por Bloqueos</span>
 <span className="text-xs font-semibold text-rose-600 lining-nums">{blockedCount}</span>
 </div>
 <div className="h-1.5 w-full bg-rose-500/5 rounded-full overflow-hidden border border-rose-500/5">
 <div 
 className="h-full bg-rose-500/60 rounded-full transition-all duration-1000" 
 style={{ width: `${String(riskPercent)}%` }} 
 />
 </div>
 </div>
 </div>
 </div>
 </Card>
 </div>
 )
}
