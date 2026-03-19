import { Calendar } from 'lucide-react'
import { Button } from '@/shared/components/button'

interface BoardEmptyStateProps {
 onNavigateToSprints: () => void
}

export function BoardEmptyState({ onNavigateToSprints }: BoardEmptyStateProps) {
 return (
 <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl bg-muted/5 p-12 text-center">
 <div className="h-20 w-20 rounded-xl bg-primary/5 border border-primary/10 grid place-items-center mb-6">
 <Calendar className="h-10 w-10 text-primary/40" />
 </div>
 <h2 className="text-xl font-semibold mb-2">No hay un sprint seleccionado</h2>
 <p className="text-muted-foreground max-w-[300px] mb-8 font-medium">
 Inicia o selecciona un sprint para ver las tareas en el tablero.
 </p>
 <Button onClick={onNavigateToSprints} className="rounded-xl px-8 font-semibold">
 Gestión de Sprints
 </Button>
 </div>
 )
}
