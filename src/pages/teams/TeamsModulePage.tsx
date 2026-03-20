import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useTeamStore } from '@/features/team/store'
import { useStoriesStore } from '@/features/stories/store'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Card, CardContent } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { Textarea } from '@/shared/components/textarea'
import { Checkbox } from '@/shared/components/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/select'
import { Badge } from '@/shared/components/badge'
import { ArrowRight, Layers, Plus } from 'lucide-react'
import type { DevTeam } from '@/features/team/types'

const DEFAULT_MODULES = ['Compras', 'Inventario', 'Finanzas', 'Analytics', 'Plataforma', 'Seguridad']
export function TeamsModulePage() {
  const navigate = useNavigate()
  const teams = useTeamStore((state) => state.teams)
  const members = useTeamStore((state) => state.members)
  const addTeam = useTeamStore((state) => state.addTeam)
  const assignMemberToTeam = useTeamStore((state) => state.assignMemberToTeam)
  const { stories } = useStoriesStore()

  const [name, setName] = useState('')
  const [moduleName, setModuleName] = useState('Compras')
  const [description, setDescription] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  const moduleOptions = useMemo(() => {
    const storyModules = stories.map((s) => s.module).filter(Boolean)
    return Array.from(new Set([...DEFAULT_MODULES, ...storyModules]))
  }, [stories])

  const memberCandidates = useMemo(() => {
    const q = memberSearch.toLowerCase()
    return members
      .filter((m) => m.active)
      .filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [members, memberSearch])

  const handleToggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  const handleCreateTeam = () => {
    if (!name.trim()) return toast.error('Nombre del equipo requerido')

    addTeam({
      name: name.trim(),
      module: moduleName,
      description: description.trim() || `Equipo para módulo ${moduleName}`,
    })

    const latestTeams = useTeamStore.getState().teams
    const createdTeam = latestTeams[latestTeams.length - 1] as DevTeam | undefined
    if (createdTeam) {
      selectedMemberIds.forEach((memberId) => {
        assignMemberToTeam(memberId, createdTeam.id)
      })
      void navigate(`/teams/${createdTeam.id}`)
    }

    setName('')
    setDescription('')
    setSelectedMemberIds([])
    toast.success('Equipo creado y desarrolladores asignados')
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
        <div className="space-y-2">
          <Breadcrumbs items={[{ label: 'Gestión' }, { label: 'Equipos por Módulo' }]} />
          <h1 className="text-2xl font-semibold tracking-tight">Módulo de Equipos · V2</h1>
          <p className="text-sm text-muted-foreground">Enterprise Scrum: equipos, capacidad, riesgo predictivo y recomendaciones de rebalanceo.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Crear equipo independiente</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Nombre</Label><Input value={name} onChange={(e) => { setName(e.target.value) }} placeholder="Ej: Squad Compras Core" /></div>
                <div className="space-y-1.5"><Label className="text-xs">Módulo</Label><Select value={moduleName} onValueChange={setModuleName}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{moduleOptions.map((mod) => (<SelectItem key={mod} value={mod}>{mod}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Descripción</Label><Textarea value={description} onChange={(e) => { setDescription(e.target.value) }} className="min-h-[70px]" placeholder="Objetivo y alcance del equipo." /></div>

              <div className="space-y-2 rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap"><p className="text-xs font-semibold text-muted-foreground">Asignar devs al crear</p><Input value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value) }} placeholder="Buscar dev..." className="h-8 w-[220px]" /></div>
                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                  {memberCandidates.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 p-2 rounded-md border border-border/40 hover:bg-muted/40 cursor-pointer">
                      <Checkbox checked={selectedMemberIds.includes(member.id)} onCheckedChange={() => { handleToggleMember(member.id) }} />
                      <div className="min-w-0"><p className="text-sm font-medium truncate">{member.name}</p><p className="text-xs text-muted-foreground truncate">{member.specialty || 'General'} · {member.email}</p></div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end"><Button className="gap-2" onClick={handleCreateTeam}><Plus className="h-4 w-4" /> Crear equipo y asignar</Button></div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /><p className="text-sm font-semibold">Equipos creados</p></div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {teams.map((team: DevTeam) => (
                  <button key={team.id} onClick={() => { void navigate(`/teams/${team.id}`) }} className="w-full text-left p-3 rounded-lg border transition border-border/40 hover:bg-muted/40">
                    <p className="text-sm font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground">Módulo: {team.module}</p>
                    <Badge variant="outline" className="mt-1 text-[11px]">{members.filter((m) => m.teamId === team.id).length} devs</Badge>
                    <p className="text-[11px] text-primary mt-2 inline-flex items-center gap-1">Ver detalle <ArrowRight className="h-3.5 w-3.5" /></p>
                  </button>
                ))}
                {teams.length === 0 && <p className="text-xs text-muted-foreground">Aún no hay equipos.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
