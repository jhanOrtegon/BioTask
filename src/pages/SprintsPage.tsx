import { useState, useMemo } from 'react'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'
import { useSprintsStore } from '@/features/sprints/store'
import { useStoriesStore } from '@/features/stories/store'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  CheckCircle2, 
  LayoutTemplate, 
  Settings2, 
  Target,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { CommentDialog } from '@/shared/ui/comment-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Sprint, SprintStatus } from '@/features/sprints/types'
import { Pagination } from '@/shared/ui/pagination'

const sprintSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  goal: z.string().optional(),
  startDate: z.string().min(1, 'La fecha de inicio es obligatoria'),
  endDate: z.string().min(1, 'La fecha de fin es obligatoria'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "La fecha de inicio debe ser anterior a la de fin",
  path: ["endDate"],
})

type SprintFormValues = z.infer<typeof sprintSchema>

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function SprintsPage() {
  const { sprints, addSprint, updateSprint, setSprintStories } = useSprintsStore()
  const { stories } = useStoriesStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([])
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showLaunchConfirm, setShowLaunchConfirm] = useState(false)
  const [pendingLaunchStatus, setPendingLaunchStatus] = useState<{ id: string, status: SprintStatus } | null>(null)
  const [showEditAudit, setShowEditAudit] = useState(false)

  const activeStories = useMemo(() => stories.filter(s => s.status !== 'archived'), [stories])
  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  })

  const openCreate = () => {
    setEditingSprint(null)
    form.reset({
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    })
    setSelectedStoryIds([])
    setIsDialogOpen(true)
  }

  const openEdit = (sprint: Sprint) => {
    setEditingSprint(sprint)
    form.reset({
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: new Date(sprint.startDate).toISOString().split('T')[0],
      endDate: new Date(sprint.endDate).toISOString().split('T')[0],
    })
    setSelectedStoryIds(sprint.storyIds)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    // Validar con hook-form antes de mostrar confirmación
    const isValid = await form.trigger()
    if (isValid) {
      setShowSaveConfirm(true)
    }
  }

  const handleCancelSave = () => {
    setShowSaveConfirm(false)
  }

  const totalPages = Math.ceil(sprints.length / ITEMS_PER_PAGE)
  const paginatedSprints = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sprints.slice(start, start + ITEMS_PER_PAGE)
  }, [sprints, currentPage])

  const confirmSave = () => {
    setShowSaveConfirm(false)
    if (editingSprint) {
      setShowEditAudit(true)
    } else {
      executeSave('Creado inicialmente')
    }
  }

  const executeSave = (comment: string) => {
    const values = form.getValues()
    const sprintData = {
      name: values.name.trim(),
      goal: values.goal?.trim() || undefined,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    }

    if (editingSprint) {
      updateSprint(editingSprint.id, sprintData, comment)
      setSprintStories(editingSprint.id, selectedStoryIds)
      toast.success('Sprint actualizado', { description: 'Cambios registrados en auditoría.' })
    } else {
      const newSprint = addSprint(sprintData)
      setSprintStories(newSprint.id, selectedStoryIds)
      toast.success('Sprint planificado con éxito', { description: 'El sprint ha sido añadido a la planificación.' })
    }

    setShowEditAudit(false)
    setIsDialogOpen(false)
  }

  const toggleStorySelection = (id: string) => {
    setSelectedStoryIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }
  const handleStatusChange = (id: string, newStatus: SprintStatus) => {
    if (newStatus === 'active') {
      const activeSprint = sprints.find(s => s.status === 'active' && s.id !== id)
      if (activeSprint) {
        setPendingLaunchStatus({ id, status: newStatus })
        setShowLaunchConfirm(true)
        return
      }
    }

    if (newStatus === 'completed') {
      const sprint = sprints.find(s => s.id === id)
      if (sprint) {
        const sprintStories = activeStories.filter(s => sprint.storyIds.includes(s.id))
        const totalTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status !== 'archived').length, 0)
        const completedTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status === 'completed').length, 0)

        if (totalTasks > 0 && completedTasks < totalTasks) {
          toast.error('Sprint Incompleto', {
            description: `No se puede finalizar el sprint. Hay ${String(totalTasks - completedTasks)} tareas pendientes.`
          })
          return
        }
      }
    }

    updateSprint(id, { status: newStatus })
    toast.success('Estado actualizado', { description: `El sprint ahora está ${newStatus === 'active' ? 'en curso' : newStatus === 'completed' ? 'finalizado' : 'en planificación'}` })

    if (newStatus === 'active') {
      toast.success('Sprint Activado', { description: 'Focus activado. El tablero ahora filtrará estas historias.' })
    }
  }

  const confirmLaunch = () => {
    if (!pendingLaunchStatus) return
    updateSprint(pendingLaunchStatus.id, { status: pendingLaunchStatus.status })
    toast.success('Sprint Activado', { description: 'El sprint anterior ha sido cerrado automáticamente.' })
    setShowLaunchConfirm(false)
    setPendingLaunchStatus(null)
  }

  const getStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case 'planning': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-amber-500/30 text-amber-500 bg-amber-500/10 uppercase py-0.5">Planificación</Badge>
      case 'active': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-blue-500/30 text-blue-500 bg-blue-500/10 uppercase py-0.5 animate-pulse">En Curso</Badge>
      case 'completed': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-emerald-500/30 text-emerald-500 bg-emerald-500/10 uppercase py-0.5">Finalizado</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background animate-in fade-in duration-300">
      <Breadcrumbs items={[{ label: 'Planificación de Sprints' }]} />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lining-nums">
                Sprint Planning
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Gestiona ciclos de alto rendimiento y objetivos estratégicos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-muted/30 border border-border/50 rounded-2xl mr-2">
            <div className="text-center">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total Ciclos</span>
              <span className="text-lg font-black lining-nums">{sprints.length}</span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">En Curso</span>
              <span className="text-lg font-black lining-nums text-primary">{sprints.filter(s => s.status === 'active').length}</span>
            </div>
          </div>
          <Button onClick={openCreate} size="lg" className="h-12 px-6 gap-2 font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5" /> Iniciar Planificación
          </Button>
        </div>
      </header>

      {/* Sprints Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
        {sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/50">
            <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No hay sprints planificados</h3>
            <p className="text-muted-foreground mt-2 font-medium text-center max-w-xs">Comienza por crear tu primer ciclo de trabajo estratégico.</p>
            <Button variant="outline" className="mt-6 rounded-xl font-bold" onClick={() => { setEditingSprint(null); form.reset(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Planificar Ahora
            </Button>
          </div>
        ) : (
          paginatedSprints.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(sprint => {
            const sprintStories = activeStories.filter(s => sprint.storyIds.includes(s.id))
            const totalTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status !== 'archived').length, 0)
            const completedTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status === 'completed').length, 0)
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
            const isActive = sprint.status === 'active'

            return (
              <div key={sprint.id} className={`
                group relative flex flex-col p-7 rounded-[2rem] bg-card border transition-all duration-300
                ${isActive ? 'border-primary/40 shadow-2xl shadow-primary/5 ring-1 ring-primary/20' : 'border-border/60 shadow-lg hover:border-primary/30'}
              `}>
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(sprint.status)}
                      {isActive && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black tracking-tighter">TABLERO FILTRADO</Badge>}
                    </div>
                    <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{sprint.name}</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 border border-border/50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all"
                    onClick={() => { openEdit(sprint) }}
                  >
                    <Settings2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border/30">
                    <Clock className="h-3.5 w-3.5 text-primary/60" />
                    <span className="lining-nums">{formatDate(sprint.startDate)}</span>
                  </div>
                  <ChevronRight className="h-3 w-3 opacity-30" />
                  <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1.5 rounded-lg border border-border/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60" />
                    <span className="lining-nums">{formatDate(sprint.endDate)}</span>
                  </div>
                </div>

                {sprint.goal && (
                  <div className="relative mb-8 bg-muted/20 p-4 rounded-2xl border border-border/40 overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <TrendingUp className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-2 opacity-70">Enfoque Estratégico</span>
                    <p className="text-xs font-medium text-foreground/90 leading-relaxed italic line-clamp-3">
                      "{sprint.goal}"
                    </p>
                  </div>
                )}

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <div>
                      <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Velocidad Actual</span>
                      <span className="text-sm font-black lining-nums">{completedTasks} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-normal">de {totalTasks} tareas logradas</span></span>
                    </div>
                    <span className={`text-sm font-black lining-nums ${progress === 100 ? 'text-emerald-500' : 'text-primary'}`}>{progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted/50 overflow-hidden rounded-full border border-border/20 p-0.5 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm
                        ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary/80 to-primary shadow-primary/20'}
                      `}
                      style={{ width: String(progress) + '%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-2 border-t border-border/40">
                    <div className="flex items-center gap-2">
                       <LayoutTemplate className="h-4 w-4 text-primary" />
                       <span className="text-[11px] font-black uppercase tracking-tight">{sprint.storyIds.length} Historias en Backlog</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {sprint.status === 'planning' && (
                        <Button 
                          size="sm" 
                          className="h-8 px-4 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" 
                          onClick={() => { handleStatusChange(sprint.id, 'active') }}
                        >
                          Lanzar Sprint
                        </Button>
                      )}
                      {sprint.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" 
                          onClick={() => { handleStatusChange(sprint.id, 'completed') }}
                        >
                          Completar
                        </Button>
                      )}
                      {sprint.status === 'completed' && (
                         <div className="h-8 flex items-center gap-1 text-emerald-500 px-3 bg-emerald-500/10 rounded-lg">
                           <CheckCircle2 className="h-3 w-3" />
                           <span className="text-[9px] font-black uppercase tracking-tighter">CONCLUIDO</span>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {sprints.length > ITEMS_PER_PAGE && (
        <div className="pt-8 pb-12">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Creación / Edición Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          // Guard: if trying to close but confirm is open, ignore
          if (!open && showSaveConfirm) return
          setIsDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] border-primary/10 p-0 overflow-hidden shadow-2xl bg-card">
          <div className="bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-8 pb-6 border-b border-border/40">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                {editingSprint ? <Settings2 className="h-6 w-6 text-primary" /> : <Target className="h-6 w-6 text-primary" />}
                {editingSprint ? 'Arquitectura del Sprint' : 'Configurar Nuevo Ciclo'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium">
                {editingSprint ? `Modificando parámetros de ${editingSprint.name}` : 'Establece las bases para la próxima iteración de valor.'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 pt-2 space-y-6">
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Identificador del Sprint *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. Sprint 42: Módulo de IA"
                              className="h-11 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50 text-sm font-semibold"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Lanzamiento *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50 text-xs font-medium"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cierre Estimado *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="h-11 pl-10 rounded-xl bg-muted/30 border-border/50 text-xs font-medium"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Objetivo de Negocio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="¿Qué victoria queremos celebrar al finalizar este ciclo?"
                              className="min-h-[100px] rounded-2xl bg-muted/30 border-border/50 text-sm py-3 px-4 resize-none leading-relaxed"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vincular Historias de Usuario</Label>
                    <Badge variant="secondary" className="text-[9px] font-black tracking-tighter px-2 bg-primary/5 border-primary/10">
                      {selectedStoryIds.length} SELECCIONADAS
                    </Badge>
                  </div>
                  
                  <div className="max-h-[180px] overflow-y-auto space-y-1 p-2 bg-muted/10 border border-border/40 rounded-2xl custom-scrollbar">
                    {activeStories.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <AlertCircle className="h-5 w-5 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-[10px] text-muted-foreground font-bold">No hay historias activas disponibles en el backlog general.</p>
                      </div>
                    ) : (
                      activeStories.map(story => {
                        const isSelected = selectedStoryIds.includes(story.id)
                        return (
                          <div 
                            key={story.id} 
                            className={`
                              group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                              ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-muted/30'}
                            `}
                            onClick={() => { toggleStorySelection(story.id) }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center
                                ${isSelected ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'}
                              `}>
                                {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                              <div>
                                <span className="block text-[10px] font-black text-primary/70">{story.code}</span>
                                <span className="text-xs font-bold leading-none line-clamp-1">{story.title}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] font-medium opacity-50 capitalize">{story.status}</Badge>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-6 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground font-medium max-w-[240px]">
                    * Campos requeridos para validar la planificación del ciclo.
                  </p>
                  <div className="flex gap-3 font-bold">
                    <Button type="button" variant="ghost" onClick={() => { setIsDialogOpen(false) }} className="rounded-xl">Cancelar</Button>
                    <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-primary/10">
                      {editingSprint ? 'Guardar Cambios' : 'Confirmar Planificación'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showSaveConfirm}
        onOpenChange={setShowSaveConfirm}
        onConfirm={confirmSave}
        onCancel={handleCancelSave}
        title={editingSprint ? "¿Guardar cambios en el Sprint?" : "¿Confirmar planificación?"}
        description={editingSprint ? "Se sobrescribirán los datos actuales del sprint." : "Se creará un nuevo ciclo con la configuración actual."}
        confirmText="Confirmar"
      />
      <ConfirmDialog
        open={showLaunchConfirm}
        onOpenChange={setShowLaunchConfirm}
        onConfirm={confirmLaunch}
        title="¿Lanzar nuevo Sprint?"
        description="Hay otro sprint activo. Al activar este, el anterior se marcará como completado automáticamente. ¿Deseas continuar?"
        confirmText="Sí, lanzar"
        variant="default"
      />

      <CommentDialog
        open={showEditAudit}
        onOpenChange={setShowEditAudit}
        title="Justificar Cambios en Sprint"
        description="Escribe el motivo de la modificación para el registro de auditoría."
        onConfirm={executeSave}
      />
    </div>
  )
}
