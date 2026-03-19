import { Card } from '@/shared/components/card'
import { TrendingUp, Info, Layers } from 'lucide-react'

interface LoadInsightsProps {
 data: {
 totalHours: number
 avgHours: number
 activeModules: number
 sprintDevs: number
 }
}

export function LoadInsights({ data }: LoadInsightsProps) {
 const stats = [
 { label: 'Total Invertido', value: `${data.totalHours.toFixed(0)}h`, icon: TrendingUp },
 { label: 'Esfuerzo Medio', value: `${data.avgHours.toFixed(1)}h`, icon: Info },
 { label: 'Módulos Activos', value: String(data.activeModules), icon: Layers },
 { label: 'Sprint Devs', value: String(data.sprintDevs), icon: TrendingUp }
 ]

 return (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {stats.map((stat, i) => (
 <Card key={i} className="p-4 rounded-[1.5rem] border-primary/5 bg-secondary/20">
 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <p className="text-xs font-semibold text-muted-foreground opacity-60">{stat.label}</p>
 <p className="text-xl font-semibold italic">{stat.value}</p>
 </div>
 <stat.icon className="h-5 w-5 text-primary opacity-20" />
 </div>
 </Card>
 ))}
 </div>
 )
}
