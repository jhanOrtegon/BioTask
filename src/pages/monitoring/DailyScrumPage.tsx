/* eslint-disable max-lines */
import { useDeferredValue, useMemo, useState } from 'react'
import { format, subDays, isSameDay, startOfDay, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Card, CardContent } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/components/dropdown-menu'
import { ScrollArea } from '@/shared/components/scroll-area'
import { cn } from '@/shared/utils'
import { useTeamStore } from '@/features/team/store'
import { useStoriesStore } from '@/features/stories/store'
import { useSprintsStore } from '@/features/sprints/store'
import { useDailyScrumStore, type PlannedTaskAssignment } from '@/features/monitoring/dailyScrumStore'
import { CalendarDays, CheckSquare, Trash2 } from 'lucide-react'
import { DailyDevCard } from './components/DailyDevCard'

const toDateKey = (d: Date) => format(d, 'yyyy-MM-dd')
const DAILY_EXPECTED_HOURS = 7

type DevStatus = 'delayed' | 'on_track' | 'ahead'

type TeamView = {
  id: string
  name: string
  module: string
}

const isTeamView = (value: unknown): value is TeamView => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.name === 'string' && typeof candidate.module === 'string'
}

export function DailyScrumPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const members = useTeamStore((state) => state.members)
  const rawTeams = useTeamStore((state) => state.teams as unknown)
  const { stories } = useStoriesStore()
  const { sprints } = useSprintsStore()
  const { reports, upsertReport, clearDayReports } = useDailyScrumStore()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [search, setSearch] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(searchParams.get('teamId') || 'all')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [statusQuickFilter, setStatusQuickFilter] = useState<'all' | 'delayed' | 'ahead'>('all')
  const [memberOverflowSearch, setMemberOverflowSearch] = useState('')
  const [highlightedOverflowIndex, setHighlightedOverflowIndex] = useState(0)
  const deferredOverflowSearch = useDeferredValue(memberOverflowSearch)

  const teams = useMemo(() => {
    if (!Array.isArray(rawTeams)) return []
    return rawTeams.filter(isTeamView)
  }, [rawTeams])

  const dateKey = toDateKey(selectedDate)
  const yesterdayKey = toDateKey(subDays(selectedDate, 1))

  const activeSprint = useMemo(() => sprints.find((s) => s.status === 'active'), [sprints])

  const sprintStories = useMemo(() => {
    if (!activeSprint) return []
    return stories.filter((s) => activeSprint.storyIds.includes(s.id))
  }, [stories, activeSprint])

  const sprintTasks = useMemo(
    () => sprintStories.flatMap((s) => s.tasks.filter((t) => t.status !== 'archived')),
    [sprintStories],
  )

  const expectedSprintProgress = useMemo(() => {
    if (!activeSprint) return 0
    const start = startOfDay(new Date(activeSprint.startDate))
    const end = startOfDay(new Date(activeSprint.endDate))
    const current = startOfDay(selectedDate)

    const totalDays = Math.max(1, differenceInDays(end, start) + 1)
    const elapsedDays = Math.min(totalDays, Math.max(1, differenceInDays(current, start) + 1))

    return Math.round((elapsedDays / totalDays) * 100)
  }, [activeSprint, selectedDate])

  const reportMap = useMemo(() => {
    const map = new Map<string, (typeof reports)[number]>()
    reports.filter((r) => r.dateKey === dateKey).forEach((r) => {
      map.set(r.memberId, r)
    })
    return map
  }, [reports, dateKey])

  const yesterdayReportMap = useMemo(() => {
    const map = new Map<string, (typeof reports)[number]>()
    reports.filter((r) => r.dateKey === yesterdayKey).forEach((r) => {
      map.set(r.memberId, r)
    })
    return map
  }, [reports, yesterdayKey])

  const membersData = useMemo(() => {
    return members
      .filter((m) => m.active)
      .map((member) => {
        const assigned = sprintTasks.filter((t) => t.assignedTo === member.id)
        const completed = assigned.filter((t) => t.status === 'completed').length
        const blocked = assigned.filter((t) => t.status === 'blocked').length
        const inProgress = assigned.filter((t) => t.status === 'in_progress').length
        const completionPct = assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0

        const hoursYesterday = assigned.reduce((acc, task) => {
          const logs = task.timeLogs || []
          return (
            acc +
            logs
              .filter((log) => isSameDay(new Date(log.startedAt), subDays(selectedDate, 1)))
              .reduce((sum, log) => {
                if (!log.endedAt) return sum
                return sum + (new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / 3600000
              }, 0)
          )
        }, 0)

        const completedYesterday = assigned.filter(
          (t) => t.status === 'completed' && isSameDay(new Date(t.updatedAt), subDays(selectedDate, 1)),
        ).length

        const delayDelta = completionPct - expectedSprintProgress
        let status: DevStatus = 'on_track'
        if (delayDelta <= -15 || (completedYesterday === 0 && blocked > 0 && inProgress > 0)) status = 'delayed'
        else if (delayDelta >= 15 || completedYesterday >= 2) status = 'ahead'

        const statusLabel = status === 'ahead' ? 'Adelantado' : status === 'delayed' ? 'Atrasado' : 'En línea'
        const statusHint =
          status === 'delayed'
            ? 'Requiere apoyo y foco de cierre hoy.'
            : status === 'ahead'
              ? 'Puede apoyar desbloqueos del equipo.'
              : 'Ritmo estable; mantener foco.'

        return {
          member,
          team: teams.find((t) => t.id === member.teamId),
          assigned,
          completed,
          blocked,
          inProgress,
          completionPct,
          hoursYesterday: Number(hoursYesterday.toFixed(1)),
          completedYesterday,
          status,
          statusLabel,
          statusHint,
          todayReport: reportMap.get(member.id),
        }
      })
      .sort((a, b) => {
        if (a.status === 'delayed' && b.status !== 'delayed') return -1
        if (b.status === 'delayed' && a.status !== 'delayed') return 1
        return a.member.name.localeCompare(b.member.name)
      })
  }, [members, sprintTasks, expectedSprintProgress, selectedDate, reportMap, teams])

  const filteredMembersData = useMemo(() => {
    return membersData
      .filter((entry) => selectedTeamId === 'all' || entry.member.teamId === selectedTeamId)
      .filter((entry) => selectedMemberIds.length === 0 || selectedMemberIds.includes(entry.member.id))
      .filter((entry) => entry.member.name.toLowerCase().includes(search.toLowerCase()))
  }, [membersData, selectedTeamId, selectedMemberIds, search])

  const teamSummaries = useMemo(() => {
    return teams.map((team) => {
      const teamEntries = membersData.filter((entry) => entry.member.teamId === team.id)
      const delayed = teamEntries.filter((entry) => entry.status === 'delayed').length
      const ahead = teamEntries.filter((entry) => entry.status === 'ahead').length
      return {
        team,
        members: teamEntries.length,
        delayed,
        ahead,
      }
    })
  }, [teams, membersData])

  const activeMembers = useMemo(() => {
    const scope = members
      .filter((m) => m.active)
      .filter((m) => selectedTeamId === 'all' || m.teamId === selectedTeamId)
    return scope.sort((a, b) => a.name.localeCompare(b.name))
  }, [members, selectedTeamId])

  const overflowPool = useMemo(() => activeMembers.slice(10), [activeMembers])

  const overflowMembers = useMemo(() => {
    const query = deferredOverflowSearch.trim().toLowerCase()
    if (!query) return overflowPool.slice(0, 20)
    return overflowPool
      .filter((member) => `${member.name} ${member.specialty || ''}`.toLowerCase().includes(query))
      .slice(0, 20)
  }, [deferredOverflowSearch, overflowPool])

  const addFilteredMembers = () => {
    setSelectedMemberIds((prev) => {
      const merged = new Set(prev)
      overflowMembers.forEach((member) => {
        merged.add(member.id)
      })
      return Array.from(merged)
    })
  }

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const summary = useMemo(() => {
    const delayed = filteredMembersData.filter((m) => m.status === 'delayed').length
    const onTrack = filteredMembersData.filter((m) => m.status === 'on_track').length
    const ahead = filteredMembersData.filter((m) => m.status === 'ahead').length
    return { delayed, onTrack, ahead, total: filteredMembersData.length }
  }, [filteredMembersData])

  const visibleMembersData = useMemo(() => {
    if (statusQuickFilter === 'all') return filteredMembersData
    return filteredMembersData.filter((entry) => entry.status === statusQuickFilter)
  }, [filteredMembersData, statusQuickFilter])

  const isTeamOverview = selectedTeamId === 'all'

  const saveReport = (
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
  ) => {
    upsertReport({ dateKey, memberId, ...payload }, reason)
    toast.success('Reporte diario guardado')
  }

  const copyYesterdayForMember = (memberId: string) => {
    const previous = yesterdayReportMap.get(memberId)
    if (!previous) {
      toast.warning('No hay reporte del día anterior para copiar')
      return
    }

    upsertReport({
      dateKey,
      memberId,
      teamId: previous.teamId,
      todayResponsibilities: previous.todayResponsibilities,
      blockers: previous.blockers,
      helpNeeded: previous.helpNeeded,
      scrumNotes: previous.scrumNotes,
      plannedAssignments: (previous as { plannedAssignments?: PlannedTaskAssignment[] }).plannedAssignments ?? [],
      expectedHours: (previous as { expectedHours?: number }).expectedHours ?? DAILY_EXPECTED_HOURS,
    })
    toast.success('Reporte copiado desde ayer')
  }

  if (!activeSprint) {
    return (
      <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-[1200px] mx-auto">
          <Card className="border-dashed border-primary/30">
            <CardContent className="p-10 text-center space-y-4">
              <CalendarDays className="h-10 w-10 text-primary/50 mx-auto" />
              <h2 className="text-xl font-semibold">No hay sprint activo</h2>
              <p className="text-sm text-muted-foreground">Activa un sprint para habilitar el módulo profesional de Daily Scrum.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1650px] mx-auto space-y-6 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2">
            <Breadcrumbs items={[{ label: 'Monitoreo en Vivo' }, { label: 'Daily Scrum Hub' }]} />
            <h1 className="text-2xl font-semibold tracking-tight">Daily Scrum Hub</h1>
            <p className="text-sm text-muted-foreground">
              Sprint <span className="font-semibold text-foreground">{activeSprint.name}</span> · Progreso esperado hoy: {expectedSprintProgress}%
              {isTeamOverview ? ' · Selecciona un equipo para entrar al detalle de desarrolladores.' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Input type="date" value={dateKey} onChange={(e) => {
              const d = new Date(`${e.target.value}T09:00:00`)
              if (!Number.isNaN(d.getTime())) setSelectedDate(d)
            }} className="h-9 w-[180px]" />
            {!isTeamOverview && (
              <>
                <Input value={search} onChange={(e) => { setSearch(e.target.value) }} placeholder="Buscar dev..." className="h-9 w-[200px]" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId('all')
                    setSelectedMemberIds([])
                    setStatusQuickFilter('all')
                  }}
                  className="h-9 px-3 rounded-md border border-input text-sm hover:bg-muted/40 transition-colors"
                >
                  Volver a equipos
                </button>
              </>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              clearDayReports(dateKey)
              toast.success('Notas del día limpiadas')
            }}>
              <Trash2 className="h-4 w-4" /> Limpiar día
            </Button>
          </div>
        </div>

        {!isTeamOverview && <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs font-semibold text-muted-foreground">Filtro por dev</div>
          <TooltipProvider delayDuration={120}>
            <div className="flex items-center -space-x-1.5">
              {activeMembers.slice(0, 10).map((member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        toggleMember(member.id)
                      }}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden bg-card hover:z-20',
                        selectedMemberIds.includes(member.id)
                          ? 'border-primary scale-110 z-20 shadow-md ring-2 ring-primary/10'
                          : 'border-background dark:border-card hover:border-primary/40 hover:scale-110 z-10',
                      )}
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-primary uppercase">{member.name.charAt(0)}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium bg-foreground text-background border-none px-2.5 py-1 rounded-md shadow-lg">
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      <span className="text-xs opacity-60">{member.specialty || 'General'}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}

              {activeMembers.length > 10 && (
                <DropdownMenu onOpenChange={(open) => {
                  if (!open) setMemberOverflowSearch('')
                }}>
                  <DropdownMenuTrigger asChild>
                    <button className="h-8 w-8 rounded-full border-2 border-background dark:border-card bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-all z-0 hover:z-20 text-xs font-bold">
                      +{activeMembers.length - 10}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[220px] rounded-lg border-border/40 p-2 space-y-1">
                    <div className="px-2 py-1.5 mb-1">
                      <p className="text-xs font-semibold text-muted-foreground/60">Otros integrantes</p>
                    </div>
                    <div className="px-1 pb-1">
                      <Input
                        value={memberOverflowSearch}
                        autoFocus
                        onChange={(e) => {
                          setMemberOverflowSearch(e.target.value)
                          setHighlightedOverflowIndex(0)
                        }}
                        onKeyDown={(e) => {
                          if (overflowMembers.length === 0) return
                          if (e.key === 'ArrowDown') {
                            e.preventDefault()
                            setHighlightedOverflowIndex((prev) => Math.min(prev + 1, overflowMembers.length - 1))
                            return
                          }
                          if (e.key === 'ArrowUp') {
                            e.preventDefault()
                            setHighlightedOverflowIndex((prev) => Math.max(prev - 1, 0))
                            return
                          }
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const safeIndex = Math.min(highlightedOverflowIndex, overflowMembers.length - 1)
                            toggleMember(overflowMembers[safeIndex].id)
                          }
                        }}
                        placeholder="Filtrar dev..."
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="px-1 pb-1 flex items-center gap-1.5">
                      <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={addFilteredMembers} disabled={overflowMembers.length === 0}>
                        Seleccionar filtrados
                      </Button>
                      <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => { setSelectedMemberIds([]) }}>
                        Limpiar
                      </Button>
                    </div>
                    <ScrollArea className="h-[220px]">
                      {overflowMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => {
                            toggleMember(member.id)
                          }}
                          className={cn(
                            'flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-primary/5 transition-all',
                            selectedMemberIds.includes(member.id) ? 'bg-primary/10' : '',
                            overflowMembers[highlightedOverflowIndex]?.id === member.id ? 'ring-1 ring-primary/40 bg-primary/5' : '',
                          )}
                        >
                          <div className="relative h-7 w-7 rounded-md overflow-hidden border border-border/20 shrink-0">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} className="h-full w-full object-cover" alt="" />
                            ) : (
                              <div className="h-full w-full bg-secondary flex items-center justify-center text-xs font-bold">{member.name[0]}</div>
                            )}
                            {selectedMemberIds.includes(member.id) && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <CheckSquare className="h-3 w-3 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold truncate leading-none">{member.name}</p>
                            <p className="text-xs font-medium text-muted-foreground/60 truncate mt-0.5">{member.specialty || 'General'}</p>
                          </div>
                        </div>
                      ))}
                      {overflowMembers.length === 0 && (
                        <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                          Sin coincidencias para ese filtro.
                        </div>
                      )}
                      {overflowMembers.length > 0 && (
                        <div className="px-2 pt-2 text-[10px] text-muted-foreground/80 border-t border-border/40 mt-2">
                          Usa ↑ ↓ para navegar y Enter para seleccionar.
                        </div>
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {selectedMemberIds.length > 0 && (
              <button
                onClick={() => {
                  setSelectedMemberIds([])
                }}
                className="h-7 px-2.5 rounded-md text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all"
              >
                Limpiar devs
              </button>
            )}
          </TooltipProvider>
        </div>}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-semibold text-muted-foreground">Equipos (click para entrar a su data)</p>
          </div>

          <div className={cn('grid gap-3', isTeamOverview ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6')}>
            {teamSummaries.map(({ team, members: teamMembers, delayed, ahead }) => (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setSelectedTeamId(team.id)
                  setSelectedMemberIds([])
                  setStatusQuickFilter('all')
                }}
                className={cn(
                  'rounded-xl border text-left transition-all',
                  isTeamOverview
                    ? 'p-5 bg-gradient-to-br from-card via-card to-primary/5 border-border/60 hover:border-primary/30 hover:shadow-md'
                    : 'p-3 border-border/50 bg-card/60 hover:border-primary/30 hover:bg-primary/5',
                  selectedTeamId === team.id && 'border-primary/40 bg-primary/10 ring-1 ring-primary/20',
                )}
              >
                <p className="text-xs text-muted-foreground font-semibold truncate">{team.module}</p>
                <p className={cn('font-semibold mt-1 truncate', isTeamOverview ? 'text-lg' : 'text-sm')}>{team.name}</p>
                <p className="text-[11px] text-muted-foreground mt-2">{teamMembers} devs</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-destructive/10 text-destructive">{delayed} atrasados</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">{ahead} adelantados</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {!isTeamOverview && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setStatusQuickFilter((prev) => (prev === 'delayed' ? 'all' : 'delayed'))
            }}
            className={cn(
              'text-left rounded-lg border transition-all',
              statusQuickFilter === 'delayed' ? 'border-destructive/40 bg-destructive/10 ring-1 ring-destructive/20' : 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10',
            )}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Atrasados · filtro</p>
              <p className="text-2xl font-bold text-destructive tabular-nums">{summary.delayed}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{statusQuickFilter === 'delayed' ? 'Filtrando atrasados' : 'Click para filtrar'}</p>
            </CardContent>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusQuickFilter((prev) => (prev === 'ahead' ? 'all' : 'ahead'))
            }}
            className={cn(
              'text-left rounded-lg border transition-all',
              statusQuickFilter === 'ahead' ? 'border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
            )}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Adelantados · filtro</p>
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">{summary.ahead}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{statusQuickFilter === 'ahead' ? 'Filtrando adelantados' : 'Click para filtrar'}</p>
            </CardContent>
          </button>

          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-semibold">Vista actual</p>
              <p className="text-2xl font-bold tabular-nums">{visibleMembersData.length}</p>
              <p className="text-[11px] text-muted-foreground mt-1">En línea: {summary.onTrack} · Total: {summary.total}</p>
              {statusQuickFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusQuickFilter('all')
                  }}
                  className="mt-2 h-6 px-2 rounded-md text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  Limpiar filtro estado
                </button>
              )}
            </CardContent>
          </Card>
        </div>}

        {!isTeamOverview && <div className="space-y-4">
          {visibleMembersData.map((entry) => (
            <DailyDevCard
              key={entry.member.id}
              entry={entry}
              selectedDateLabel={format(selectedDate, "EEEE dd 'de' MMM", { locale: es })}
              onSave={saveReport}
              onCopyYesterday={copyYesterdayForMember}
              onOpenHistory={(memberId) => {
                void navigate(`/monitoring/daily/${memberId}`)
              }}
            />
          ))}
          {visibleMembersData.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No hay desarrolladores para el filtro actual.
              </CardContent>
            </Card>
          )}
        </div>}
      </div>
    </div>
  )
}
