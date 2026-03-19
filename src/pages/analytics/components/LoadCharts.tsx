import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { 
 BarChart, Bar, XAxis, YAxis, 
 Tooltip as RechartsTooltip, ResponsiveContainer, 
 PieChart, Pie, Cell, CartesianGrid
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface DevLoadData {
 name: string
 Horas: number
}

interface ModuleLoadData {
 name: string
 value: number
}

interface LoadChartsProps {
 devLoadData: DevLoadData[]
 moduleLoadData: ModuleLoadData[]
}

export function LoadCharts({ devLoadData, moduleLoadData }: LoadChartsProps) {
 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Dev Load Bar Chart */}
 <Card className="rounded-xl border-border/40 p-10 shadow-xl overflow-hidden min-h-[450px]">
 <CardHeader className="p-0 mb-10">
 <div className="space-y-1">
 <CardTitle className="text-2xl font-semibold italic">Saturación por Dev</CardTitle>
 <CardDescription className="text-xs font-bold text-primary/60">Horas registradas en el sprint actual</CardDescription>
 </div>
 </CardHeader>
 <div className="h-[300px] w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={devLoadData} layout="vertical" margin={{ left: 20 }}>
 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
 <XAxis type="number" hide />
 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--foreground)', fontSize: 10, fontWeight: 800 }} width={80} />
 <RechartsTooltip cursor={{ fill: 'var(--primary)', opacity: 0.05 }} />
 <Bar dataKey="Horas" fill="var(--primary)" radius={[0, 10, 10, 0]} barSize={20} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>

 {/* Module Distribution Pie Chart */}
 <Card className="rounded-xl border-border/40 p-10 shadow-xl overflow-hidden min-h-[450px]">
 <CardHeader className="p-0 mb-10">
 <div className="space-y-1">
 <CardTitle className="text-2xl font-semibold italic">Distancia por Módulo</CardTitle>
 <CardDescription className="text-xs font-bold text-primary/60">Inversión técnica acumulada</CardDescription>
 </div>
 </CardHeader>
 <div className="h-[300px] w-full relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={moduleLoadData}
 innerRadius={80}
 outerRadius={120}
 paddingAngle={8}
 dataKey="value"
 >
 {moduleLoadData.map((_, index) => (
 // eslint-disable-next-line @typescript-eslint/no-deprecated
 <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <RechartsTooltip />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-3xl font-semibold italic">{moduleLoadData.length}</span>
 <span className="text-xs font-medium opacity-40">Módulos</span>
 </div>
 </div>
 </Card>
 </div>
 )
}
