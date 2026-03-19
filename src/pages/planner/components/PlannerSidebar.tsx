import { Card, CardContent } from '@/shared/components/card'
import { Target, AlertTriangle, Timer, Activity } from 'lucide-react'
import { Cell, Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import type { Story } from '@/features/stories/types'

interface PlannerSidebarProps {
 stats: {
 progress: number
 totalHours: number
 spentHours: number
 unestimatedTasks: number
 chartData: { name: string; value: number; color: string }[]
 }
 sprintStories: Story[]
}

export function PlannerSidebar({ stats, sprintStories }: PlannerSidebarProps) {
 return (
 <aside className="w-full flex flex-col gap-6">
 <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden shadow-xl shadow-primary/5 rounded-xl">
 <CardContent className="p-5 space-y-6">
 <div className="flex items-center gap-2 mb-2">
 <Activity className="h-4 w-4 text-primary" />
 <h3 className="font-semibold text-xs text-foreground/70">Sprint Pulse</h3>
 </div>

 <div className="space-y-4">
 <div>
 <div className="flex items-center justify-between text-xs font-medium text-muted-foreground/60 mb-2">
 <span>Avance Global</span>
 <span className="text-primary lining-nums">{Math.round(stats.progress).toString()}%</span>
 </div>
 <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-1000 ease-out shadow-sm"
 style={{ width: `${String(stats.progress)}%` }}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 rounded-xl bg-muted/20 border border-border/10">
 <div className="text-xs font-semibold text-muted-foreground/50 mb-0.5">Estimado</div>
 <div className="text-base font-semibold lining-nums">{stats.totalHours}h</div>
 </div>
 <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
 <div className="text-xs font-semibold text-primary/70 mb-0.5">Ejecutado</div>
 <div className="text-base font-semibold lining-nums text-primary">{stats.spentHours}h</div>
 </div>
 </div>
 </div>

 <div className="h-32 w-full mt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={stats.chartData} layout="vertical" margin={{ left: -15, right: 10 }}>
 <XAxis type="number" hide />
 <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 8, fontWeight: 900, fill: 'currentColor', opacity: 0.4 }} />
 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
 {stats.chartData.map((entry) => (
 <Cell key={entry.name} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden rounded-xl">
 <CardContent className="p-5 space-y-4">
 <div className="flex items-center gap-2">
 <Timer className="h-4 w-4 text-orange-500 opacity-70" />
 <h3 className="font-semibold text-xs text-orange-500/80">Monitor de Salud</h3>
 </div>
 
 {stats.unestimatedTasks > 0 ? (
 <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-2">
 <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
 <AlertTriangle className="h-3.5 w-3.5" />
 <span className="text-xs font-medium">Alerta de Estimación</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground/60 leading-relaxed">
 Detectamos <span className="text-orange-600 font-semibold lining-nums">{stats.unestimatedTasks}</span> tareas huérfanas de tiempo. Estimación requerida.
 </p>
 </div>
 ) : (
 <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
 <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
 <Target className="h-3.5 w-3.5 opacity-70" />
 <span className="text-xs font-medium">Sprint Validado</span>
 </div>
 <p className="text-xs font-bold text-muted-foreground/60">
 Mapeo de horas completado de forma óptima.
 </p>
 </div>
 )}
 </CardContent>
 </Card>

 <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden rounded-xl flex-1">
 <CardContent className="p-5">
 <div className="flex items-center gap-2 mb-4">
 <Target className="h-4 w-4 text-primary opacity-60" />
 <h3 className="font-semibold text-xs text-foreground/70">Arquitectura</h3>
 </div>

 <div className="space-y-3 pb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
 {sprintStories.map(story => (
 <div key={story.id} className="group relative">
 <div className="flex items-start gap-3">
 <div className={`mt-1.5 h-2 w-2 rounded-full border border-primary/30 group-hover:border-primary transition-colors flex-shrink-0 ${story.tasks.length > 0 && story.tasks.every(t => t.status === 'completed') ? 'bg-primary' : ''}`} />
 <div className="min-w-0">
 <div className="text-xs font-semibold text-primary/60 mb-0.5 tracking-tighter lining-nums uppercase">{story.code}</div>
 <p className="text-[11px] font-bold leading-tight line-clamp-2 text-foreground/80 group-hover:text-foreground transition-colors">{story.title}</p>
 </div>
 </div>
 </div>
 ))}
 {sprintStories.length === 0 && (
 <p className="text-xs font-bold text-muted-foreground/40 text-center py-8">Vaciado de historias.</p>
 )}
 </div>
 </CardContent>
 </Card>
 </aside>
 )
}
