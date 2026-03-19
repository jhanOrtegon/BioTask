import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/card'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { Pagination } from '@/shared/components/pagination'
import { cn } from '@/shared/utils'

interface TeamMemberRendimiento {
 name: string
 completed: number
 active: number
 hours: number
 avatar?: string
}

interface AnalyticsTeamTabProps {
 teamRendimiento: TeamMemberRendimiento[]
 paginatedTeamRendimiento: TeamMemberRendimiento[]
 currentPage: number
 totalPages: number
 setCurrentPage: (v: number) => void
}

export function AnalyticsTeamTab({
 teamRendimiento,
 paginatedTeamRendimiento,
 currentPage,
 totalPages,
 setCurrentPage
}: AnalyticsTeamTabProps) {
 return (
 <Card className="border-border/40 bg-card rounded-xl overflow-hidden shadow-lg">
 <CardHeader className="p-6 border-b border-border/70">
 <CardTitle className="text-lg font-semibold italic">Rendimiento de Equipo</CardTitle>
 <CardDescription className="text-xs font-bold text-muted-foreground/60">Comparativa de carga y efectividad</CardDescription>
 </CardHeader>

 {/* Hall of Fame - Top 3 */}
 <div className="px-6 pb-6 pt-4">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 {teamRendimiento.slice(0, 3).map((dev, idx) => (
 <div key={dev.name} className={cn(
"relative overflow-hidden p-5 rounded-xl border transition-all duration-500 hover:scale-[1.02]",
 idx === 0 ?"bg-amber-500/10 border-amber-500/20 shadow-lg shadow-amber-500/5" : 
 idx === 1 ?"bg-slate-400/5 border-slate-400/10" : 
"bg-orange-700/5 border-orange-700/10"
 )}>
 <div className="flex items-center gap-3 mb-4 relative z-10">
 <div className="relative">
 <img src={dev.avatar} className="h-12 w-12 rounded-xl border border-background shadow-md" alt="" />
 <div className={cn(
"absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-background",
 idx === 0 ?"bg-amber-500 text-white" :"bg-muted text-muted-foreground"
 )}>
 {idx + 1}
 </div>
 </div>
 <div>
 <h4 className="text-sm font-semibold">{dev.name}</h4>
 <p className="text-xs font-medium text-muted-foreground opacity-60">Posición {idx+1}</p>
 </div>
 </div>
 <div className="space-y-3 relative z-10">
 <div className="flex justify-between items-end">
 <span className="text-xs font-semibold text-muted-foreground uppercase opacity-60">Eficiencia</span>
 <span className="text-xs font-semibold text-primary">{Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100)}%</span>
 </div>
 <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
 <div className="h-full bg-primary" style={{ width: `${String((dev.completed / (dev.completed + dev.active || 1)) * 100)}%` }} />
 </div>
 <div className="flex justify-between">
 <div className="text-left">
 <span className="block text-sm font-semibold">{dev.hours.toFixed(1)}h</span>
 <span className="text-xs font-bold text-muted-foreground uppercase opacity-40">Horas</span>
 </div>
 <div className="text-right">
 <span className="block text-sm font-semibold text-emerald-500">{dev.completed}</span>
 <span className="text-xs font-bold text-muted-foreground uppercase opacity-40">Hecho</span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="px-6 pb-6">
 <div className="biotask-table-container">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="biotask-thead">
 <tr>
 <th className="px-8 py-4 text-xs font-medium text-muted-foreground">Especialista</th>
 <th className="px-8 py-4 text-xs font-medium text-muted-foreground text-center">Inversión (h)</th>
 <th className="px-8 py-4 text-xs font-medium text-muted-foreground text-center">Progreso</th>
 <th className="px-8 py-4 text-xs font-medium text-muted-foreground text-right pr-8">Ratio Éxito</th>
 </tr>
 </thead>
 <tbody>
 {paginatedTeamRendimiento.map(dev => (
 <tr key={dev.name} className="biotask-row group">
 <td className="px-8 py-6 flex items-center gap-4">
 <img src={dev.avatar} className="h-10 w-10 rounded-xl border-2 border-primary/20 shadow-lg" alt="" />
 <div>
 <p className="text-sm font-semibold">{dev.name}</p>
 <Badge variant="outline" className="text-xs font-bold mt-1 border-primary/20 text-primary">Desarrollador Core</Badge>
 </div>
 </td>
 <td className="px-8 py-6 text-center">
 <span className="text-lg font-semibold">{dev.hours.toFixed(1)}</span>
 <span className="text-xs text-muted-foreground block font-bold tracking-tighter">Horas Reales</span>
 </td>
 <td className="px-8 py-6 min-w-[200px]">
 <div className="flex items-center gap-3">
 <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-1000" 
 style={{ width: `${String(Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100))}%` }}
 />
 </div>
 <span className="text-xs font-semibold">{Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100)}%</span>
 </div>
 </td>
 <td className="px-8 py-6 text-right pr-8">
 <div className="flex items-center justify-end gap-2">
 <ArrowUpRight className="h-4 w-4 text-emerald-500" />
 <span className="text-sm font-bold">{dev.completed} / {dev.completed + dev.active}</span>
 <span className="text-xs font-semibold text-muted-foreground uppercase opacity-40">Tareas</span>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 <div className="pt-3">
 <Pagination 
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 />
 </div>
 </div>
 </Card>
 )
}
