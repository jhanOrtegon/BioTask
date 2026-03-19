import { Card } from '@/shared/components/card'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'

interface LoadAnalysisChartProps {
 teamLoadData: { name: string, Horas: number }[]
}

export function LoadAnalysisChart({
 teamLoadData
}: LoadAnalysisChartProps) {
 return (
 <Card className="p-6">
 <div className="flex items-center justify-between mb-6">
 <div className="space-y-0.5">
 <h3 className="text-sm font-bold flex items-center gap-1.5">
 <BarChart3 className="h-4 w-4 text-primary" /> Distribución de Carga
 </h3>
 <p className="text-[11px] text-muted-foreground font-medium">
 Horas totales por miembro del equipo
 </p>
 </div>
 </div>
 
 <div className="h-[260px] w-full">
 {teamLoadData.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart 
 data={teamLoadData} 
 layout="vertical" 
 margin={{ left: 40, right: 20 }}
 >
 <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.4} />
 <XAxis type="number" hide />
 <YAxis 
 dataKey="name" 
 type="category" 
 axisLine={false} 
 tickLine={false} 
 style={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }} 
 width={90}
 />
 <Tooltip 
 cursor={{ fill: 'transparent' }}
 contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
 itemStyle={{ fontWeight: 600 }}
 />
 <Bar dataKey="Horas" radius={[0, 6, 6, 0]} barSize={16} fill="hsl(217, 78%, 56%)" />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex items-center justify-center h-full text-muted-foreground/40 font-medium border border-dashed border-border/40 rounded-lg">
 Esperando datos del equipo...
 </div>
 )}
 </div>
 </Card>
 )
}
