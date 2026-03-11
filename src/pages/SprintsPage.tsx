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
import { CalendarDays, Plus, Clock, CheckCircle2, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import type { SprintStatus } from '@/features/sprints/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export function SprintsPage() {
  const { sprints, addSprint, updateSprint } = useSprintsStore()
  const { stories } = useStoriesStore()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formGoal, setFormGoal] = useState('')
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([])

  const activeStories = useMemo(() => stories.filter(s => s.status !== 'archived'), [stories])

  const handleCreate = () => {
    if (!formName.trim() || !formStart || !formEnd) {
      toast.error('Campos incompletos', { description: 'El nombre y las fechas son requeridos.' })
      return
    }
    
    // Quick validation
    if (new Date(formStart) > new Date(formEnd)) {
      toast.error('Fechas inválidas', { description: 'La fecha de inicio debe ser anterior a la de fin.' })
      return
    }

    const newSprint = addSprint({
      name: formName.trim(),
      goal: formGoal.trim() || undefined,
      startDate: new Date(formStart).toISOString(),
      endDate: new Date(formEnd).toISOString()
    })
    
    // Add selected stories to the sprint
    selectedStoryIds.forEach(storyId => {
      useSprintsStore.getState().addStoryToSprint(newSprint.id, storyId)
    })
    
    toast.success('Sprint Creado', { description: 'El sprint ha sido añadido a la planificación.' })
    setIsCreateOpen(false)
    setFormName('')
    setFormGoal('')
    setFormStart('')
    setFormEnd('')
    setSelectedStoryIds([])
  }

  const toggleStorySelection = (id: string) => {
    setSelectedStoryIds(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleStatusChange = (id: string, newStatus: SprintStatus) => {
    updateSprint(id, { status: newStatus })
  }

  const getStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case 'planning': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-amber-500/30 text-amber-500 bg-amber-500/10">Planificación</Badge>
      case 'active': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-blue-500/30 text-blue-500 bg-blue-500/10">Activo</Badge>
      case 'completed': return <Badge variant="outline" className="text-[10px] font-bold tracking-wider border-emerald-500/30 text-emerald-500 bg-emerald-500/10">Completado</Badge>
    }
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background animate-in fade-in duration-300">
      <Breadcrumbs items={[{ label: 'Planificación de Sprints' }]} />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 border border-primary/20">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Sprints
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground max-w-xl pl-13">
            Gestiona ciclos de trabajo, define objetivos y asigna historias para mantener el ritmo del proyecto.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs font-bold py-1 px-3 hidden sm:flex">
            {sprints.length} Ciclos Registrados
          </Badge>
          <Button onClick={() => { setIsCreateOpen(true) }} className="gap-2 font-bold shadow-lg">
            <Plus className="h-4 w-4" /> Crear Sprint
          </Button>
        </div>
      </header>

      {/* Sprints Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sprints.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-bold">No hay sprints activos</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">El proyecto no tiene ningún ciclo de desarrollo configurado. Inicia planificando el primero.</p>
            <Button onClick={() => { setIsCreateOpen(true) }} variant="outline">Planificar Primera Meta</Button>
          </div>
        ) : (
          sprints.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(sprint => {
            const sprintStories = activeStories.filter(s => sprint.storyIds.includes(s.id))
            const totalTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status !== 'archived').length, 0)
            const completedTasks = sprintStories.reduce((acc, curr) => acc + curr.tasks.filter(t => t.status === 'completed').length, 0)
            const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

            return (
              <div key={sprint.id} className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border shadow-md hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    {getStatusBadge(sprint.status)}
                    <h3 className="text-lg font-black tracking-tight">{sprint.name}</h3>
                  </div>
                  {/* Actions Dropdown mock or explicit button */}
                  {sprint.status === 'planning' && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => { handleStatusChange(sprint.id, 'active') }}>
                      Iniciar Sprint
                    </Button>
                  )}
                  {sprint.status === 'active' && (
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors" onClick={() => { handleStatusChange(sprint.id, 'completed') }}>
                      Cerrar Sprint
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(sprint.startDate)}</span>
                  </div>
                  <span>—</span>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{formatDate(sprint.endDate)}</span>
                  </div>
                </div>

                {sprint.goal && (
                  <p className="text-sm text-foreground/80 mb-6 bg-muted/30 p-3 rounded-xl border border-border/50">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-1">Misión</span>
                    {sprint.goal}
                  </p>
                )}

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                    <span>Progreso Global</span>
                    <span className={progress === 100 ? 'text-emerald-500' : 'text-primary'}>{progress}% ({completedTasks}/{totalTasks} tareas)</span>
                  </div>
                  <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: String(progress) + '%' }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                       <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
                       <span className="text-xs font-bold">{sprint.storyIds.length} Historias asignadas</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Creación Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mapear Nuevo Sprint</DialogTitle>
            <DialogDescription>
              Define las fechas del ciclo y el objetivo de negocio a cumplir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs">Nombre del Sprint *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => { setFormName(e.target.value) }}
                placeholder="Ej. Sprint 1 - MVP Login"
                className="col-span-3 text-xs"
              />
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="start" className="text-xs">Fecha de Inicio *</Label>
              <Input
                id="start"
                type="date"
                value={formStart}
                onChange={(e) => { setFormStart(e.target.value) }}
                className="col-span-3 text-xs"
              />
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="end" className="text-xs">Fecha de Fin *</Label>
              <Input
                id="end"
                type="date"
                value={formEnd}
                onChange={(e) => { setFormEnd(e.target.value) }}
                className="col-span-3 text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="goal" className="text-xs">Objetivo/Misión (Opcional)</Label>
              <Textarea
                id="goal"
                value={formGoal}
                onChange={(e) => { setFormGoal(e.target.value) }}
                placeholder="Entregar el módulo de autenticación probado y configurado con la base de datos de producción."
                className="col-span-3 min-h-[80px] text-xs resize-none"
              />
            </div>
            {activeStories.length > 0 && (
              <div className="grid gap-2 mt-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Historias Asociadas</Label>
                <div className="max-h-[140px] overflow-y-auto space-y-2 p-3 bg-muted/20 border border-border rounded-xl">
                  {activeStories.map(story => (
                    <div key={story.id} className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        id={`story-${story.id}`}
                        checked={selectedStoryIds.includes(story.id)}
                        onChange={() => { toggleStorySelection(story.id) }}
                        className="mt-1"
                      />
                      <label htmlFor={`story-${story.id}`} className="text-xs leading-tight cursor-pointer">
                        <span className="font-bold text-primary">{story.code}</span> - {story.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" onClick={() => { setIsCreateOpen(false) }}>Cancelar</Button>
            <Button onClick={handleCreate}>Generar Ciclo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
