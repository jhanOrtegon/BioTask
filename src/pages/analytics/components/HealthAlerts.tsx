import { Card } from '@/shared/components/card'
import { AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'

interface HealthAlertsProps {
 blocked: number
}

export function HealthAlerts({ blocked }: HealthAlertsProps) {
 return (
 <div className="space-y-4">
 <h3 className="text-xl font-semibold italic flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-amber-500" /> Alertas de Integridad
 </h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {blocked > 0 && (
 <Card className="rounded-xl border-red-500/20 bg-red-500/[0.02] p-5 flex items-start gap-4">
 <div className="p-2.5 rounded-xl bg-red-500/10 shrink-0">
 <Zap className="h-4 w-4 text-red-500" />
 </div>
 <div className="space-y-1">
 <p className="text-[13px] font-semibold text-red-500">Bloqueos Detectados</p>
 <p className="text-sm font-medium text-muted-foreground/70">{blocked} tareas detenidas que afectan la inercia del equipo.</p>
 </div>
 </Card>
 )}
 <Card className="rounded-xl border-emerald-500/20 bg-emerald-500/[0.02] p-5 flex items-start gap-4">
 <div className="p-2.5 rounded-xl bg-emerald-500/10 shrink-0">
 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
 </div>
 <div className="space-y-1">
 <p className="text-[13px] font-semibold text-emerald-500">Validación de Core</p>
 <p className="text-sm font-medium text-muted-foreground/70">La arquitectura mantiene un flujo óptimo de tracking.</p>
 </div>
 </Card>
 </div>
 </div>
 )
}
