import { useState } from 'react'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent } from '@/shared/components/card'
import { CommentDialog } from '@/shared/components/comment-dialog'
import { Checkbox } from '@/shared/components/checkbox'
import { Progress } from '@/shared/components/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Textarea } from '@/shared/components/textarea'
import { cn } from '@/shared/utils'
import { ShieldAlert, Target, Users, Save, Copy, ArrowRight, Clock4 } from 'lucide-react'
import type { TrackedTask } from '@/features/stories/types'
import type { PlannedTaskAssignment } from '@/features/monitoring/dailyScrumStore'

const DAILY_EXPECTED_HOURS = 7
const DAILY_HOURS_OPTIONS = [4, 5, 6, 7, 8, 9]
const TASK_HOURS_OPTIONS = [0.5, 1, 1.5, 2, 3, 4, 6]

type DevStatus = 'delayed' | 'on_track' | 'ahead'

interface DailyDevCardProps {
  entry: {
    member: { id: string; name: string; specialty?: string; avatarUrl?: string }
    team?: { id: string; name: string; module: string }
    assigned: TrackedTask[]
    completed: number
    blocked: number
    inProgress: number
    completionPct: number
    hoursYesterday: number
    completedYesterday: number
    status: DevStatus
    statusLabel: string
    statusHint: string
    todayReport?: {
      todayResponsibilities: string
      blockers: string
      helpNeeded: string
      scrumNotes: string
      expectedHours: number
      plannedAssignments: PlannedTaskAssignment[]
    }
  }
  selectedDateLabel: string
  onOpenHistory: (memberId: string) => void
  onCopyYesterday: (memberId: string) => void
  onSave: (
    memberId: string,
    payload: {
      todayResponsibilities: string
      blockers: string
      helpNeeded: string
      scrumNotes: string
      plannedAssignments: PlannedTaskAssignment[]
      expectedHours: number
      teamId?: string
    },
    reason?: string,
  ) => void
}

