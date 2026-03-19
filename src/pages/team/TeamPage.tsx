import { useState, useMemo } from 'react'
import { useTeamStore } from '@/features/team/store'
import type { TeamMember, TeamRole } from '@/features/team/types'
import { 
 ShieldCheck, 
 ShieldAlert, 
 ShieldQuestion,
 Filter,
 BarChart2,
 Users
} from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { toast } from 'sonner'
import { Pagination } from '@/shared/components/pagination'

import { TeamHeader } from './components/TeamHeader'
import { TeamFilters } from './components/TeamFilters'
import { TeamMemberCard } from './components/TeamMemberCard'
import { MemberDialog } from './components/MemberDialog'

const roleConfig: Record<TeamRole, { label: string; icon: React.ElementType; color: string; bg: string }> = {
 admin: { label: 'Admin', icon: ShieldCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
 lead: { label: 'Lead', icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
 developer: { label: 'Dev', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
 qa: { label: 'QA', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
 designer: { label: 'Design', icon: ShieldQuestion, color: 'text-purple-500', bg: 'bg-purple-500/10' }
}

export function TeamPage() {
 const { members, addMember, updateMember, removeMember } = useTeamStore()
 const [searchTerm, setSearchTerm] = useState('')
 const [groupBy, setGroupBy] = useState('none')
 
 const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
 const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

 // Form states
 const [name, setName] = useState('')
 const [email, setEmail] = useState('')
 const [role, setRole] = useState<TeamRole>('developer')
 const [specialty, setSpecialty] = useState('')

 const [currentPage, setCurrentPage] = useState(1)
 const [itemsPerPage, setItemsPerPage] = useState(12)

 const filteredMembers = members.filter(m => 
 m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
 m.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
 )

 const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
 const paginatedMembers = useMemo(() => {
 const start = (currentPage - 1) * itemsPerPage
 return filteredMembers.slice(start, start + itemsPerPage)
 }, [filteredMembers, currentPage, itemsPerPage])

 const groupedData = useMemo(() => {
 if (groupBy === 'role') {
 return members.reduce<Record<string, TeamMember[]>>((acc, m) => {
 const key = m.role
 if (!acc[key]) acc[key] = []
 acc[key].push(m)
 return acc
 }, {})
 }
 if (groupBy === 'specialty') {
 return members.reduce<Record<string, TeamMember[]>>((acc, m) => {
 const key = m.specialty || 'General'
 if (!acc[key]) acc[key] = []
 acc[key].push(m)
 return acc
 }, {})
 }
 return { 'Talento Global': paginatedMembers }
 }, [paginatedMembers, groupBy, members])

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
 <div className="min-h-full bg-background p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 relative">
 <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
 <TeamHeader 
 memberCount={members.length} 
 onAddMember={handleOpenAdd} 
 />

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <div className="relative group bg-card border border-border/40 p-6 rounded-xl overflow-hidden transition-all hover:border-primary/20 shadow-sm">
 <div className="relative z-10 flex justify-between items-start">
 <div className="space-y-1.5">
 <p className="text-xs font-medium text-muted-foreground/60">Total Miembros</p>
 <p className="text-3xl font-semibold text-foreground lining-nums">{members.length}</p>
 </div>
 <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary/5 text-primary border border-primary/10 group-hover:scale-105 transition-transform duration-500">
 <Users className="h-5 w-5 opacity-70" />
 </div>
 </div>
 <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20" />
 </div>

 <div className="relative group bg-card border border-border/40 p-6 rounded-xl overflow-hidden transition-all hover:border-emerald-500/20 shadow-sm">
 <div className="relative z-10 flex justify-between items-start">
 <div className="space-y-1.5">
 <p className="text-xs font-medium text-emerald-600/60">Activos</p>
 <p className="text-3xl font-semibold text-foreground lining-nums">{members.filter(m => m.active).length}</p>
 </div>
 <div className="grid place-items-center h-10 w-10 rounded-xl bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 group-hover:scale-105 transition-transform duration-500">
 <ShieldCheck className="h-5 w-5 opacity-70" />
 </div>
 </div>
 <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20" />
 </div>

 <div className="relative group bg-card border border-border/40 p-6 rounded-xl overflow-hidden transition-all hover:border-rose-500/20 shadow-sm">
 <div className="relative z-10 flex justify-between items-start">
 <div className="space-y-1.5">
 <p className="text-xs font-medium text-rose-600/60">Roles Definidos</p>
 <p className="text-3xl font-semibold text-foreground lining-nums">{new Set(members.map(m => m.role)).size}</p>
 </div>
 <div className="grid place-items-center h-10 w-10 rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 group-hover:scale-105 transition-transform duration-500">
 <ShieldAlert className="h-5 w-5 opacity-70" />
 </div>
 </div>
 <div className="absolute bottom-0 left-0 h-1 w-full bg-rose-500/20" />
 </div>
 </div>

 <TeamFilters 
 searchTerm={searchTerm}
 setSearchTerm={setSearchTerm}
 groupBy={groupBy}
 setGroupBy={setGroupBy}
 />

 {filteredMembers.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 bg-card/10 rounded-xl border-2 border-dashed border-border/40 animate-in zoom-in-95 duration-500">
 <h3 className="text-xl font-semibold tracking-tight text-foreground/80">Sin resultados</h3>
 <p className="text-xs text-muted-foreground/60 mt-1 font-medium">Prueba con otra búsqueda o agrega un nuevo miembro.</p>
 </div>
 ) : (
 <div className="space-y-12">
 {Object.entries(groupedData).map(([groupTitle, groupMembers]) => (
 <div key={groupTitle} className="space-y-6">
 <div className="flex items-center gap-4">
 <h2 className="text-xs font-semibold text-muted-foreground/40 flex items-center gap-3">
 {groupBy === 'role' && <Filter className="h-3.5 w-3.5 opacity-50" />}
 {groupBy === 'specialty' && <BarChart2 className="h-3.5 w-3.5 opacity-50" />}
 {groupTitle}
 <Badge variant="outline" className="ml-2 font-semibold border-border/50 px-2 py-0 text-xs text-muted-foreground/60 lining-nums">{groupMembers.length}</Badge>
 </h2>
 <div className="h-[1px] bg-border/20 flex-1" />
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {groupMembers.map(m => (
 <TeamMemberCard 
 key={m.id}
 member={m}
 roleConfig={roleConfig}
 onEdit={handleOpenEdit}
 onToggleStatus={handleToggleStatus}
 onRemove={(id) => { removeMember(id); toast.error('Miembro eliminado'); }}
 />
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 {filteredMembers.length > 0 && (
 <div>
 <Pagination 
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={setCurrentPage}
 totalItems={filteredMembers.length}
 itemsPerPage={itemsPerPage}
 onItemsPerPageChange={(v) => {
 setItemsPerPage(v);
 setCurrentPage(1);
 }}
 itemsPerPageOptions={[6, 12, 24, 48]}
 />
 </div>
 )}
 </div>

 <MemberDialog 
 open={isAddDialogOpen}
 onOpenChange={setIsAddDialogOpen}
 editingMember={editingMember}
 name={name}
 setName={setName}
 email={email}
 setEmail={setEmail}
 role={role}
 setRole={setRole}
 specialty={specialty}
 setSpecialty={setSpecialty}
 onSubmit={handleSubmit}
 />
 </div>
 )
}
