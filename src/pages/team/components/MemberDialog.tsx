import { 
 Dialog, 
 DialogContent, 
 DialogHeader, 
 DialogTitle, 
 DialogDescription,
 DialogFooter
} from '@/shared/components/dialog'
import { Button } from '@/shared/components/button'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { 
 Select, 
 SelectContent, 
 SelectItem, 
 SelectTrigger, 
 SelectValue 
} from '@/shared/components/select'
import { Edit, UserPlus } from 'lucide-react'
import type { TeamMember, TeamRole } from '@/features/team/types'

interface MemberDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 editingMember: TeamMember | null
 name: string
 setName: (v: string) => void
 email: string
 setEmail: (v: string) => void
 role: TeamRole
 setRole: (v: TeamRole) => void
 specialty: string
 setSpecialty: (v: string) => void
 onSubmit: () => void
}

export function MemberDialog({
 open,
 onOpenChange,
 editingMember,
 name,
 setName,
 email,
 setEmail,
 role,
 setRole,
 specialty,
 setSpecialty,
 onSubmit
}: MemberDialogProps) {
 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="sm:max-w-[450px] rounded-xl px-6 py-8">
 <DialogHeader className="space-y-1">
 <DialogTitle className="text-xl font-semibold flex items-center gap-2">
 <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
 {editingMember ? <Edit className="h-4 w-4 text-primary" /> : <UserPlus className="h-4 w-4 text-primary" />}
 </div>
 {editingMember ? 'Actualizar Perfil' : 'Integrar Talento'}
 </DialogTitle>
 <DialogDescription className="text-sm font-medium text-muted-foreground/80 mt-1">
 Gestión de identificadores y roles de la célula.
 </DialogDescription>
 </DialogHeader>

 <div className="space-y-5 py-6">
 <div className="space-y-2">
 <Label className="text-xs font-semibold text-muted-foreground pl-1">Identidad de Usuario</Label>
				<Input 
					value={name} 
					onChange={(e) => { setName(e.target.value); }} 
					placeholder="Nombre del colaborador"
					className="h-10 bg-muted/20 border-border/50 rounded-xl font-medium text-sm"
				/>
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold text-muted-foreground pl-1">Dirección BioPulse</Label>
				<Input 
					value={email} 
					onChange={(e) => { setEmail(e.target.value); }} 
					placeholder="correo@biotask.com"
					className="h-10 bg-muted/20 border-border/50 rounded-xl font-medium text-sm"
				/>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-xs font-semibold text-muted-foreground pl-1">Jerarquía</Label>
 <Select value={role} onValueChange={(v: TeamRole) => { setRole(v); }}>
 <SelectTrigger className="h-10 bg-background border-border/40 rounded-lg text-sm font-medium">
 <SelectValue />
 </SelectTrigger>
 <SelectContent className="rounded-lg border-border/40">
 <SelectItem value="admin">Administrador</SelectItem>
 <SelectItem value="lead">Team Lead</SelectItem>
 <SelectItem value="developer">Developer</SelectItem>
 <SelectItem value="qa">QA Engineer</SelectItem>
 <SelectItem value="designer">Designer</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-semibold text-muted-foreground pl-1">Stack / Tag</Label>
				<Input 
					value={specialty} 
					onChange={(e) => { setSpecialty(e.target.value); }} 
					placeholder="Ej: Backend"
					className="h-10 bg-muted/20 border-border/50 rounded-xl font-medium text-sm"
				/>
 </div>
 </div>
 </div>

 <DialogFooter className="gap-2 sm:gap-0">
 <Button variant="ghost" onClick={() => { onOpenChange(false); }} className="rounded-lg font-medium text-muted-foreground hover:text-foreground">
 Cancelar
 </Button>
 <Button 
 onClick={onSubmit} 
 className="rounded-lg px-6 h-9 font-medium shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
 >
 {editingMember ? 'Sincronizar Datos' : 'Integrar a Red'}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