export function DailyDevCard({
  entry,
  selectedDateLabel,
  onOpenHistory,
  onCopyYesterday,
  onSave,
}: DailyDevCardProps) {
  const [blockers, setBlockers] = useState(entry.todayReport?.blockers || '')
  const [helpNeeded, setHelpNeeded] = useState(entry.todayReport?.helpNeeded || '')
  const [scrumNotes, setScrumNotes] = useState(entry.todayReport?.scrumNotes || '')
  const [expectedHours, setExpectedHours] = useState(entry.todayReport?.expectedHours || DAILY_EXPECTED_HOURS)
  const [showReasonDialog, setShowReasonDialog] = useState(false)

  const [plannedByTask, setPlannedByTask] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    ;(entry.todayReport?.plannedAssignments || []).forEach((assignment) => {
      initial[assignment.taskId] = assignment.plannedHours
    })
    return initial
  })

  const statusStyle =
    entry.status === 'delayed'
      ? 'border-border/60 bg-card border-l-4 border-l-destructive/70'
      : entry.status === 'ahead'
        ? 'border-border/60 bg-card border-l-4 border-l-emerald-500/70'
        : 'border-border/60 bg-card border-l-4 border-l-border'
  const statusBadgeClass =
    entry.status === 'delayed'
      ? 'border-destructive/30 bg-destructive/10 text-destructive'
      : entry.status === 'ahead'
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
        : 'border-border/60 bg-muted/30 text-muted-foreground'

  const plannedAssignments: PlannedTaskAssignment[] = entry.assigned
    .filter((task) => (plannedByTask[task.id] || 0) > 0)
    .map((task) => ({
      taskId: task.id,
      title: task.title,
      storyCode: task.code,
      plannedHours: Number((plannedByTask[task.id] || 0).toFixed(2)),
      status: task.status,
    }))
  const selectedTaskCount = plannedAssignments.length
  const autoResponsibilities = plannedAssignments
    .map((assignment) => `${assignment.storyCode || 'TASK'} · ${assignment.title}`)
    .join('\n')
  const responsibilitiesPayload = autoResponsibilities || entry.todayReport?.todayResponsibilities || ''
  const plannedHoursTotal = plannedAssignments.reduce((acc, item) => acc + item.plannedHours, 0)
  const lagHours = Math.max(0, expectedHours - entry.hoursYesterday)
  const closestHourOption = (value: number) =>
    TASK_HOURS_OPTIONS.reduce((closest, current) =>
      Math.abs(current - value) < Math.abs(closest - value) ? current : closest,
    TASK_HOURS_OPTIONS[0])
  const getWeightedHoursByTask = (tasks: TrackedTask[]) => {
    if (tasks.length === 0) return new Map<string, number>()
    const weightByStatus = (status: TrackedTask['status']) => {
      if (status === 'in_progress') return 1.35
      if (status === 'blocked') return 0.65
      if (status === 'qa') return 1.1
      return 1
    }
    const weighted = tasks.map((task) => ({ task, weight: weightByStatus(task.status) }))
    const totalWeight = weighted.reduce((acc, item) => acc + item.weight, 0)
    const hoursMap = new Map<string, number>()
    weighted.forEach(({ task, weight }) => {
      const rawHours = totalWeight > 0 ? expectedHours * (weight / totalWeight) : 0
      hoursMap.set(task.id, closestHourOption(rawHours))
    })
    return hoursMap
  }

  const applyBulkSelection = (
    predicate: (task: TrackedTask) => boolean,
    defaultHours = 1,
    autoDistribute = true,
  ) => {
    setPlannedByTask((prev) => {
      const next: Record<string, number> = {}
      const selectedTasks = entry.assigned.filter((task) => predicate(task))
      const weightedHours = getWeightedHoursByTask(selectedTasks)
      entry.assigned.forEach((task) => {
        if (predicate(task)) {
          next[task.id] = autoDistribute
            ? (weightedHours.get(task.id) ?? defaultHours)
            : (prev[task.id] && prev[task.id] > 0 ? prev[task.id] : defaultHours)
        } else {
          next[task.id] = 0
        }
      })
      return next
    })
  }
  const clearBulkSelection = () => {
    setPlannedByTask((prev) => {
      const next: Record<string, number> = { ...prev }
      entry.assigned.forEach((task) => {
        next[task.id] = 0
      })
      return next
    })
  }

  const quickActions: Array<{ label: string; variant: 'outline' | 'ghost'; action: () => void }> = [{ label: 'En progreso', variant: 'outline', action: () => { applyBulkSelection((task) => task.status === 'in_progress', 2, true) } }, { label: 'Bloqueadas', variant: 'outline', action: () => { applyBulkSelection((task) => task.status === 'blocked', 1, true) } }, { label: 'Todo activo', variant: 'outline', action: () => { applyBulkSelection((task) => task.status !== 'completed' && task.status !== 'archived', 1, true) } }, { label: 'Limpiar', variant: 'ghost', action: clearBulkSelection }]
  const handleSave = (reason?: string) => {
    onSave(
      entry.member.id,
      {
        teamId: entry.team?.id,
        todayResponsibilities: responsibilitiesPayload,
        blockers,
        helpNeeded,
        scrumNotes,
        plannedAssignments,
        expectedHours,
      },
      reason,
    )
  }

  return (
    <>
      <Card className={cn('overflow-hidden', statusStyle)}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <img
                src={entry.member.avatarUrl}
                alt=""
                className="h-11 w-11 rounded-xl border border-border/40 object-cover bg-muted"
              />
              <div>
                <p className="font-semibold leading-none">{entry.member.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {entry.member.specialty || 'General'} · {selectedDateLabel}
                  {entry.team ? ` · ${entry.team.name}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={statusBadgeClass}><span className="inline-flex h-1.5 w-1.5 rounded-full bg-current mr-1.5" />{entry.statusLabel}</Badge>
              <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />Asignadas: {entry.assigned.length}</Badge>
              <Badge variant="outline" className="gap-1"><Target className="h-3 w-3" />Completadas: {entry.completed}</Badge>
              <Badge variant="outline" className="gap-1"><ShieldAlert className="h-3 w-3" />Bloqueadas: {entry.blocked}</Badge>
              <Button variant="outline" size="sm" className="h-7 gap-1" onClick={() => {
                onOpenHistory(entry.member.id)
              }}>
                Historial <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/50 p-3 bg-background/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Horas ayer</span><span>{entry.hoursYesterday}h</span></div>
              <p className="text-[11px] text-muted-foreground mt-1">Meta diaria: {expectedHours}h</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 p-3 bg-amber-500/5">
              <div className="flex items-center justify-between text-xs text-amber-700"><span>Horas de atraso</span><span>{lagHours.toFixed(1)}h</span></div>
              <p className="text-[11px] text-muted-foreground mt-1">Se calcula vs jornada objetivo.</p>
            </div>
            <div className="rounded-lg border border-primary/20 p-3 bg-primary/5">
              <div className="flex items-center justify-between text-xs text-primary"><span>Planificadas hoy</span><span>{plannedHoursTotal.toFixed(1)}h</span></div>
              <p className="text-[11px] text-muted-foreground mt-1">Visible para seguimiento en daily.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progreso del dev</span>
              <span className="font-semibold tabular-nums">{entry.completionPct}%</span>
            </div>
            <Progress value={entry.completionPct} className="h-2" />
            <p className="text-xs text-muted-foreground">{entry.statusHint} · Ayer: {entry.completedYesterday} cierres.</p>
          </div>

          <div className="rounded-lg border border-border/50 p-3 bg-background/50 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">Plan diario por selección de tareas</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock4 className="h-3.5 w-3.5" />
                <Select
                  value={String(expectedHours)}
                  onValueChange={(value) => {
                    setExpectedHours(Number(value) || DAILY_EXPECTED_HOURS)
                  }}
                >
                  <SelectTrigger className="h-7 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAILY_HOURS_OPTIONS.map((hoursOption) => (
                      <SelectItem key={String(hoursOption)} value={String(hoursOption)}>
                        {hoursOption}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                h
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-dashed border-primary/25 bg-primary/5 px-2.5 py-1.5 text-xs">
              <span className="text-muted-foreground">Tareas seleccionadas</span>
              <span className="font-semibold text-primary">{selectedTaskCount}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((quickAction) => (
                <Button key={quickAction.label} type="button" variant={quickAction.variant} size="sm" className="h-7 text-[11px]" onClick={quickAction.action}>
                  {quickAction.label}
                </Button>
              ))}
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {entry.assigned.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin tareas asignadas en el sprint para este dev.</p>
              ) : (
                entry.assigned.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-2 p-2 rounded-md border border-border/40">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Checkbox
                          checked={(plannedByTask[task.id] || 0) > 0}
                          onCheckedChange={(checked) => {
                            const isChecked = checked === true
                            setPlannedByTask((prev) => ({
                              ...prev,
                              [task.id]: isChecked ? (prev[task.id] || 1) : 0,
                            }))
                          }}
                        />
                        <p className="text-xs font-medium truncate">{task.code || 'TASK'} · {task.title}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Estado: {task.status}</p>
                    </div>
                    <Select
                      value={String(plannedByTask[task.id] || 0)}
                      onValueChange={(value) => {
                        const next = Number(value) || 0
                        setPlannedByTask((prev) => ({ ...prev, [task.id]: next }))
                      }}
                    >
                      <SelectTrigger className="h-7 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0h</SelectItem>
                        {TASK_HOURS_OPTIONS.map((hoursOption) => (
                          <SelectItem key={String(hoursOption)} value={String(hoursOption)}>
                            {hoursOption}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-1 rounded-lg border border-border/50 p-3 bg-background/40">
              <p className="text-xs font-semibold text-muted-foreground">Responsabilidades (auto por selección)</p>
              <p className="text-xs text-muted-foreground">
                Se construye automáticamente con las tareas seleccionadas, así el scrum no pierde tiempo escribiendo lo operativo.
              </p>
              <div className="max-h-[110px] overflow-y-auto mt-2 space-y-1.5">
                {plannedAssignments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Selecciona tareas para generar responsabilidades del día.</p>
                ) : (
                  plannedAssignments.map((assignment) => (
                    <div key={assignment.taskId} className="text-xs rounded-md border border-border/40 px-2 py-1.5">
                      {assignment.storyCode || 'TASK'} · {assignment.title} · {assignment.plannedHours}h
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Bloqueos actuales</p>
              <Textarea value={blockers} onChange={(e) => {
                setBlockers(e.target.value)
              }} className="min-h-[90px]" placeholder="Dependencias, dudas técnicas, accesos, etc." />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Ayuda requerida del equipo</p>
              <Textarea value={helpNeeded} onChange={(e) => {
                setHelpNeeded(e.target.value)
              }} className="min-h-[80px]" placeholder="Quién puede apoyar y en qué." />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Notas Scrum Master</p>
              <Textarea value={scrumNotes} onChange={(e) => {
                setScrumNotes(e.target.value)
              }} className="min-h-[80px]" placeholder="Acuerdos, compromisos, follow-up." />
            </div>
          </div>

          {plannedAssignments.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-background/60 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Tareas visibles del daily guardado</p>
              <div className="flex flex-wrap gap-1.5">
                {plannedAssignments.map((t) => (
                  <Badge key={t.taskId} variant="outline" className="text-[11px]">
                    {t.storyCode || 'TASK'} · {t.plannedHours}h
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { onCopyYesterday(entry.member.id) }}>
              <Copy className="h-4 w-4" />
              Copiar ayer
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                if (entry.todayReport) {
                  setShowReasonDialog(true)
                } else {
                  handleSave()
                }
              }}
            >
              <Save className="h-4 w-4" />
              Guardar reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentDialog open={showReasonDialog} onOpenChange={setShowReasonDialog} title="Motivo de actualización" description="Para actualizar el reporte guardado, registra el motivo del cambio." variant="warning" confirmLabel="Guardar con motivo" onConfirm={(reason) => { handleSave(reason) }} />
    </>
  )
}
