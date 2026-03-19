import { Plus, LayoutGrid } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface TemplateHeaderProps {
 onAdd: () => void
}

export function TemplateHeader({ onAdd }: TemplateHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Bio-Configuración' }, { label: 'Librería de Estructuras' }]} />
 <div className="flex items-center gap-4 pt-4">
 <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 border border-primary/10 shadow-inner">
 <LayoutGrid className="h-8 w-8 text-primary" />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground">
 Librería de Estructuras
 </h1>
 <p className="text-muted-foreground font-medium mt-1">
 Protocolos predefinidos para la creación ágil de historias.
 </p>
 </div>
 </div>
 </div>
 <Button 
 size="sm"
 onClick={onAdd}
 className="rounded-lg gap-2"
 >
 <Plus className="h-4 w-4" /> Nueva Estructura
 </Button>
 </header>
 )
}
