import { Users, UserPlus } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface TeamHeaderProps {
 memberCount: number
 onAddMember: () => void
}

export function TeamHeader({ onAddMember }: TeamHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Gestión de Equipo' }, { label: 'Talento Operativo' }]} />
 <div className="flex items-center gap-4 pt-4">
 <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 border border-primary/10 shadow-inner">
 <Users className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">
 Talento Operativo
 </h1>
 <p className="text-muted-foreground font-medium mt-1">
 Gestión centralizada de especialistas y roles.
 </p>
 </div>
 </div>
 </div>
 <Button 
 size="sm"
 onClick={onAddMember} 
 className="rounded-lg gap-2"
 >
 <UserPlus className="h-4 w-4" /> Integrar Miembro
 </Button>
 </header>
 )
}
