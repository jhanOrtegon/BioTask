import { useState, useMemo } from 'react'
import { useTeamStore } from '@/features/team/store'
import type { TeamMember, TeamRole } from '@/features/team/types'
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  ShieldCheck, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  UserPlus,
  ShieldAlert,
  ShieldQuestion,
  ToggleLeft,
  ToggleRight,
  Filter,
  BarChart2
} from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/shared/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/shared/ui/dropdown-menu'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/utils'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/shared/ui/breadcrumbs'

const roleConfig: Record<TeamRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  admin:    { label: 'Admin',     icon: ShieldCheck,    color: 'text-red-500',    bg: 'bg-red-500/10' },
  lead:     { label: 'Lead',      icon: ShieldAlert,    color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  developer: { label: 'Dev',       icon: ShieldCheck,    color: 'text-emerald-500',bg: 'bg-emerald-500/10' },
  qa:       { label: 'QA',        icon: ShieldCheck,    color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  designer: { label: 'Design',    icon: ShieldQuestion, color: 'text-purple-500', bg: 'bg-purple-500/10' }
}

export function TeamPage() {
  const { members, addMember, updateMember, removeMember } = useTeamStore()
  const [searchTerm, setSearchTerm] = useQueryState('q', { defaultValue: '' })
  const [groupBy, setGroupBy] = useQueryState('groupBy', { defaultValue: 'none' })
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('developer')
  const [specialty, setSpecialty] = useState('')

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedData = useMemo(() => {
    if (groupBy === 'role') {
      return members.reduce((acc, m) => {
        const key = m.role
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
      }, {} as Record<string, TeamMember[]>)
    }
    if (groupBy === 'specialty') {
       return members.reduce((acc, m) => {
        const key = m.specialty || 'General'
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
      }, {} as Record<string, TeamMember[]>)
    }
    return { 'Todos los Miembros': filteredMembers }
  }, [filteredMembers, groupBy, members])

  const handleOpenAdd = () => {
    setEditingMember(null)
    setName('')
    setEmail('')
    setRole('developer')
    setSpecialty('')
    setIsAddDialogOpen(true)
  }

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m)
    setName(m.name)
    setEmail(m.email)
    setRole(m.role)
    setSpecialty(m.specialty || '')
    setIsAddDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!name || !email) {
      toast.error('Nombre y email son obligatorios')
      return
    }

    if (editingMember) {
      updateMember(editingMember.id, { name, email, role, specialty })
      toast.success('Miembro actualizado')
    } else {
      addMember({ name, email, role, specialty })
      toast.success('Miembro añadido al equipo')
    }
    setIsAddDialogOpen(false)
  }

  const handleToggleStatus = (m: TeamMember) => {
    updateMember(m.id, { active: !m.active })
    toast.info(`Miembro ${m.active ? 'desactivado' : 'activado'}`)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Breadcrumbs items={[{ label: 'Admin', href: '#' }, { label: 'Equipo' }]} />
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Gestión de Equipo
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Administra los roles y perfiles del equipo local para la asignación de tareas técnicass.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl gap-2 font-bold shadow-xl shadow-primary/20">
          <UserPlus className="h-5 w-5" />
          Añadir Miembro
        </Button>
      </div>

      {/* Stats/Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/50 border border-border/50 p-6 rounded-3xl space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Equipo</p>
          <p className="text-3xl font-black text-foreground">{members.length}</p>
        </div>
        <div className="bg-card/50 border border-border/50 p-6 rounded-3xl space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Activos</p>
          <p className="text-3xl font-black text-foreground">{members.filter(m => m.active).length}</p>
        </div>
        <div className="bg-card/50 border border-border/50 p-6 rounded-3xl space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Roles Definidos</p>
          <p className="text-3xl font-black text-foreground">{new Set(members.map(m => m.role)).size}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre, email o especialidad..." 
            className="pl-12 h-14 bg-card/40 border-border/50 rounded-2xl text-lg font-medium focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => { void setSearchTerm(e.target.value || null) }}
          />
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-primary/5">
           <Button 
            variant={groupBy === 'none' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-xl font-bold text-xs h-10"
            onClick={() => { void setGroupBy('none') }}
          >
             Sin Agrupar
           </Button>
           <Button 
            variant={groupBy === 'role' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-xl font-bold text-xs h-10"
            onClick={() => { void setGroupBy('role') }}
          >
             Por Rol
           </Button>
           <Button 
            variant={groupBy === 'specialty' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="rounded-xl font-bold text-xs h-10"
            onClick={() => { void setGroupBy('specialty') }}
          >
             Por Especialidad
           </Button>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/50">
          <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No hay miembros registrados</h3>
          <p className="text-muted-foreground mt-2 font-medium">Comienza por añadir a tu primer compañero de equipo.</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> Crear Ahora
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedData).map(([groupTitle, groupMembers]) => (
            <div key={groupTitle} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black uppercase tracking-widest text-primary/60 flex items-center gap-3">
                   {groupBy === 'role' && <Filter className="h-5 w-5" />}
                   {groupBy === 'specialty' && <BarChart2 className="h-5 w-5" />}
                   {groupTitle}
                   <Badge variant="outline" className="ml-2 bg-primary/5 border-primary/20 text-primary">{groupMembers.length}</Badge>
                </h2>
                <div className="h-px bg-gradient-to-r from-primary/10 to-transparent flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupMembers.map(m => {
                  const config = roleConfig[m.role]
                  const RoleIcon = config.icon
                  return (
                    <div 
                      key={m.id} 
                      className={cn(
                        "group relative bg-card hover:bg-card/80 border border-border/50 p-6 rounded-[2rem] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
                        !m.active && "opacity-60 grayscale-[0.5]"
                      )}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-2xl font-black text-primary">
                                {m.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {m.active && (
                            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-500/20" />
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                            <DropdownMenuItem onClick={() => { handleOpenEdit(m) }} className="rounded-xl gap-2 font-bold py-2.5">
                              <Edit className="h-4 w-4" /> Editar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { handleToggleStatus(m) }} className="rounded-xl gap-2 font-bold py-2.5">
                              {m.active ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4 text-emerald-500" />}
                              {m.active ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <div className="h-px bg-border my-1 mx-1" />
                            <DropdownMenuItem onClick={() => { removeMember(m.id); toast.error('Miembro eliminado') }} className="rounded-xl gap-2 font-bold py-2.5 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xl font-black tracking-tight text-foreground truncate">{m.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {m.email}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
                        <Badge variant="secondary" className={cn("rounded-lg px-2 py-0.5 font-black uppercase text-[10px] tracking-widest border-none", config.bg, config.color)}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        {m.specialty && (
                          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">
                            {m.specialty}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              {editingMember ? <Edit className="h-6 w-6 text-primary" /> : <UserPlus className="h-6 w-6 text-primary" />}
              {editingMember ? 'Editar Perfil' : 'Añadir al Equipo'}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Completa los datos del desarrollador para habilitar la asignación de tareas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6 font-bold">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Nombre Completo</Label>
              <Input 
                value={name} 
                onChange={(e) => { setName(e.target.value) }} 
                placeholder="Ej: John Doe"
                className="h-12 bg-muted/30 border-none rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Correo Corporativo</Label>
              <Input 
                value={email} 
                onChange={(e) => { setEmail(e.target.value) }} 
                placeholder="john.doe@company.com"
                className="h-12 bg-muted/30 border-none rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Rol</Label>
                <Select value={role} onValueChange={(v: TeamRole) => { setRole(v) }}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl font-bold">
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="lead">Team Lead</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="qa">QA Engineer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Especialidad</Label>
                <Input 
                  value={specialty} 
                  onChange={(e) => { setSpecialty(e.target.value) }} 
                  placeholder="Backend, DevOps..."
                  className="h-12 bg-muted/30 border-none rounded-xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => { setIsAddDialogOpen(false) }} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="rounded-xl px-8 font-black shadow-lg shadow-primary/20">
              {editingMember ? 'Guardar Cambios' : 'Añadir Miembro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
