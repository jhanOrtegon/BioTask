import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useStoriesStore } from '@/features/stories/store'
import { useTeamStore } from '@/features/team/store'
import { Trophy, Crown, Activity, AlertCircle, ThumbsUp, Medal } from 'lucide-react'
import { cn } from '@/shared/utils'
import { startOfDay, isSameDay } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Pagination } from '@/shared/ui/pagination'

export function PerformancePage() {
  const { stories } = useStoriesStore()
  const { members } = useTeamStore()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const devPerformance = useMemo(() => {
    const today = startOfDay(new Date())
    const stats: Record<string, { 
      id: string, 
      name: string, 
      specialty: string, 
      avatar?: string,
      totalHours: number, 
      todayHours: number, 
      completedTasks: number,
      blockedTasks: number,
      activeTasks: number,
      efficiency: number,
      insight: string,
      status: 'success' | 'warning' | 'danger' | 'neutral'
    }> = {}

    members.forEach(m => {
      stats[m.id] = {
        id: m.id,
        name: m.name,
        specialty: m.specialty || 'General',
        avatar: m.avatarUrl,
        totalHours: 0,
        todayHours: 0,
        completedTasks: 0,
        blockedTasks: 0,
        activeTasks: 0,
        efficiency: 0,
        insight: 'Flujo Estable',
        status: 'neutral'
      }
    })

    stories.forEach(story => {
      story.tasks.forEach(task => {
        if (!task.assignedTo) return

        const dev = stats[task.assignedTo]
        
        dev.totalHours += (task.timeSpent || 0) / 3600

        if (task.status === 'completed') dev.completedTasks++
        else if (task.status === 'blocked') dev.blockedTasks++
        else if (task.status !== 'archived') dev.activeTasks++

        task.timeLogs?.forEach(log => {
          const logDate = new Date(log.startedAt)
          if (isSameDay(logDate, today)) {
            const start = logDate.getTime()
            const end = log.endedAt ? new Date(log.endedAt).getTime() : new Date().getTime()
            dev.todayHours += (end - start) / (1000 * 3600)
          }
        })
      })
    })

    const result = Object.values(stats).map(d => {
      const totalAssigned = d.completedTasks + d.activeTasks + d.blockedTasks
      d.efficiency = totalAssigned > 0 ? Math.round((d.completedTasks / totalAssigned) * 100) : 0
      
      if (d.blockedTasks > 1) {
        d.insight = `Bloqueado en ${String(d.blockedTasks)} frentes técnicos.`
        d.status = 'danger'
      } else if (d.todayHours > 5) {
        d.insight = 'Alta tracción. Superando media diaria.'
        d.status = 'success'
      } else if (d.activeTasks > 4) {
        d.insight = 'Sobrecarga de contexto (Multitasking).'
        d.status = 'warning'
      } else if (d.completedTasks > 0 && d.efficiency > 70) {
        d.insight = 'Cierre efectivo de objetivos.'
        d.status = 'success'
      }
      
      return d
    })

    return {
      all: result.sort((a, b) => b.todayHours - a.todayHours),
      top3: [...result].filter(d => d.totalHours > 0).sort((a, b) => b.efficiency - a.efficiency).slice(0, 3)
    }
  }, [members, stories])

  const totalPages = Math.ceil(devPerformance.all.length / ITEMS_PER_PAGE)
  const paginatedPerformance = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return devPerformance.all.slice(start, start + ITEMS_PER_PAGE)
  }, [devPerformance.all, currentPage])

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              Performance Lab
            </h1>
            <p className="text-sm font-bold text-muted-foreground pl-11">
              Monitoreo detallado de eficiencia y ritmo por desarrollador.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Podium */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-black italic flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" /> Bio-Hall of Fame
            </h3>
            {devPerformance.top3.map((dev, idx) => (
              <Card key={dev.id} className={cn(
                "relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02]",
                idx === 0 ? "bg-amber-500/10 border-amber-500/20 shadow-xl shadow-amber-500/5" : "bg-card border-border/40"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={dev.avatar} alt="" className="h-16 w-16 rounded-2xl border-2 border-background shadow-lg" />
                      <div className={cn(
                        "absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-xs font-black border-2 border-background",
                        idx === 0 ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                      )}>{idx + 1}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black truncate">{dev.name}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{dev.specialty}</p>
                    </div>
                    {idx === 0 && <Medal className="h-8 w-8 text-amber-500 animate-pulse" />}
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-background/50 p-3 rounded-xl">
                      <span className="block text-[10px] font-black text-muted-foreground uppercase">Eficiencia</span>
                      <span className="text-xl font-black text-primary">{dev.efficiency}%</span>
                    </div>
                    <div className="bg-background/50 p-3 rounded-xl">
                      <span className="block text-[10px] font-black text-muted-foreground uppercase">Total Invertido</span>
                      <span className="text-xl font-black text-foreground">{dev.totalHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sync Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black italic flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Daily Lab Sync
              </h3>
              <Badge className="bg-primary/20 text-primary animate-pulse border-none">LIVE TRACKING</Badge>
            </div>
            
            <Card className="border-border/50 bg-card rounded-[2rem] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-b border-border/20 hover:bg-muted/30">
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Especialista</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center h-auto">Hoy (h)</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center h-auto">Tareas Activas</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground h-auto">Insight Estratégico</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/10">
                    {paginatedPerformance.map(dev => (
                      <TableRow key={dev.id} className="group hover:bg-muted/5 transition-colors border-border/10">
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <img src={dev.avatar} className="h-10 w-10 rounded-xl border border-border" alt="" />
                            <div>
                              <p className="text-sm font-black">{dev.name}</p>
                              <p className="text-[10px] font-bold text-muted-foreground">{dev.specialty}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-center">
                          <span className={cn(
                            "text-base font-black px-3 py-1 rounded-lg",
                            dev.todayHours > 6 ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                          )}>
                            {dev.todayHours.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-5 text-center">
                          <div className="flex justify-center gap-2 text-[11px] font-black">
                             <span className="text-emerald-500">{dev.completedTasks}✓</span>
                             <span className="text-blue-500">{dev.activeTasks}⚡</span>
                             <span className="text-red-500">{dev.blockedTasks}🚩</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-2">
                             {dev.status === 'danger' ? <AlertCircle className="h-4 w-4 text-red-500" /> : 
                              dev.status === 'success' ? <ThumbsUp className="h-4 w-4 text-emerald-500" /> : 
                              <Activity className="h-4 w-4 text-muted-foreground opacity-30" />}
                             <span className={cn(
                               "text-[11px] font-bold italic",
                               dev.status === 'danger' ? "text-red-500" : 
                               dev.status === 'success' ? "text-emerald-600" : 
                               "text-muted-foreground"
                             )}>
                               {dev.insight}
                             </span>
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

      </div>
    </div>
  )
}
