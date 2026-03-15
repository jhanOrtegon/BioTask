import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/shared/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useTeamStore } from '@/features/team/store'
import { Pagination } from '@/shared/ui/pagination'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area, Legend 
} from 'recharts'
import { 
  Target, BarChart3, 
  Layers, Activity, PieChart as PieChartIcon, 
  ArrowUpRight, Zap, Timer, AlertCircle, Users, TrendingUp, Crown
} from 'lucide-react'
import { cn } from '@/shared/utils'

export function AnalyticsPage() {
  const { stories } = useStoriesStore()
  const { sprints } = useSprintsStore()
  const { members, getMemberById } = useTeamStore()
  
  const [selectedSprintId, setSelectedSprintId] = useState<string>(sprints.find(s => s.status === 'active')?.id || 'all')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const filteredTasks = useMemo(() => {
    return stories.flatMap(s => s.tasks.filter(t => {
      const sprintMatch = selectedSprintId === 'all' || t.sprintId === selectedSprintId
      let specialtyMatch = true
      if (selectedSpecialty !== 'all' && t.assignedTo) {
        const member = getMemberById(t.assignedTo)
        specialtyMatch = member?.specialty === selectedSpecialty
      }
      return sprintMatch && specialtyMatch && t.status !== 'archived'
    }))
  }, [stories, selectedSprintId, selectedSpecialty, getMemberById])

  const stats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(t => t.status === 'completed').length
    const blocked = filteredTasks.filter(t => t.status === 'blocked').length
    const totalHours = filteredTasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0) / 3600
    const estimatedHours = filteredTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
    
    return {
      total,
      completed,
      blocked,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalHours: Number(totalHours.toFixed(1)),
      estimatedHours,
      accuracy: estimatedHours > 0 ? Math.round(Math.min(100, (totalHours / estimatedHours) * 100)) : 0
    }
  }, [filteredTasks])

  const teamPerformance = useMemo(() => {
    const data: Record<string, { name: string, completed: number, active: number, hours: number, avatar?: string }> = {}
    
    filteredTasks.forEach(t => {
      if (!t.assignedTo) return
      const member = getMemberById(t.assignedTo)
      if (!member) return
      
      if (!data[t.assignedTo]) {
        data[t.assignedTo] = { 
          name: member.name.split(' ')[0], 
          completed: 0, 
          active: 0, 
          hours: 0,
          avatar: member.avatarUrl
        }
      }
      
      if (t.status === 'completed') data[t.assignedTo].completed++
      else data[t.assignedTo].active++
      
      data[t.assignedTo].hours += (t.timeSpent || 0) / 3600
    })
    
    return Object.values(data).sort((a, b) => b.hours - a.hours)
  }, [filteredTasks, getMemberById])

  const totalPages = Math.ceil(teamPerformance.length / ITEMS_PER_PAGE)
  const paginatedTeamPerformance = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return teamPerformance.slice(start, start + ITEMS_PER_PAGE)
  }, [teamPerformance, currentPage])

  const velocityData = useMemo(() => {
    return sprints
      .filter(s => s.status === 'completed' || s.status === 'active')
      .slice(-4)
      .map(s => {
        const sprintStories = stories.filter(st => s.storyIds.includes(st.id))
        const points = sprintStories.reduce((acc, st) => acc + st.tasks.reduce((tAcc, t) => tAcc + (t.estimatedHours || 1), 0), 0)
        const completedPoints = sprintStories.reduce((acc, st) => 
            acc + st.tasks.filter(t => t.status === 'completed').reduce((tAcc, t) => tAcc + (t.estimatedHours || 1), 0), 0)
        
        return {
          name: s.name.split(':')[0],
          Total: points,
          Completado: completedPoints
        }
      })
  }, [sprints, stories])

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredTasks.forEach(t => {
      counts[t.type] = (counts[t.type] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }))
  }, [filteredTasks])

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card/30 p-6 rounded-[2.5rem] border border-border/40 backdrop-blur-sm">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Centro de Analítica Opsira
            </h1>
            <p className="text-sm font-bold text-muted-foreground pl-11">
              Métricas profundas y evolución del rendimiento técnico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-2xl border border-border/40">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                <SelectTrigger className="w-[180px] border-none bg-transparent h-8 text-xs font-black focus:ring-0">
                  <SelectValue placeholder="Sprint" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todos los Sprints</SelectItem>
                  {sprints.map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs font-bold">{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-2xl border border-border/40">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[180px] border-none bg-transparent h-8 text-xs font-black focus:ring-0">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">Todas las Especialidades</SelectItem>
                  {Array.from(new Set(members.map(m => m.specialty))).filter((spec): spec is string => Boolean(spec)).map(spec => (
                    <SelectItem key={spec} value={spec} className="text-xs font-bold">{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Eficiencia Global', value: `${String(stats.completionRate)}%`, icon: Target, color: 'text-primary', bg: 'bg-primary/10', trend: '+2.4%' },
            { label: 'Inversión Técnica', value: `${String(stats.totalHours)}h`, icon: Timer, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: `vs est. ${String(stats.estimatedHours)}h` },
            { label: 'Tareas Activas', value: String(stats.total - stats.completed), icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: `${String(stats.blocked)} bloqueos` },
            { label: 'Precisión Estimación', value: `${String(stats.accuracy)}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Saludable' },
          ].map((stat, i) => (
            <Card key={i} className="border-border/40 bg-card rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="p-6 relative">
                 <div className={cn("absolute -right-2 -top-2 h-20 w-20 rounded-full opacity-5 blur-2xl", stat.bg)} />
                 <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl", stat.bg)}>
                       <stat.icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/10 text-primary">EN VIVO</Badge>
                 </div>
                 <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</h4>
                 <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black">{stat.value}</span>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center">
                       {stat.trend}
                    </span>
                 </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/30 p-1.5 rounded-2xl border border-border/40 w-fit h-auto flex-wrap">
            <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pulso General</TabsTrigger>
            <TabsTrigger value="team" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analítica de Equipo</TabsTrigger>
            <TabsTrigger value="velocity" className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Velocidad de Sprint</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/40 bg-card rounded-[2.5rem] overflow-hidden shadow-xl">
                 <CardHeader className="p-8 border-b border-border/20">
                    <div className="flex items-center justify-between">
                       <div>
                          <CardTitle className="text-xl font-black">Distribución de Tareas</CardTitle>
                          <CardDescription className="text-xs font-bold font-mono">Segmentación técnica por categoría</CardDescription>
                       </div>
                       <PieChartIcon className="h-6 w-6 text-primary/40" />
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={typeDistribution}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={8}
                             dataKey="value"
                          >
                             {typeDistribution.map((_, index) => (
                                <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                          <RechartsTooltip 
                             contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', fontWeight: 800, fontSize: '12px' }}
                          />
                          <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-black uppercase text-muted-foreground">{value}</span>}/>
                       </PieChart>
                    </ResponsiveContainer>
                 </CardContent>
              </Card>

              <Card className="border-border/40 bg-card rounded-[2.5rem] overflow-hidden shadow-xl">
                 <CardHeader className="p-8 border-b border-border/20">
                    <div className="flex items-center justify-between">
                       <div>
                          <CardTitle className="text-xl font-black">Flujo de Inversión</CardTitle>
                          <CardDescription className="text-xs font-bold font-mono">Horas reales consumidas en el periodo</CardDescription>
                       </div>
                       <Activity className="h-6 w-6 text-emerald-500/40" />
                    </div>
                 </CardHeader>
                 <CardContent className="p-8 h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={velocityData}>
                          <defs>
                             <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} unit="h" />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="Completado" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                       </AreaChart>
                    </ResponsiveContainer>
                 </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
             <Card className="border-border/40 bg-card rounded-[2.5rem] overflow-hidden shadow-xl">
               <CardHeader className="p-8 border-b border-border/20">
                  <CardTitle className="text-2xl font-black italic">Laboratorio de Rendimiento de Equipo</CardTitle>
                  <CardDescription className="text-xs font-bold text-muted-foreground">Comparativa de carga y efectividad por desarrollador</CardDescription>
               </CardHeader>

               {/* Hall of Fame - Top 3 */}
               <div className="px-8 pb-8 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {teamPerformance.slice(0, 3).map((dev, idx) => (
                        <div key={dev.name} className={cn(
                           "relative overflow-hidden p-6 rounded-[2.5rem] border-2 transition-all duration-500 hover:scale-105",
                           idx === 0 ? "bg-amber-500/10 border-amber-500/20 shadow-xl shadow-amber-500/5" : 
                           idx === 1 ? "bg-slate-400/10 border-slate-400/20" : 
                           "bg-orange-700/10 border-orange-700/20"
                        )}>
                           {idx === 0 && <Crown className="absolute -right-2 -top-2 h-16 w-16 text-amber-500/20 -rotate-12" />}
                           <div className="flex items-center gap-4 mb-4 relative z-10">
                              <div className="relative">
                                 <img src={dev.avatar} className="h-16 w-16 rounded-2xl border-2 border-background shadow-xl" alt="" />
                                 <div className={cn(
                                    "absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border-2 border-background",
                                    idx === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                                 )}>
                                    {idx + 1}
                                 </div>
                              </div>
                              <div>
                                 <h4 className="text-lg font-black">{dev.name}</h4>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nivel Pro</p>
                              </div>
                           </div>
                           <div className="space-y-4 relative z-10">
                              <div className="flex justify-between items-end">
                                 <span className="text-[10px] font-black text-muted-foreground uppercase">Eficiencia</span>
                                 <span className="text-sm font-black text-primary">{Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                 <div className="h-full bg-primary" style={{ width: `${String((dev.completed / (dev.completed + dev.active || 1)) * 100)}%` }} />
                               </div>
                               <div className="flex justify-between">
                                  <div className="text-center">
                                     <span className="block text-xs font-black">{dev.hours.toFixed(1)}h</span>
                                     <span className="text-[8px] font-bold text-muted-foreground uppercase">Invertido</span>
                                  </div>
                                  <div className="text-center">
                                     <span className="block text-xs font-black text-emerald-500">{dev.completed}</span>
                                     <span className="text-[8px] font-bold text-muted-foreground uppercase">Completado</span>
                                  </div>
                               </div>
                            </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-muted/10 border-b border-border/20">
                           <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Especialista</th>
                           <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Inversión (h)</th>
                           <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Progreso</th>
                           <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ratio Éxito</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border/10">
                        {paginatedTeamPerformance.map(dev => (
                           <tr key={dev.name} className="hover:bg-muted/5 transition-colors group">
                              <td className="px-8 py-6 flex items-center gap-4">
                                 <img src={dev.avatar} className="h-10 w-10 rounded-full border-2 border-primary/20 shadow-lg" alt="" />
                                 <div>
                                    <p className="text-sm font-black">{dev.name}</p>
                                    <Badge variant="outline" className="text-[8px] font-bold mt-1 border-primary/20 text-primary">Desarrollador Core</Badge>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="text-lg font-black">{dev.hours.toFixed(1)}</span>
                                 <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-tighter">Horas Reales</span>
                              </td>
                              <td className="px-8 py-6 min-w-[200px]">
                                 <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                       <div 
                                          className="h-full bg-primary transition-all duration-1000" 
                                          style={{ width: `${String(Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100))}%` }}
                                       />
                                    </div>
                                    <span className="text-[10px] font-black">{Math.round((dev.completed / (dev.completed + dev.active || 1)) * 100)}%</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-bold">{dev.completed} / {dev.completed + dev.active}</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">Tareas</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-4 border-t border-border/10 bg-muted/5">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
             </Card>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-6">
             <Card className="border-border/40 bg-card rounded-[2.5rem] overflow-hidden shadow-xl">
               <CardHeader className="p-8 border-b border-border/20">
                  <CardTitle className="text-2xl font-black">Velocidad de Opsira</CardTitle>
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
                        <Bar dataKey="Completado" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
             </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card className="lg:col-span-2 border-emerald-500/20 bg-emerald-500/5 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 flex items-start gap-4">
                 <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <Zap className="h-6 w-6 text-emerald-500" />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-1">Opsira-Insight Premium</h5>
                    <p className="text-xs font-medium text-emerald-800/80 leading-relaxed">
                       Basado en la velocidad actual de {velocityData[velocityData.length-1]?.Completado || 0} pts/sprint, el equipo está operando un 15% por encima de la media histórica. Se recomienda mantener este ritmo evitando la sobrecarga de historias en el backlog.
                    </p>
                 </div>
              </div>
           </Card>
           
           <Card className="border-red-500/20 bg-red-500/5 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 flex items-start gap-4">
                 <div className="p-3 bg-red-500/20 rounded-2xl">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                 </div>
                 <div>
                    <h5 className="text-sm font-black text-red-700 uppercase tracking-widest mb-1">Riesgos de Sprint</h5>
                    <div className="space-y-2 mt-2">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-red-800/60 uppercase">Tareas Bloqueadas</span>
                          <span className="text-xs font-black text-red-600">{stats.blocked}</span>
                       </div>
                       <div className="h-1.5 w-full bg-red-500/10 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${String((stats.blocked / (stats.total || 1)) * 100)}%` }} />
                       </div>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}
