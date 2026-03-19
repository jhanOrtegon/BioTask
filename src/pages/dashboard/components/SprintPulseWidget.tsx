import { Card } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Timer, FolderKanban, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import type { Sprint } from '@/features/sprints/types'
import { useNavigate } from 'react-router-dom'

interface SprintPulseWidgetProps {
 activeSprint: Sprint
 daysLeft: number
 sprintProgress: number
 burndownData: Record<string, unknown>[]
}

export function SprintPulseWidget({
 activeSprint,
 daysLeft,
 sprintProgress,
 burndownData
}: SprintPulseWidgetProps) {
 const navigate = useNavigate()

 return (
 <Card className="overflow-hidden border-primary/15">
 <div className="flex flex-col lg:flex-row h-full">
 {/* Info Panel */}
 <div className="lg:w-1/3 p-6 bg-primary/[0.03] border-r border-border/40">
 <div className="flex items-center gap-2 mb-5">
 <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-medium">
 Vista del Sprint
 </Badge>
 <Badge variant="outline" className="animate-pulse border-emerald-500/30 text-emerald-500 text-xs">EN VIVO</Badge>
 </div>
 
 <h2 className="text-xl font-bold tracking-tight mb-1.5 leading-tight">{activeSprint.name}</h2>
 <div className="flex items-center gap-1.5 text-muted-foreground mb-6">
 <Timer className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">{daysLeft} días restantes</span>
 </div>

 <div className="space-y-5">
 <div>
 <div className="flex justify-between items-end mb-1.5">
 <span className="text-[11px] font-medium text-muted-foreground">Avance de Historias</span>
 <span className="text-sm font-bold text-primary">{sprintProgress}%</span>
 </div>
 <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
 <div className="h-full bg-primary transition-all duration-1000 rounded-full" style={{ width: `${String(sprintProgress)}%` }} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 rounded-lg bg-card border border-border/40">
 <span className="block text-xs font-medium text-muted-foreground mb-0.5">Cierre</span>
 <span className="text-sm font-semibold">{new Date(activeSprint.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
 </div>
 <div className="p-3 rounded-lg bg-card border border-border/40">
 <span className="block text-xs font-medium text-muted-foreground mb-0.5">Meta</span>
 <span className="text-sm font-semibold line-clamp-1">{activeSprint.goal || 'MVP Release'}</span>
 </div>
 </div>
 
 <Button 
 className="w-full gap-2"
 onClick={() => { void navigate('/board') }}
 >
 <FolderKanban className="h-4 w-4" /> Abrir Tablero
 </Button>
 </div>
 </div>

 {/* Chart Panel */}
 <div className="flex-1 p-6 flex flex-col">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="text-sm font-bold flex items-center gap-1.5">
 <TrendingDown className="h-4 w-4 text-primary" /> Gráfico Burndown
 </h3>
 <p className="text-[11px] font-medium text-muted-foreground">Quema de horas vs. línea ideal</p>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1.5">
 <div className="h-1.5 w-3 bg-primary rounded-full" />
 <span className="text-xs font-medium text-muted-foreground">Real</span>
 </div>
 <div className="flex items-center gap-1.5">
 <div className="h-1.5 w-3 bg-muted-foreground/30 rounded-full" />
 <span className="text-xs font-medium text-muted-foreground">Ideal</span>
 </div>
 </div>
 </div>

 <div className="flex-1 min-h-[240px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={burndownData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="hsl(217, 78%, 56%)" stopOpacity={0.1}/>
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
 dy={8}
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
 labelStyle={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}
 />
 <Area 
 type="monotone" 
 dataKey="Real" 
 stroke="hsl(217, 78%, 56%)" 
 strokeWidth={2.5}
 fillOpacity={1} 
 fill="url(#colorReal)" 
 isAnimationActive={true}
 />
 <Area 
 type="monotone" 
 dataKey="Ideal" 
 stroke="hsl(var(--muted-foreground))" 
 strokeWidth={1.5}
 strokeDasharray="6 6" 
 fill="transparent" 
 opacity={0.3}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </Card>
 )
}
