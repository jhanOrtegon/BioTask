import { Mail, MoreHorizontal, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Badge } from '@/shared/components/badge'
import { 
 DropdownMenu, 
 DropdownMenuContent, 
 DropdownMenuItem, 
 DropdownMenuTrigger 
} from '@/shared/components/dropdown-menu'
import { cn } from '@/shared/utils'
import type { TeamMember, TeamRole } from '@/features/team/types'

interface TeamMemberCardProps {
 member: TeamMember
 roleConfig: Record<TeamRole, { label: string; icon: React.ElementType; color: string; bg: string; strip: string }>
 onEdit: (m: TeamMember) => void
 onToggleStatus: (m: TeamMember) => void
 onRemove: (id: string) => void
}

export function TeamMemberCard({ member, roleConfig, onEdit, onToggleStatus, onRemove }: TeamMemberCardProps) {
 const config = roleConfig[member.role]
 const RoleIcon = config.icon

 return (
 <div 
 className={cn(
 "group relative overflow-hidden bg-card border border-border/40 rounded-xl transition-all duration-300 hover:border-primary/20 hover:shadow-md",
 !member.active && "opacity-60 grayscale-[0.8]"
 )}
 >
 {/* Top color accent */}
 <div className={cn("h-[3px] w-full shrink-0", config.strip)} />

 <div className="p-4">
 <div className="flex items-start justify-between mb-4">
 <div className="relative">
 <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden">
 {member.avatarUrl ? (
 <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
 ) : (
 <span className="text-xl font-semibold text-primary/40">
 {member.name.charAt(0).toUpperCase()}
 </span>
 )}
 </div>
 {member.active && (
 <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card shadow-sm" />
 )}
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md opacity-40 group-hover:opacity-100 transition-opacity">
 <MoreHorizontal className="h-3.5 w-3.5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 backdrop-blur-xl bg-popover/90 border-border/40 shadow-2xl">
 <DropdownMenuItem onClick={() => { onEdit(member); }} className="rounded-lg gap-2 font-semibold py-2 text-xs text-foreground/70">
 <Edit className="h-3.5 w-3.5" /> Editar
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { onToggleStatus(member); }} className="rounded-lg gap-2 font-semibold py-2 text-xs text-foreground/70">
 {member.active ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5 text-emerald-500" />}
 {member.active ? 'Suspender' : 'Reintegrar'}
 </DropdownMenuItem>
 <div className="h-px bg-border/20 my-1 mx-1" />
 <DropdownMenuItem onClick={() => { onRemove(member.id); }} className="rounded-lg gap-2 font-semibold py-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600">
 <Trash2 className="h-3.5 w-3.5" /> Eliminar
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="space-y-0.5 min-w-0">
 <h3 className="text-sm font-semibold tracking-tight text-foreground/90 truncate">{member.name}</h3>
 <p className="text-xs font-medium text-muted-foreground/50 truncate flex items-center gap-1.5">
 <Mail className="h-3 w-3 opacity-30" />
 {member.email}
 </p>
 </div>

 <div className="mt-4 pt-3 border-t border-border/10 flex items-center justify-between">
 <Badge variant="secondary" className={cn("rounded-md px-2 py-0.5 font-semibold text-xs border-none flex items-center gap-1", config.bg, config.color)}>
 <RoleIcon className="h-2.5 w-2.5 opacity-70" />
 {config.label}
 </Badge>
 {member.specialty && (
 <span className="text-xs font-medium text-muted-foreground/30 truncate max-w-[90px] text-right">
 {member.specialty}
 </span>
 )}
 </div>
 </div>
 </div>
 )
}
