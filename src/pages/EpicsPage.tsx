import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useEpicsStore } from '@/features/epics/store'
import { useStoriesStore } from '@/features/stories/store'
import { Pagination } from '@/shared/ui/pagination'
import { 
  Layers, Rocket, Target, Clock, Plus, 
  MoreVertical, Search, Filter, AlertTriangle, TrendingUp,
  BrainCircuit, ChevronRight, X
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { toast } from 'sonner'
import { cn } from '@/shared/utils'

export function EpicsPage() {
  const { epics, addEpic, updateEpic } = useEpicsStore()
  const { stories } = useStoriesStore()
  const navigate = useNavigate()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const [actionPlanEpicId, setActionPlanEpicId] = useState<string | null>(null)
  
  // Form State
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    color: '#3b82f6',
    status: 'planning' as 'planning' | 'active' | 'completed'
  })

  const epicStats = useMemo(() => {
    return epics.map(epic => {
      const epicStories = stories.filter(s => s.epicId === epic.id)
      const totalTasks = epicStories.reduce((acc, s) => acc + s.tasks.length, 0)
      const completedTasks = epicStories.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0)
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      const totalTimeSpentSeconds = epicStories.reduce((acc, s) => acc + s.tasks.reduce((tAcc, t) => tAcc + (t.timeSpent || 0), 0), 0)
      const formattedTime = totalTimeSpentSeconds > 3600 
        ? `${String(Math.floor(totalTimeSpentSeconds / 3600))}h` 
        : `${String(Math.floor(totalTimeSpentSeconds / 60))}m`
      
      return {
        ...epic,
        storyCount: epicStories.length,
        taskCount: totalTasks,
        completedCount: completedTasks,
        calculatedProgress: progress,
        formattedTime,
        slowestStories: epicStories
          .map(s => ({
            id: s.id,
            title: s.title,
            pendingCount: s.tasks.filter(t => t.status !== 'completed').length
          }))
          .sort((a, b) => b.pendingCount - a.pendingCount)
          .slice(0, 2)
      }
    })
  }, [epics, stories])

  const filteredEpics = useMemo(() => {
    return epicStats.filter(e => 
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [epicStats, search])

  const paginatedEpics = useMemo(() => {
    return filteredEpics.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [filteredEpics, currentPage])

  const totalPages = Math.ceil(filteredEpics.length / ITEMS_PER_PAGE)

  const smartInsights = useMemo(() => {
    const activeEpics = epicStats.filter(e => e.status === 'active')
    if (activeEpics.length === 0) return null

    const criticalEpic = [...activeEpics].sort((a, b) => a.calculatedProgress - b.calculatedProgress)[0]
    
    return {
      id: criticalEpic.id,
      title: "BioTask Smart Insight",
      message: `La épica "${criticalEpic.title}" requiere atención. Aunque tiene ${String(criticalEpic.storyCount)} historias, el progreso es solo del ${String(criticalEpic.calculatedProgress)}%.`,
      bottleneck: criticalEpic.slowestStories[0]?.title
    }
  }, [epicStats])

  const openCreate = () => {
    setEditingEpic(null)
    setForm({
      code: `EPIC-${String(epics.length + 1).padStart(3, '0')}`,
      title: '',
      description: '',
      color: '#3b82f6',
      status: 'planning'
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast.error('Título y código son obligatorios')
      return
    }

    if (editingEpic) {
      updateEpic(editingEpic, form)
      toast.success('Épica actualizada')
    } else {
      addEpic(form)
      toast.success('Nueva Épica creada')
    }
    setIsDialogOpen(false)
  }

  const actionPlanData = useMemo(() => {
    if (!actionPlanEpicId) return null
    const epic = epicStats.find(e => e.id === actionPlanEpicId)
    if (!epic) return null
    return {
      title: epic.title,
      steps: [
        { title: 'Re-balanceo de carga', desc: `Mover recursos de otras épicas para apoyar "${epic.title}".` },
        { title: 'Análisis de Dependencias', desc: 'Identificar si el retraso es técnico o por bloqueos externos.' },
        { title: 'Check-in Prioritario', desc: `Reunión de 15 min con los leads de las ${String(epic.storyCount)} historias.` }
      ]
    }
  }, [actionPlanEpicId, epicStats])

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Premium Smart Insight Section */}
        {smartInsights && (
          <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-2xl shadow-primary/5 group animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
            <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[80px] group-hover:bg-blue-500/20 transition-all duration-1000" />
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-primary shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit className="h-10 w-10 text-primary-foreground animate-pulse" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black tracking-tight uppercase">
                    {smartInsights.title}
                  </h3>
                  <Badge className="bg-primary text-primary-foreground border-none text-[9px] uppercase font-black tracking-[0.2em] px-3 py-0.5 rounded-full">Neural Core v2</Badge>
                </div>
                <p className="text-base text-muted-foreground font-semibold max-w-3xl leading-relaxed">
                  {smartInsights.message} 
                  {smartInsights.bottleneck && (
                    <span className="text-foreground block mt-2 p-3 bg-card/50 rounded-2xl border border-border/50">
                      <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-500" />
                      <span className="text-xs uppercase font-black text-amber-500/80 tracking-widest mr-2">Cuello de Botella:</span>
                      <span className="font-bold underline decoration-primary/30 underline-offset-4">{smartInsights.bottleneck}</span>
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button 
                  size="lg" 
                  className="rounded-2xl font-black gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 px-8"
                  onClick={() => { setActionPlanEpicId(smartInsights.id) }}
                >
                  Plan de Acción <ChevronRight className="h-5 w-5" />
                </Button>
                <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest opacity-50">Análisis en tiempo real</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              Épicas
            </h1>
            <p className="text-muted-foreground font-medium pl-1 pl-[3.75rem]">
              Objetivos estratégicos y hitos de alto nivel del producto.
            </p>
          </div>
          <Button 
            onClick={() => { openCreate() }}
            className="rounded-2xl font-black h-12 px-8 shadow-xl shadow-primary/25 gap-2 transition-all active:scale-95 hover:shadow-primary/40"
          >
            <Plus className="h-5 w-5 stroke-[3]" /> Nueva Épica
          </Button>
        </header>

        {/* Filters/Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50" />
            <Input 
              placeholder="Buscar por nombre o código..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-12 h-12 bg-card/50 border-border/50 rounded-2xl focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 rounded-2xl border-border/50 bg-card px-5 gap-2 font-bold text-xs uppercase tracking-widest hover:border-primary/30">
              <Filter className="h-4 w-4" /> Todos los Estados
            </Button>
          </div>
        </div>

        {/* Epics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedEpics.map((epic) => (
            <Card key={epic.id} className="group relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl bg-card/60 backdrop-blur-sm rounded-3xl">
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{ backgroundColor: epic.color }} 
              />
              
              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] font-black text-muted-foreground tracking-widest bg-muted px-2.5 py-1 rounded-full uppercase">
                        {epic.code}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full",
                          epic.status === 'active' ? "border-primary/30 text-primary bg-primary/5" :
                          epic.status === 'completed' ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" :
                          "border-muted text-muted-foreground bg-muted/20"
                        )}
                      >
                        {epic.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors leading-tight pt-1">
                      {epic.title}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setEditingEpic(epic.id)
                      setForm({
                        code: epic.code,
                        title: epic.title,
                        description: epic.description || '',
                        color: epic.color,
                        status: epic.status
                      })
                      setIsDialogOpen(true)
                    }}
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 px-8 pb-8">
                <p className="text-[13px] text-muted-foreground font-medium line-clamp-3 leading-relaxed">
                  {epic.description || 'Sin descripción detallada.'}
                </p>

                <div className="grid grid-cols-3 gap-4 border-y border-border/40 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Rocket className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Historias</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{epic.storyCount}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground/60">
                      <Target className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Tareas</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{epic.taskCount}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-500/60">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Invertido</span>
                    </div>
                    <p className="text-xl font-black text-foreground">{epic.formattedTime}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" /> Salud de la Épica
                    </span>
                    <span className="text-primary font-black text-sm">{epic.calculatedProgress}%</span>
                  </div>
                  <div className="relative h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(var(--primary),0.3)]"
                      style={{ 
                        width: `${String(epic.calculatedProgress)}%`,
                        backgroundColor: epic.color 
                      }}
                    />
                  </div>
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full justify-center h-12 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-2xl transition-all"
                  onClick={() => { void navigate('/stories', { state: { epicId: epic.id } }) }}
                >
                  Analizar Historias
                </Button>
              </CardContent>
            </Card>
          ))}

          {epics.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-border/30 rounded-[3rem] bg-card/30 backdrop-blur-xl">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6">
                <Layers className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Arquitectura Vacía</h3>
              <p className="text-muted-foreground mt-3 max-w-sm mx-auto font-medium leading-relaxed">
                BioTask funciona mejor cuando agrupas tus Historias en Épicas estratégicas.
              </p>
              <Button onClick={() => { openCreate() }} className="mt-8 rounded-2xl font-black h-12 px-10 shadow-xl shadow-primary/20">
                Lanzar Primera Épica
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-8 pb-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Action Plan Dialog */}
      <Dialog open={!!actionPlanEpicId} onOpenChange={(open) => { if (!open) setActionPlanEpicId(null) }}>
        <DialogContent className="max-w-xl border-none bg-popover/95 backdrop-blur-2xl shadow-2xl rounded-[3rem] p-0 overflow-hidden text-foreground">
          <div className="p-10 space-y-8">
             <div className="space-y-4">
               <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                 <BrainCircuit className="h-7 w-7" />
               </div>
               <div>
                  <h2 className="text-3xl font-black tracking-tighter">BioTask Action Plan</h2>
                  <p className="text-muted-foreground font-medium">Resolución inteligente para la épica: <span className="text-foreground font-bold">{actionPlanData?.title}</span></p>
               </div>
             </div>

             <div className="space-y-4">
               {actionPlanData?.steps.map((step, i) => (
                 <div key={i} className="group relative p-6 bg-card border border-border/50 rounded-3xl hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full scale-y-50 group-hover:scale-y-100 transition-transform" />
                    <div className="flex gap-4">
                       <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white text-xs font-black">{i + 1}</span>
                       <div className="space-y-1">
                          <h4 className="font-black text-base uppercase tracking-tight">{step.title}</h4>
                          <p className="text-sm text-muted-foreground font-medium">{step.desc}</p>
                       </div>
                    </div>
                 </div>
               ))}
             </div>

             <div className="flex gap-3 pt-4">
                <Button className="flex-1 h-14 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 bg-primary" onClick={() => { setActionPlanEpicId(null); toast.success('Plan de acción notificado a los Team Leads') }}>Aplicar Plan de Acción</Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-sm border-border/50" onClick={() => { setActionPlanEpicId(null) }}>Solo Diagnóstico</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl border-border/50 bg-popover/95 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] p-0 overflow-hidden border-none text-foreground">
          <div className="relative p-10 space-y-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-6 top-6 rounded-full h-10 w-10 hover:bg-muted"
              onClick={() => { setIsDialogOpen(false) }}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                <Layers className="h-6 w-6 stroke-[2.5]" />
              </div>
              <DialogTitle className="text-3xl font-black tracking-tighter">
                {editingEpic ? 'Editar Épica' : 'Construir Nueva Épica'}
              </DialogTitle>
              <DialogDescription className="text-base font-medium text-muted-foreground">
                Define un objetivo de alto nivel para tu flujo de trabajo.
              </DialogDescription>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2.5">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground pl-1">Código</Label>
                  <Input 
                    value={form.code}
                    onChange={(e) => { setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() })) }}
                    className="h-12 bg-secondary/30 border-none rounded-2xl font-mono font-bold focus-visible:ring-primary/30"
                  />
                </div>
                <div className="col-span-2 space-y-2.5">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground pl-1">Estado</Label>
                  <Select 
                    value={form.status}                     onValueChange={(v) => { setForm(prev => ({ ...prev, status: v as 'planning' | 'active' | 'completed' })) }}
                  >
                    <SelectTrigger className="h-12 bg-secondary/30 border-none rounded-2xl font-bold focus:ring-primary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/50 bg-popover font-bold">
                      <SelectItem value="planning">PLANIFICACIÓN</SelectItem>
                      <SelectItem value="active">ACTIVO</SelectItem>
                      <SelectItem value="completed">COMPLETADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground pl-1">Título del Objetivo</Label>
                <Input 
                  placeholder="Ej: Migración Cloud BioSync"
                  value={form.title}
                  onChange={(e) => { setForm(prev => ({ ...prev, title: e.target.value })) }}
                  className="h-14 bg-secondary/30 border-none rounded-2xl text-lg font-bold focus-visible:ring-primary/30"
                />
              </div>

              <div className="space-y-2.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground pl-1">Visión Detallada</Label>
                <Textarea 
                  placeholder="Describe el impacto de esta épica..."
                  value={form.description}
                  onChange={(e) => { setForm(prev => ({ ...prev, description: e.target.value })) }}
                  className="min-h-[120px] bg-secondary/30 border-none rounded-[1.5rem] p-4 text-sm font-medium focus-visible:ring-primary/30 resize-none"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground pl-1">Identificador Visual</Label>
                <div className="flex gap-4">
                  {['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                    <button
                      key={c}
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all hover:scale-110",
                        form.color === c ? "ring-4 ring-primary/20 scale-110 border-2 border-white" : "opacity-60"
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => { setForm(prev => ({ ...prev, color: c })) }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 h-14 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 bg-primary" onClick={() => { handleSave() }}>{editingEpic ? 'Guardar Cambios' : 'Lanzar Épica'}</Button>
                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold text-sm border-border/50" onClick={() => { setIsDialogOpen(false) }}>Cancelar</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
