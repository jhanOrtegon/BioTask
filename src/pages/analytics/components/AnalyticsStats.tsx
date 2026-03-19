import { Card } from '@/shared/components/card'
import { Target, Timer, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/utils'

interface AnalyticsStatsProps {
 stats: {
 total: number
 completed: number
 blocked: number
 completionRate: number
 totalHours: number
 estimatedHours: number
 accuracy: number
 }
}

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
 const statConfig = [
 { 
 label: 'Eficiencia Global', 
 value: `${String(stats.completionRate)}%`, 
 icon: Target, 
 color: 'text-primary', 
 bg: 'bg-primary/5', 
 trend: 'Tendencia Normal' 
 },
 { 
 label: 'Carga Realizada', 
 value: `${String(stats.totalHours)}h`, 
 icon: Timer, 
 color: 'text-amber-500', 
 bg: 'bg-amber-500/5', 
 trend: `Est. ${String(stats.estimatedHours)}h` 
 },
 { 
 label: 'Flujo Activo', 
 value: String(stats.total - stats.completed), 
 icon: Activity, 
 color: 'text-blue-500', 
 bg: 'bg-blue-500/5', 
 trend: `${String(stats.blocked)} Críticos` 
 },
 { 
 label: 'Precisión', 
 value: `${String(stats.accuracy)}%`, 
 icon: TrendingUp, 
 color: 'text-emerald-500', 
 bg: 'bg-emerald-500/5', 
 trend: 'Óptimo' 
 },
 ]

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {statConfig.map((stat, i) => (
 <Card key={i} className="relative group bg-card border border-border/40 p-5 rounded-xl overflow-hidden transition-all hover:border-primary/20 shadow-sm">
 <div className="relative z-10 flex justify-between items-start">
 <div className="space-y-1.5">
 <p className="text-xs font-medium text-muted-foreground/60">{stat.label}</p>
 <p className="text-2xl font-semibold text-foreground lining-nums">{stat.value}</p>
 <div className="flex items-center gap-1.5 pt-1">
 <div className={cn("w-1 h-1 rounded-full animate-pulse", stat.color.replace('text', 'bg'))} />
 <p className="text-xs font-semibold tracking-tighter opacity-40">{stat.trend}</p>
 </div>
 </div>
 <div className={cn("grid place-items-center h-10 w-10 rounded-xl border group-hover:scale-105 transition-transform duration-500", stat.bg, stat.color,"border-current/10")}>
 <stat.icon className="h-5 w-5 opacity-70" />
 </div>
 </div>
 </Card>
 ))}
 </div>
 )
}
