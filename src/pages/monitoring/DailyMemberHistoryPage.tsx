import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Card, CardContent } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { useDailyScrumStore } from '@/features/monitoring/dailyScrumStore'
import { useTeamStore } from '@/features/team/store'
import { ArrowLeft, Clock4, Filter, ShieldAlert, Sparkles, UserRound } from 'lucide-react'

export function DailyMemberHistoryPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { reports } = useDailyScrumStore()
  const { members } = useTeamStore()
  const [searchText, setSearchText] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [focusFilter, setFocusFilter] = useState<'all' | 'blockers' | 'help' | 'updates'>('all')

  const member = members.find((m) => m.id === id)

  const memberReports = useMemo(() => {
    if (!id) return []
    return reports
      .filter((r) => r.memberId === id)
      .sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime())
  }, [id, reports])

  const filteredReports = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    return memberReports.filter((report) => {
      const inFromRange = !fromDate || report.dateKey >= fromDate
      const inToRange = !toDate || report.dateKey <= toDate
      if (!inFromRange || !inToRange) return false

      const matchFocus =
        focusFilter === 'all'
          ? true
          : focusFilter === 'blockers'
            ? Boolean(report.blockers.trim())
            : focusFilter === 'help'
              ? Boolean(report.helpNeeded.trim())
              : report.updateReasons.length > 0

      if (!matchFocus) return false
      if (!query) return true

      return [
        report.todayResponsibilities,
        report.blockers,
        report.helpNeeded,
        report.scrumNotes,
        report.plannedAssignments.map((task) => `${task.storyCode || 'TASK'} ${task.title}`).join(' '),
        report.updateReasons.map((reason) => reason.reason).join(' '),
      ].join(' ').toLowerCase().includes(query)
    })
  }, [memberReports, searchText, fromDate, toDate, focusFilter])

  const historyMetrics = useMemo(() => {
    const withBlockers = filteredReports.filter((r) => Boolean(r.blockers.trim())).length
    const withHelp = filteredReports.filter((r) => Boolean(r.helpNeeded.trim())).length
    const avgPlannedHours =
      filteredReports.length > 0
        ? filteredReports.reduce((acc, r) => acc + r.expectedHours, 0) / filteredReports.length
        : 0
    return {
      total: filteredReports.length,
      withBlockers,
      withHelp,
      avgPlannedHours: Number(avgPlannedHours.toFixed(1)),
    }
  }, [filteredReports])

  if (!member) {
    return (
      <div className="min-h-full bg-background p-6">
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-lg font-semibold">No se encontró el desarrollador</p>
            <Button onClick={() => {
              void navigate('/monitoring/daily')
            }}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="space-y-2">
              <Breadcrumbs items={[{ label: 'Monitoreo en Vivo' }, { label: 'Daily Scrum Hub' }, { label: member.name }]} />
              <h1 className="text-2xl font-semibold tracking-tight">Historial Daily de {member.name}</h1>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => {
              void navigate('/monitoring/daily')
            }}>
              <ArrowLeft className="h-4 w-4" /> Volver al Daily
            </Button>
          </div>

          <Card className="overflow-hidden border-border/60">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border-b border-border/40">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-16 w-16 rounded-2xl border border-primary/20 bg-card shadow-sm overflow-hidden grid place-items-center">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound className="h-7 w-7 text-primary/70" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold leading-none">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.specialty || 'General'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[11px]">{historyMetrics.total} reportes visibles</Badge>
                      <Badge variant="outline" className="text-[11px]">Promedio objetivo: {historyMetrics.avgPlannedHours}h</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Buscar en historial</p>
                  <Input value={searchText} onChange={(e) => { setSearchText(e.target.value) }} placeholder="Bloqueo, ayuda, nota, tarea..." className="h-9" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Desde</p>
                  <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value) }} className="h-9" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Hasta</p>
                  <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value) }} className="h-9" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">Vista rápida</p>
                  <select
                    value={focusFilter}
                    onChange={(e) => {
                      const value = e.target.value as 'all' | 'blockers' | 'help' | 'updates'
                      setFocusFilter(value)
                    }}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="all">Todo</option>
                    <option value="blockers">Con bloqueos</option>
                    <option value="help">Con ayuda requerida</option>
                    <option value="updates">Con actualizaciones</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-semibold">Reportes</p><p className="text-2xl font-bold tabular-nums">{historyMetrics.total}</p></CardContent></Card>
          <Card className="border-amber-500/25 bg-amber-500/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-semibold">Con bloqueos</p><p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{historyMetrics.withBlockers}</p></CardContent></Card>
          <Card className="border-sky-500/25 bg-sky-500/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-semibold">Con ayuda</p><p className="text-2xl font-bold tabular-nums text-sky-700 dark:text-sky-300">{historyMetrics.withHelp}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground font-semibold">Promedio h objetivo</p><p className="text-2xl font-bold tabular-nums">{historyMetrics.avgPlannedHours}</p></CardContent></Card>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold">{format(new Date(`${report.dateKey}T12:00:00`), "EEEE dd 'de' MMM yyyy", { locale: es })}</p>
                    <p className="text-xs text-muted-foreground">Objetivo diario: {report.expectedHours}h</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1"><Clock4 className="h-3 w-3" /> Actualizado {format(new Date(report.updatedAt), 'HH:mm')}</Badge>
                    <Badge variant="outline">{report.plannedAssignments.length} tareas planificadas</Badge>
                    {report.blockers.trim() && <Badge variant="outline" className="text-amber-700 border-amber-500/30 bg-amber-500/10"><ShieldAlert className="h-3 w-3 mr-1" /> Bloqueos</Badge>}
                    {report.helpNeeded.trim() && <Badge variant="outline" className="text-sky-700 border-sky-500/30 bg-sky-500/10"><Sparkles className="h-3 w-3 mr-1" /> Requiere apoyo</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Responsabilidades</p>
                    <p className="text-sm whitespace-pre-wrap">{report.todayResponsibilities || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Bloqueos</p>
                    <p className="text-sm whitespace-pre-wrap">{report.blockers || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Ayuda requerida</p>
                    <p className="text-sm whitespace-pre-wrap">{report.helpNeeded || '—'}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Notas Scrum</p>
                    <p className="text-sm whitespace-pre-wrap">{report.scrumNotes || '—'}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Tareas planificadas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.plannedAssignments.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Sin tareas registradas</span>
                    ) : (
                      report.plannedAssignments.map((task) => (
                        <Badge key={`${report.id}-${task.taskId}`} variant="outline" className="text-[11px]">
                          {task.storyCode || 'TASK'} · {task.plannedHours}h · {task.status}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {report.updateReasons.length > 0 && (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-2">Motivos de actualización</p>
                    <ul className="space-y-1.5">
                      {report.updateReasons.map((reason, idx) => (
                        <li key={`${report.id}-reason-${String(idx)}`} className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{format(new Date(reason.at), 'dd/MM HH:mm')}:</span> {reason.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredReports.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">No hay reportes que coincidan con los filtros actuales.</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
