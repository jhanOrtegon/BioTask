import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { useSprintsStore } from '@/features/sprints/store'
import { 
  BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts'
import { 
  ArrowLeft, Layers, 
  Info, TrendingUp, Filter, Download
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Pagination } from '@/shared/ui/pagination'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function LoadPage() {
  const navigate = useNavigate()
  const { stories } = useStoriesStore()
  const { getMemberById } = useTeamStore()
  const { sprints } = useSprintsStore()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])

  const sprintStories = useMemo(() => {
    if (!activeSprint) return []
    return stories.filter(s => activeSprint.storyIds.includes(s.id))
  }, [stories, activeSprint])

  const sprintTasks = useMemo(() => sprintStories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [sprintStories])

  const devLoadData = useMemo(() => {
    const load = new Map<string, { hours: number, tasks: number }>()
    sprintTasks.forEach(t => {
      if (t.assignedTo) {
        const member = getMemberById(t.assignedTo)
        if (member) {
          const stats = load.get(member.name) || { hours: 0, tasks: 0 }
          stats.hours += (t.timeSpent || 0) / 3600
          stats.tasks += 1
          load.set(member.name, stats)
        }
      }
    })
    return Array.from(load.entries())
      .map(([name, stats]) => ({ 
        name, 
        Horas: Number(stats.hours.toFixed(1)),
        Tareas: stats.tasks
      }))
      .sort((a, b) => b.Horas - a.Horas)
  }, [sprintTasks, getMemberById])

  const moduleLoadData = useMemo(() => {
    const load: Record<string, number> = {}
    sprintStories.forEach(s => {
      const hours = s.tasks.reduce((acc, t) => acc + (t.timeSpent || 0) / 3600, 0)
      load[s.module] = (load[s.module] || 0) + hours
    })
    return Object.entries(load)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
      .sort((a, b) => b.value - a.value)
  }, [sprintStories])

  const totalPages = Math.ceil(devLoadData.length / ITEMS_PER_PAGE)
  const paginatedDevLoad = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return devLoadData.slice(start, start + ITEMS_PER_PAGE)
  }, [devLoadData, currentPage])

  if (!activeSprint) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-background">
        <Card className="max-w-md w-full border-dashed border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <Layers className="h-12 w-12 text-primary/40 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-xl font-black italic">No hay Sprint Activo</h2>
              <p className="text-sm text-muted-foreground font-bold">Activa un sprint en el Lab para visualizar el análisis de carga.</p>
            </div>
            <Button onClick={() => { void navigate('/sprints') }} className="w-full rounded-2xl font-black shadow-lg shadow-primary/20">
              Ir al Lab de Sprints
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => { void navigate(-1) }} className="hover:bg-primary/5 -ml-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
              <ArrowLeft className="h-3 w-3 mr-1" /> Volver al Control
            </Button>
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
              <Layers className="h-10 w-10 text-primary" /> Technical Load Lab
            </h1>
            <p className="text-sm font-bold text-muted-foreground max-w-xl">Mapeo de saturación por desarrollador y distribución de inercia por módulo técnico.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase gap-2 border-primary/10">
               <Filter className="h-3 w-3" /> Filtrar Epica
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase gap-2 border-primary/10">
               <Download className="h-3 w-3" /> Exportar TSV
            </Button>
          </div>
        </div>

        {/* Top Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Invertido', value: `${devLoadData.reduce((acc, d) => acc + d.Horas, 0).toFixed(0)}h`, icon: TrendingUp },
             { label: 'Esfuerzo Medio', value: `${(devLoadData.reduce((acc, d) => acc + d.Horas, 0) / (devLoadData.length || 1)).toFixed(1)}h`, icon: Info },
             { label: 'Módulos Activos', value: String(moduleLoadData.length), icon: Layers },
             { label: 'Sprint Devs', value: String(devLoadData.length), icon: TrendingUp }
           ].map((stat, i) => (
             <Card key={i} className="p-4 rounded-[1.5rem] border-primary/5 bg-secondary/20">
                <div className="flex items-center justify-between">
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{stat.label}</p>
                      <p className="text-xl font-black italic">{stat.value}</p>
                   </div>
                   <stat.icon className="h-5 w-5 text-primary opacity-20" />
                </div>
             </Card>
           ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Dev Load Bar Chart */}
           <Card className="rounded-[2.5rem] border-border/40 p-10 shadow-xl overflow-hidden min-h-[450px]">
              <CardHeader className="p-0 mb-10">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black italic">Saturación por Dev</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Horas registradas en el sprint actual</CardDescription>
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
           <Card className="rounded-[2.5rem] border-border/40 p-10 shadow-xl overflow-hidden min-h-[450px]">
              <CardHeader className="p-0 mb-10">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl font-black italic">Distancia por Módulo</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">Inversión técnica acumulada</CardDescription>
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
                             <Cell key={String(index)} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                       <RechartsTooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black italic">{moduleLoadData.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Módulos</span>
                 </div>
              </div>
           </Card>

        </div>

        {/* Detailed Table */}
         <Card className="rounded-[2.5rem] border-border/40 overflow-hidden shadow-xl">
            <div className="p-10 border-b border-border/40 flex items-center justify-between bg-secondary/10">
               <div className="space-y-1">
                  <h3 className="text-xl font-black italic">Audit de Inversión</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Desglose por desarrollador del equipo</p>
               </div>
            </div>
            <div className="overflow-x-auto">
               <Table>
                  <TableHeader>
                     <TableRow className="border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 hover:bg-transparent">
                        <TableHead className="px-10 py-6 h-auto">Desarrollador</TableHead>
                        <TableHead className="px-10 py-6 h-auto">Tareas Activas</TableHead>
                        <TableHead className="px-10 py-6 h-auto">Total Horas</TableHead>
                        <TableHead className="px-10 py-6 h-auto">Carga Relativa</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/20">
                     {paginatedDevLoad.map((dev, i) => (
                       <TableRow key={i} className="group hover:bg-secondary/5 transition-colors border-border/10">
                          <TableCell className="px-10 py-6">
                             <span className="text-sm font-black group-hover:text-primary transition-colors">{dev.name}</span>
                          </TableCell>
                          <TableCell className="px-10 py-6">
                             <span className="text-sm font-bold font-mono">{dev.Tareas}</span>
                          </TableCell>
                          <TableCell className="px-10 py-6">
                             <span className="text-sm font-black italic">{dev.Horas}h</span>
                          </TableCell>
                          <TableCell className="px-10 py-6 min-w-[200px]">
                             <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                   <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min((dev.Horas / 40) * 100, 100).toFixed(0)}%` }} />
                                </div>
                                <span className="text-[10px] font-black opacity-40">{Math.round((dev.Horas / 40) * 100)}%</span>
                             </div>
                          </TableCell>
                       </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>
            <div className="p-4 border-t border-border/10 bg-muted/5">
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
         </Card>

      </div>
    </div>
  )
}
