import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { differenceInDays } from 'date-fns'
import { toast } from 'sonner'
import { useTeamStore } from '@/features/team/store'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Card, CardContent } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { AlertTriangle, ArrowLeft, ArrowRight, Pencil, Save, Trash2 } from 'lucide-react'

const DAILY_HOURS = 7

export function TeamDetailPage() {
  const navigate = useNavigate()
  const { teamId } = useParams<{ teamId: string }>()

  const teams = useTeamStore((state) => state.teams)
  const members = useTeamStore((state) => state.members)
  const updateTeam = useTeamStore((state) => state.updateTeam)
  const removeTeam = useTeamStore((state) => state.removeTeam)
  const assignMemberToTeam = useTeamStore((state) => state.assignMemberToTeam)

  const { stories } = useStoriesStore()
  const { sprints } = useSprintsStore()

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editModule, setEditModule] = useState('Compras')
  const [editDescription, setEditDescription] = useState('')

  const [moveMemberId, setMoveMemberId] = useState<string>('none')
  const [moveTargetTeamId, setMoveTargetTeamId] = useState<string>('none')

  const selectedTeam = useMemo(() => teams.find((t) => t.id === teamId) ?? null, [teams, teamId])

  const selectedTeamMembers = useMemo(() => {
    if (!selectedTeam) return []
    return members.filter((m) => m.teamId === selectedTeam.id)
  }, [members, selectedTeam])

  const moduleOptions = useMemo(() => {
    const defaults = ['Compras', 'Inventario', 'Finanzas', 'Analytics', 'Plataforma', 'Seguridad']
    const storyModules = stories.map((s) => s.module).filter(Boolean)
    return Array.from(new Set([...defaults, ...storyModules]))
  }, [stories])

  const activeSprint = useMemo(() => sprints.find((s) => s.status === 'active') || null, [sprints])

  const daysLeft = useMemo(() => {
    if (!activeSprint) return 0
    return Math.max(0, differenceInDays(new Date(activeSprint.endDate), new Date()))
  }, [activeSprint])

  const sprintTasks = useMemo(() => {
    if (!activeSprint) return []
    const sprintStories = stories.filter((s) => activeSprint.storyIds.includes(s.id))
    return sprintStories.flatMap((s) => s.tasks.filter((t) => t.status !== 'archived'))
  }, [stories, activeSprint])

  const selectedTeamMetrics = useMemo(() => {
    if (!selectedTeam) return null

    const memberIds = new Set(selectedTeamMembers.map((m) => m.id))
    const teamTasks = sprintTasks.filter((t) => t.assignedTo && memberIds.has(t.assignedTo))

    const committedHours = teamTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
    const spentHours = teamTasks.reduce((acc, t) => acc + (t.timeSpent || 0) / 3600, 0)
    const remainingHours = Math.max(0, committedHours - spentHours)
    const availableHours = selectedTeamMembers.length * DAILY_HOURS * Math.max(1, daysLeft)

    const blockedCount = teamTasks.filter((t) => t.status === 'blocked').length
    const blockedRatio = teamTasks.length > 0 ? Math.round((blockedCount / teamTasks.length) * 100) : 0

    const overloadByMember = selectedTeamMembers.map((m) => {
      const mTasks = teamTasks.filter((t) => t.assignedTo === m.id)
      const mCommitted = mTasks.reduce((acc, t) => acc + (t.estimatedHours || 0), 0)
      const mSpent = mTasks.reduce((acc, t) => acc + (t.timeSpent || 0) / 3600, 0)
      const mRemaining = Math.max(0, mCommitted - mSpent)
      const mCapacity = DAILY_HOURS * Math.max(1, daysLeft)

      return {
        member: m,
        remaining: Number(mRemaining.toFixed(1)),
        capacity: Number(mCapacity.toFixed(1)),
        ratio: mCapacity > 0 ? mRemaining / mCapacity : 0,
        tasks: mTasks,
      }
    })

    const delayedMembers = overloadByMember.filter((x) => x.ratio > 1.15)
    const underloadedMembers = overloadByMember.filter((x) => x.ratio < 0.65)

    const suggestions = delayedMembers.slice(0, 3).flatMap((over) => {
      const pendingTask = over.tasks.find((t) => t.status === 'pending' || t.status === 'in_progress' || t.status === 'qa')
      if (!pendingTask || underloadedMembers.length === 0) return []
      const target = underloadedMembers[0]
      return [{ from: over.member.name, to: target.member.name, task: pendingTask.title }]
    })

    const squadRisk =
      remainingHours > availableHours * 0.95 || blockedRatio >= 20
        ? 'alto'
        : remainingHours > availableHours * 0.8 || blockedRatio >= 10
          ? 'medio'
          : 'bajo'

    return {
      committedHours: Number(committedHours.toFixed(1)),
      remainingHours: Number(remainingHours.toFixed(1)),
      availableHours: Number(availableHours.toFixed(1)),
      squadRisk,
      delayedMembers,
      suggestions,
    }
  }, [selectedTeam, selectedTeamMembers, sprintTasks, daysLeft])

  const openEditTeam = () => {
    if (!selectedTeam) return
    setEditingTeamId(selectedTeam.id)
    setEditName(selectedTeam.name)
    setEditModule(selectedTeam.module)
    setEditDescription(selectedTeam.description || '')
  }

  const saveEditTeam = () => {
    if (!editingTeamId) return
    if (!editName.trim()) return toast.error('Nombre de equipo requerido')

    updateTeam(editingTeamId, {
      name: editName.trim(),
      module: editModule,
      description: editDescription.trim(),
    })
    setEditingTeamId(null)
    toast.success('Equipo actualizado')
  }

  const deleteCurrentTeam = () => {
    if (!selectedTeam) return
    removeTeam(selectedTeam.id)
    toast.success('Equipo eliminado')
    void navigate('/teams')
  }

  const moveMemberBetweenTeams = () => {
    if (!selectedTeam) return
    if (moveMemberId === 'none' || moveTargetTeamId === 'none') return
    assignMemberToTeam(moveMemberId, moveTargetTeamId)
    setMoveMemberId('none')
    setMoveTargetTeamId('none')
    toast.success('Desarrollador movido al nuevo equipo')
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-[1000px] mx-auto space-y-4">
          <Breadcrumbs items={[{ label: 'Gestión' }, { label: 'Equipos por Módulo' }, { label: 'Detalle' }]} />
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-lg font-semibold">No encontramos ese equipo</p>
              <p className="text-sm text-muted-foreground">Puede haber sido eliminado o el enlace es inválido.</p>
              <div>
                <Button variant="outline" className="gap-2" onClick={() => { void navigate('/teams') }}>
                  <ArrowLeft className="h-4 w-4" /> Volver a equipos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="space-y-2">
          <Breadcrumbs items={[{ label: 'Gestión' }, { label: 'Equipos por Módulo', path: '/teams' }, { label: selectedTeam.name }]} />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{selectedTeam.name}</h1>
              <p className="text-sm text-muted-foreground">Módulo: {selectedTeam.module}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="gap-2" onClick={() => { void navigate('/teams') }}>
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>
              <Button variant="outline" className="gap-2" onClick={openEditTeam}><Pencil className="h-4 w-4" />Editar</Button>
              <Button variant="outline" className="gap-2 text-destructive" onClick={deleteCurrentTeam}><Trash2 className="h-4 w-4" />Eliminar</Button>
              <Button variant="outline" className="gap-2" onClick={() => { void navigate(`/monitoring/daily?teamId=${selectedTeam.id}`) }}>Ir al Daily filtrado <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {editingTeamId === selectedTeam.id && (
          <Card>
            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input value={editName} onChange={(e) => { setEditName(e.target.value) }} placeholder="Nombre" />
              <Select value={editModule} onValueChange={setEditModule}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{moduleOptions.map((mod) => (<SelectItem key={mod} value={mod}>{mod}</SelectItem>))}</SelectContent></Select>
              <Input value={editDescription} onChange={(e) => { setEditDescription(e.target.value) }} placeholder="Descripción" />
              <div className="md:col-span-3 flex justify-end"><Button size="sm" className="gap-1.5" onClick={saveEditTeam}><Save className="h-3.5 w-3.5" />Guardar cambios</Button></div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
          <Metric label="Horas comprometidas" value={`${String(selectedTeamMetrics?.committedHours ?? 0)}h`} />
          <Metric label="Horas disponibles" value={`${String(selectedTeamMetrics?.availableHours ?? 0)}h`} />
          <Metric label="Horas restantes" value={`${String(selectedTeamMetrics?.remainingHours ?? 0)}h`} />
          <Metric label="Riesgo squad" value={selectedTeamMetrics?.squadRisk ?? 'n/a'} tone={selectedTeamMetrics?.squadRisk === 'alto' ? 'danger' : selectedTeamMetrics?.squadRisk === 'medio' ? 'warn' : 'ok'} />
        </div>

        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Mover desarrollador entre equipos</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Select value={moveMemberId} onValueChange={setMoveMemberId}>
                <SelectTrigger><SelectValue placeholder="Selecciona dev" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecciona dev</SelectItem>
                  {selectedTeamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={moveTargetTeamId} onValueChange={setMoveTargetTeamId}>
                <SelectTrigger><SelectValue placeholder="Equipo destino" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Equipo destino</SelectItem>
                  {teams.filter((t) => t.id !== selectedTeam.id).map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={moveMemberBetweenTeams}>Mover ahora</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Devs con posible atraso</p>
              {selectedTeamMetrics?.delayedMembers.length ? selectedTeamMetrics.delayedMembers.map((d) => (
                <p key={d.member.id} className="text-sm py-1">{d.member.name} · {d.remaining}h pendientes / {d.capacity}h capacidad</p>
              )) : <p className="text-xs text-muted-foreground">Sin señales críticas detectadas.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Recomendaciones automáticas de rebalanceo</p>
              {selectedTeamMetrics?.suggestions.length ? selectedTeamMetrics.suggestions.map((s, idx) => (
                <p key={`${s.task}-${String(idx)}`} className="text-sm py-1">Mover <span className="font-semibold">{s.task}</span> de {s.from} a {s.to}</p>
              )) : (
                <p className="text-xs text-muted-foreground">No hay sugerencias fuertes por ahora.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Miembros del equipo</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {selectedTeamMembers.map((m) => (
                <div key={m.id} className="rounded-md border border-border/40 p-2">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.specialty || 'General'}</p>
                </div>
              ))}
              {selectedTeamMembers.length === 0 && <p className="text-xs text-muted-foreground">Este equipo aún no tiene devs asignados.</p>}
            </div>
          </CardContent>
        </Card>

        {selectedTeamMetrics?.squadRisk === 'alto' && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
            <p>Riesgo alto del squad: capacidad insuficiente o bloqueos elevados. Prioriza desbloqueos y rebalanceo hoy.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'ok' | 'warn' | 'danger' }) {
  const toneClass = tone === 'ok' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : tone === 'danger' ? 'text-destructive' : 'text-foreground'
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] text-muted-foreground font-semibold">{label}</p>
        <p className={`text-xl font-bold mt-1 ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
