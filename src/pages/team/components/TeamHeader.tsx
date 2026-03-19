import { Users, UserPlus } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface TeamHeaderProps {
 memberCount: number
 onAddMember: () => void
}

export function TeamHeader({ onAddMember }: TeamHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Gestión de Equipo' }, { label: 'Talento Operativo' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-semibold tracking-tight text-foreground">
 Talento <span className="text-primary">Operativo</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <Users className="h-3 w-3 text-primary" />
 </div>
 </div>
 <p className="text-sm font-medium text-muted-foreground/60">
 Gestión centralizada de especialistas y roles.
 </p>
 </div>
 <Button
 size="sm"
 onClick={onAddMember}
 className="rounded-lg gap-2 font-semibold"
 >
 <UserPlus className="h-4 w-4" /> Integrar Miembro
 </Button>
 </header>
 )
}
