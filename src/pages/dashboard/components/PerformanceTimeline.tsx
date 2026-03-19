import { Card, CardContent } from '@/shared/components/card'
import { Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import type { PerformanceMetric } from '../types'

interface PerformanceTimelineProps {
 data: PerformanceMetric[]
}

export function PerformanceTimeline({ data }: PerformanceTimelineProps) {
 return (
 <Card className="md:col-span-2">
 <div className="p-5 flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold flex items-center gap-1.5">
 <Activity className="h-4 w-4 text-primary" /> Rendimiento Operativo
 </h3>
 <p className="text-[11px] font-medium text-muted-foreground">Actividad de las últimas 7 jornadas</p>
 </div>
 </div>
 <CardContent>
 <div className="h-[220px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="hsl(217, 78%, 56%)" stopOpacity={0.15}/>
 <stop offset="95%" stopColor="hsl(217, 78%, 56%)" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
 <XAxis 
 dataKey="name" 
 fontSize={10} 
 tickLine={false} 
 axisLine={false} 
 tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
 />
 <YAxis 
 fontSize={10} 
 tickLine={false} 
 axisLine={false} 
 tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
 unit="h"
 />
 <RechartsTooltip 
 contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
 itemStyle={{ fontWeight: 600 }}
 />
 <Area 
 type="monotone" 
 dataKey="hours" 
 stroke="hsl(217, 78%, 56%)" 
 strokeWidth={2}
 fillOpacity={1} 
 fill="url(#colorHours)" 
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 )
}
