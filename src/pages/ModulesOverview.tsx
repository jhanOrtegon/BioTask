import { 
  Shield, 
  Database, 
  Layout, 
  LineChart, 
  Cloud, 
  Bell, 
  Target,
  Activity,
  Sparkles,
  Command,
  HeartPulse,
  BrainCircuit
} from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/utils'
import { useStoriesStore } from '@/features/stories/store'
import { useMemo, useState, useEffect } from 'react'
import { toast } from 'sonner'

const modules = [
  {
    id: 'bio-cloud',
    title: 'Infraestructura Cloud',
    icon: Cloud,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    description: 'Motor central de procesamiento y despliegue de microservicios.',
    status: 'ÓPTIMO',
    readiness: 98,
    features: ['Auto-escalado', 'Latencia Baja', 'Sincronía'],
    objective: 'Disponibilidad del 99.9%.'
  },
  {
    id: 'deep-analytics',
    title: 'Analítica Avanzada',
    icon: LineChart,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    description: 'Análisis predictivo de rendimiento y métricas de entrega.',
    status: 'ACTIVO',
    readiness: 85,
    features: ['Métricas Dev', 'Burndown', 'Heatmap'],
    objective: 'Identificar riesgos en tiempo real.'
  },
  {
    id: 'security-nexus',
    title: 'Seguridad & Accesos',
    icon: Shield,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    description: 'Protocolos de encriptación y control de identidad empresarial.',
    status: 'PROTEGIDO',
    readiness: 100,
    features: ['Auth Robusta', 'Auditoría', 'SSL/TLS'],
    objective: 'Integridad total de los datos.'
  },
  {
    id: 'network-connect',
    title: 'Conectividad Global',
    icon: Activity,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    description: 'Gestión de flujos de datos y comunicación entre nodos.',
    status: 'ESTABLE',
    readiness: 92,
    features: ['API Gateway', 'Websockets', 'Eventos'],
    objective: 'Comunicación fluida sin fricción.'
  },
  {
    id: 'ui-core',
    title: 'Interfaz de Usuario',
    icon: Layout,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    description: 'Experiencia de usuario optimizada para flujos de trabajo rápidos.',
    status: 'SINCRONIZADO',
    readiness: 78,
    features: ['Diseño Responsivo', 'Accesibilidad', 'Foco'],
    objective: 'Maximizar la productividad visual.'
  },
  {
    id: 'persistence-layer',
    title: 'Persistencia de Datos',
    icon: Database,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    description: 'Almacenamiento masivo y gestión de base de datos relacional.',
    status: 'FLUIDO',
    readiness: 88,
    features: ['Indexación', 'Backups', 'Alta Disp.'],
    objective: 'Persistencia segura y escalable.'
  }
]

