import { Button } from '@/shared/components/button'
import { Plus, BookOpen } from 'lucide-react'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'

interface StoriesHeaderProps {
 onNewStory: () => void
}

export function StoriesHeader({ onNewStory }: StoriesHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-2">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'Planificación' }, { label: 'Historias de Usuario' }]} />
 <div className="flex items-center gap-2.5 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Historias de <span className="text-primary">Usuario</span>
 </h1>
 <div className="grid place-items-center h-6 w-6 rounded-lg bg-primary/10 border border-primary/20">
 <BookOpen className="h-3 w-3 text-primary" />
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button size="sm" onClick={onNewStory} className="gap-1.5">
 <Plus className="h-3.5 w-3.5" /> Nueva Historia
 </Button>
 </div>
 </header>
 )
}
