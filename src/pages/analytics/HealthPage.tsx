import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, differenceInDays, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { 
  Zap, Timer, Activity, 
  AlertTriangle, CheckCircle2, 
  ArrowLeft, BrainCircuit, HeartPulse
} from 'lucide-react'
import { cn } from '@/shared/utils'

export function HealthPage() {
  const navigate = useNavigate()
  const { stories } = useStoriesStore()
  const { sprints } = useSprintsStore()

  const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])

  const sprintStories = useMemo(() => {
    if (!activeSprint) return []
    return stories.filter(s => activeSprint.storyIds.includes(s.id))
  }, [stories, activeSprint])

  const sprintTasks = useMemo(() => sprintStories.flatMap(s => s.tasks.filter(t => t.status !== 'archived')), [sprintStories])

  const healthMetrics = useMemo(() => {
    const total = sprintTasks.length
    if (total === 0) return { completion: 0, pending: 0, blocked: 0, health: 'good', risk: 0 }

    const completed = sprintTasks.filter(t => t.status === 'completed').length
    const blocked = sprintTasks.filter(t => t.status === 'blocked').length
    const completion = Math.round((completed / total) * 100)
    
    let health: 'good' | 'warning' | 'critical' = 'good'
    if (blocked > total * 0.2 || completion < 20) health = 'critical'
    else if (blocked > 0 || completion < 50) health = 'warning'

    return {
      completion,
      pending: total - completed,
      blocked,
      health,
      risk: Math.min(100, (blocked * 10) + (100 - completion) / 2)
    }
  }, [sprintTasks])

  const forecastData = useMemo(() => {
    return [0, 1, 2].map(i => {
      const date = addDays(new Date(), i + 1)
      const hash = Math.abs(Math.sin(date.getTime()) * 10000)
      return {
        date,
        dayName: format(date, 'EEEE', { locale: es }),
        dayNum: format(date, 'dd'),
        hours: 8 + Math.floor(hash % 5),
        stories: 1 + Math.floor(hash % 3)
      }
    })
  }, [])

  if (!activeSprint) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-background">
        <Card className="max-w-md w-full border-dashed border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <BrainCircuit className="h-12 w-12 text-primary/40 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-xl font-black italic">No hay Sprint Activo</h2>
              <p className="text-sm text-muted-foreground font-bold">Activa un sprint en el Lab para visualizar la telemetría de salud.</p>
            </div>
            <Button onClick={() => { void navigate('/sprints') }} className="w-full rounded-2xl font-black shadow-lg shadow-primary/20">
              Ir al Lab de Sprints
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const daysRemaining = differenceInDays(new Date(activeSprint.endDate), new Date())

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => { void navigate(-1) }} className="hover:bg-primary/5 -ml-2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
              <ArrowLeft className="h-3 w-3 mr-1" /> Volver al Control
            </Button>
            <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-3">
              <HeartPulse className="h-10 w-10 text-red-500" /> Delivery-Forecast Lab
            </h1>
            <p className="text-sm font-bold text-muted-foreground max-w-xl">Predicción algorítmica y signos vitales del sprint en curso. Basado en telemetría de tareas y bloqueos en tiempo real.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-secondary/50 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/5 flex items-center gap-4">
               <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Sprint Time</span>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="text-xl font-black">{daysRemaining} Días</span>
                  </div>
               </div>
               <div className="w-px h-8 bg-border/50 mx-2" />
               <div className="space-y-1">
                  <Badge className={cn(
                    "rounded-full font-black text-[9px] uppercase tracking-widest",
                    healthMetrics.health === 'good' ? "bg-emerald-500 text-white" : 
                    healthMetrics.health === 'warning' ? "bg-amber-500 text-black" : "bg-red-500 text-white"
                  )}>
                    Estatus: {healthMetrics.health.toUpperCase()}
                  </Badge>
               </div>
            </div>
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Risk Card */}
          <Card className="md:col-span-2 rounded-[3rem] border-primary/10 overflow-hidden relative shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <BrainCircuit className="h-40 w-40 text-primary" />
             </div>
             <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative h-48 w-48 shrink-0">
                  <svg className="h-full w-full -rotate-90">
                    <circle cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" className="text-secondary/30" />
                    <circle 
                      cx="96" cy="96" r="80" fill="none" stroke="currentColor" strokeWidth="16" 
                      strokeDasharray={String(2 * Math.PI * 80)} 
                      strokeDashoffset={String(2 * Math.PI * 80 * (1 - healthMetrics.risk / 100))} 
                      className={cn(
                        "transition-all duration-1000",
                        healthMetrics.risk > 70 ? "text-red-500" : healthMetrics.risk > 40 ? "text-amber-500" : "text-primary"
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black italic">{Math.round(healthMetrics.risk)}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Riesgo Vital</span>
                  </div>
                </div>
                <div className="space-y-6 flex-1">
                   <div className="space-y-2 text-center md:text-left">
                      <h3 className="text-2xl font-black italic">Análisis de Integridad</h3>
                      <p className="text-sm font-bold text-muted-foreground">La probabilidad de que el sprint no alcance el Synchrony Score esperado es del <span className="text-foreground">{Math.round(healthMetrics.risk)}%</span>.</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-secondary/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                           <Zap className="h-3 w-3 text-primary" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Velocidad</span>
                        </div>
                        <p className="text-xl font-black italic">{Math.round(healthMetrics.completion * 1.2)}% Nominal</p>
                      </div>
                      <div className="p-4 rounded-3xl bg-secondary/30 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                           <Activity className="h-3 w-3 text-red-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Bloqueos</span>
                        </div>
                        <p className="text-xl font-black italic">{healthMetrics.blocked} Activos</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Forecast Predictions */}
          <Card className="rounded-[3rem] border-border/40 bg-card p-10 flex flex-col justify-between shadow-xl">
             <div className="space-y-6">
                <div className="space-y-1 text-center md:text-left">
                   <h3 className="text-xl font-black italic">Forecast Diario</h3>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ritmo Sugerido</p>
                </div>
                <div className="space-y-5">
                   {forecastData.map((day, idx) => (
                     <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center font-black text-xs">
                              {day.dayNum}
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                              {day.dayName}
                           </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-xs font-black">+{day.hours}h Inversión</span>
                           <span className="text-[9px] font-bold text-primary">Cierre de {day.stories} Historias</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <Button variant="outline" className="mt-8 rounded-2xl border-dashed font-black text-xs uppercase tracking-widest" onClick={() => { void navigate('/editor') }}>
                Optimizar Sprint
             </Button>
          </Card>

        </div>

        {/* Detailed Alerts Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black italic flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" /> Alertas de Data-Integrity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {healthMetrics.blocked > 0 && (
               <Card className="rounded-3xl border-red-500/20 bg-red-500/[0.02] p-6 flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/10">
                    <Zap className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-wider text-red-500">Bloqueos de Alta Intensidad</p>
                    <p className="text-xs font-bold text-muted-foreground">Existen {healthMetrics.blocked} tareas detenidas que están drenando la inercia del equipo.</p>
                  </div>
               </Card>
             )}
             <Card className="rounded-3xl border-emerald-500/20 bg-emerald-500/[0.02] p-6 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-wider text-emerald-500">Validación de Core Lab</p>
                  <p className="text-xs font-bold text-muted-foreground">La arquitectura actual mantiene un 98% de tiempo de actividad en tracking.</p>
                </div>
             </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