export function ModulesOverview() {
  const { stories } = useStoriesStore()
  const [activeLogs, setActiveLogs] = useState<{ id: string; text: string; time: string }[]>([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const logPool = [
      "Verificando Seguridad & Accesos...",
      "Sincronizando Infraestructura Cloud",
      "Analizando métricas de rendimiento",
      "Optimizando Interfaz de Usuario",
      "Validando persistencia de datos",
      "Verificando integridad del API Gateway",
      "Balanceando carga de red",
      "Actualizando logs de auditoría",
      "Refrescando caché de sistema"
    ]
    
    const interval = setInterval(() => {
      const newLog = {
        id: crypto.randomUUID(),
        text: logPool[Math.floor(Math.random() * logPool.length)],
        time: format(new Date(), 'HH:mm:ss')
      }
      setActiveLogs(prev => [newLog, ...prev].slice(0, 12))
    }, 4000)

    return () => { clearInterval(interval) }
  }, [])

  const stats = useMemo(() => {
    const totalTasks = stories.reduce((acc, s) => acc + s.tasks.length, 0)
    const completed = stories.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0)
    return {
      totalTasks,
      completed,
      efficiency: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0
    }
  }, [stories])

  const handleStartScan = () => {
    setIsScanning(true)
    toast.info('Iniciando Escaneo de Sistemas...')
    setTimeout(() => {
      setIsScanning(false)
      toast.success('Sistemas en parámetros óptimos.')
    }, 3000)
  }

  const handleRegenerate = () => {
    toast.loading('Optimizando Procesos...', { duration: 1500 })
    setTimeout(() => {
      toast.success('Inercia técnica optimizada.')
    }, 1500)
  }

  return (
    <div className="h-full overflow-hidden flex flex-col bg-[#fcfdfe] dark:bg-slate-950 text-foreground p-6 lg:p-10 relative">
      
      {/* HUD Pattern Background (Subtle) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Modern Header */}
      <header className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                 <Target className="h-7 w-7 text-primary" />
              </div>
              <div>
                 <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">Estado del Sistema</h1>
                 <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black tracking-widest text-primary uppercase">Opsira Management v5.0</p>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monitorización de Infraestructura</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-8 py-4 rounded-[2rem] shadow-sm">
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado de Red</p>
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                 <span className="text-sm font-black text-emerald-600 italic">ESTABLE</span>
              </div>
           </div>
           <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
           <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Eficiencia Operativa</p>
              <span className="text-sm font-black text-slate-900 dark:text-white italic">{stats.efficiency}%</span>
           </div>
           <Button 
              onClick={handleStartScan}
              disabled={isScanning}
              variant="outline"
              className={cn(
                "rounded-xl font-black italic border-primary/20 text-primary hover:bg-primary/5 h-10 px-6 ml-2 transition-all active:scale-95 shadow-sm",
                isScanning && "animate-pulse"
              )}
           >
              <Sparkles className="h-3 w-3 mr-2" />
              {isScanning ? 'MONITORIZANDO...' : 'VERIFICAR SISTEMAS'}
           </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Modules Grid */}
        <div className="lg:col-span-3 overflow-y-auto pr-4 space-y-8 custom-scrollbar pb-20">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((mod) => (
                <Card key={mod.id} className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all duration-500 group rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md cursor-pointer relative">
                   {/* Scanning Line Effect */}
                   {isScanning && (
                     <div className="absolute inset-x-0 h-[2px] bg-primary/50 shadow-[0_0_15px_var(--primary)] z-20 animate-scan pointer-events-none" />
                   )}
                   
                   <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-105 shadow-inner", mod.bg)}>
                            <mod.icon className={cn("h-6 w-6", mod.color)} />
                         </div>
                         <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-3 py-1">
                            {mod.status}
                         </Badge>
                      </div>

                      <div className="space-y-1">
                         <h3 className="text-lg font-black text-slate-900 dark:text-white transition-colors italic tracking-tight">{mod.title}</h3>
                         <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">{mod.description}</p>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Sincronía</span>
                            <span className="text-primary">{mod.readiness}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full transition-all duration-1000 ease-out rounded-full", mod.color.replace('text-', 'bg-'))} 
                              style={{ width: `${String(mod.readiness)}%` }}
                            />
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-1.5">
                         {mod.features.map(f => (
                           <span key={f} className="text-[8px] font-bold bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-100 dark:border-slate-700 font-mono">
                             {f}
                           </span>
                         ))}
                      </div>
                   </CardContent>
                </Card>
              ))}
           </div>
        </div>

        {/* Command Panel */}
        <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
           
           {/* Console */}
           <Card className="bg-slate-900 border-none rounded-[2.5rem] h-[380px] flex flex-col shadow-xl overflow-hidden group">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Command className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Sistema de Logs</span>
                 </div>
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-3 custom-scrollbar">
                 {activeLogs.map((log) => (
                   <div key={log.id} className="flex gap-3 text-slate-400 hover:text-white transition-colors group/line">
                      <span className="text-blue-500/50">[{log.time}]</span>
                      <span className="truncate group-hover/line:translate-x-1 transition-transform">{log.text}</span>
                   </div>
                 ))}
                 <div className="h-4 w-2 bg-blue-500 animate-pulse" />
              </div>
           </Card>

           {/* Actions */}
           <div className="space-y-3">
              <Button 
                onClick={handleRegenerate}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black italic shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-[0.98]"
              >
                 <BrainCircuit className="h-5 w-5 mr-3" /> OPTIMIZAR RENDIMIENTO
              </Button>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center justify-center gap-0.5">
                    <Shield className="h-3.5 w-3.5" /> BLOQUEAR
                 </Button>
                 <Button variant="outline" className="h-12 rounded-xl border-slate-200 bg-white dark:bg-slate-900 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center justify-center gap-0.5">
                    <Bell className="h-3.5 w-3.5" /> ALERTA
                 </Button>
              </div>
           </div>

           {/* Snapshot */}
           <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900/50 border-blue-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm">
              <div className="space-y-5">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                       <HeartPulse className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-base font-black italic text-slate-900 dark:text-white">Pulso Vital</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ratio Éxito</span>
                       <span className="text-2xl font-black italic text-blue-600">{stats.efficiency}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                         style={{ width: `${String(stats.efficiency)}%` }} 
                       />
                    </div>
                 </div>
              </div>
           </Card>

        </div>

      </div>

      {/* Modern Footer */}
      <footer className="h-10 mt-8 flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 select-none border-t border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 uppercase">
               NEXUS MANAGEMENT SYSTEM
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span>PROJECT MEMORY // {new Date().getFullYear()}</span>
         </div>
         <span className="italic">NIVEL_ACCESO: PRIORIDAD_EJECUTIVA</span>
      </footer>

    </div>
  )
}

function format(date: Date, str: string) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return str.replace('HH', h).replace('mm', m).replace('ss', s)
}
