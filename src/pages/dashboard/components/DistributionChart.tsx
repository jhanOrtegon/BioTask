import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { PieChart as PieChartIcon } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['hsl(217, 78%, 56%)', 'hsl(38, 92%, 50%)', 'hsl(152, 68%, 46%)', 'hsl(265, 60%, 55%)'];

interface DistributionChartProps {
 data: { name: string, value: number }[]
}

export function DistributionChart({ data }: DistributionChartProps) {
 return (
 <Card>
 <CardHeader className="pb-2 flex flex-row items-center justify-between">
 <div>
 <CardTitle className="text-sm font-bold flex items-center gap-1.5">
 <PieChartIcon className="h-4 w-4 text-primary" /> Distribución
 </CardTitle>
 <CardDescription className="text-xs">Tipos de tareas</CardDescription>
 </div>
 </CardHeader>
 <CardContent>
 {data.length > 0 ? (
 <div className="h-[220px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={data}
 cx="50%"
 cy="50%"
 innerRadius={55}
 outerRadius={75}
 paddingAngle={4}
 dataKey="value"
 >
 {data.map((_, index) => (
 // eslint-disable-next-line @typescript-eslint/no-deprecated
 <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <RechartsTooltip
 contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
 itemStyle={{ fontWeight: 600 }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 ) : (
 <div className="h-[220px] flex items-center justify-center text-muted-foreground/40 text-sm font-medium border border-dashed border-border/50 rounded-lg">
 Sin tareas suficientes
 </div>
 )}
 </CardContent>
 </Card>
 )
}
