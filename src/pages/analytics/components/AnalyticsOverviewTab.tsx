import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { Activity, PieChart as PieChartIcon } from 'lucide-react'
import { 
 PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
 AreaChart, Area, XAxis, YAxis
} from 'recharts'

interface AnalyticsOverviewTabProps {
 typeDistribution: { name: string; value: number }[]
 velocityData: { name: string; Total: number; Completed: number }[]
 COLORS: string[]
}

export function AnalyticsOverviewTab({ typeDistribution, velocityData, COLORS }: AnalyticsOverviewTabProps) {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="border-border/40 bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
 <CardHeader className="p-6 border-b border-border/70">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-base font-semibold italic">Distribución de Tareas</CardTitle>
 <CardDescription className="text-xs uppercase font-semibold tracking-wide text-muted-foreground opacity-40">Segmentación por categoría</CardDescription>
 </div>
 <PieChartIcon className="h-5 w-5 text-primary opacity-20" />
 </div>
 </CardHeader>
 <CardContent className="p-6 h-[280px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={typeDistribution}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={80}
 paddingAngle={8}
 dataKey="value"
 >
 {typeDistribution.map((entry, index) => (
 // eslint-disable-next-line @typescript-eslint/no-deprecated
 <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <RechartsTooltip 
 contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '10px' }}
 />
 <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-semibold uppercase text-muted-foreground/60">{value}</span>}/>
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card className="border-border/40 bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm">
 <CardHeader className="p-6 border-b border-border/70">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-base font-semibold italic">Flujo de Inversión</CardTitle>
 <CardDescription className="text-xs uppercase font-semibold tracking-wide text-muted-foreground opacity-40">Horas reales consumidas</CardDescription>
 </div>
 <Activity className="h-5 w-5 text-emerald-500 opacity-20" />
 </div>
 </CardHeader>
 <CardContent className="p-6 h-[280px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={velocityData}>
 <defs>
 <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.4}} />
 <YAxis fontSize={9} axisLine={false} tickLine={false} unit="h" tick={{fill: 'currentColor', opacity: 0.4}} />
 <RechartsTooltip contentStyle={{ borderRadius: '0.75rem', fontSize: '10px', fontWeight: 700 }} />
 <Area type="monotone" dataKey="Completed" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 )
}
