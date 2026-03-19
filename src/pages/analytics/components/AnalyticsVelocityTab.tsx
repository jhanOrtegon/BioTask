import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'

interface VelocityDataPoint {
 name: string
 Total: number
 Completed: number
}

interface AnalyticsVelocityTabProps {
 velocityData: VelocityDataPoint[]
}

export function AnalyticsVelocityTab({ velocityData }: AnalyticsVelocityTabProps) {
 return (
 <Card className="border-border/40 bg-card rounded-xl overflow-hidden shadow-xl">
 <CardHeader className="p-8 border-b border-border/70">
 <CardTitle className="text-2xl font-semibold">Velocidad BioTask</CardTitle>
 <CardDescription className="text-xs font-bold text-muted-foreground">Consistencia técnica a través de los sprints</CardDescription>
 </CardHeader>
 <div className="p-8 h-[450px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={velocityData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
 <XAxis dataKey="name" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
 <YAxis fontSize={10} axisLine={false} tickLine={false} />
 <RechartsTooltip cursor={{ fill: 'transparent' }} />
 <Legend verticalAlign="top" align="right" />
 <Bar dataKey="Total" fill="var(--muted)" radius={[6, 6, 0, 0]} barSize={40} />
 <Bar dataKey="Completed" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </Card>
 )
}
