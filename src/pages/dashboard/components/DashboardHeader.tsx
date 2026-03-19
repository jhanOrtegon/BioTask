import { BookOpen, RefreshCcw, PenLine, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/button'
import { Breadcrumbs } from '@/shared/components/breadcrumbs'
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/components/tooltip'

interface DashboardHeaderProps {
 role: string | null
 onGenerateReport: () => void
 onSeed: () => void
 onSync: () => void
 onQuickTask: () => void
 onNewStory: () => void
}

export function DashboardHeader({
 role,
 onGenerateReport,
 onSeed,
 onSync,
 onQuickTask,
 onNewStory
}: DashboardHeaderProps) {
 return (
 <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
 <div className="space-y-1">
 <Breadcrumbs items={[{ label: 'BioTask' }, { label: 'Panel Principal' }]} />
 <div className="flex items-center gap-2 pt-0.5">
 <h1 className="text-xl font-bold tracking-tight text-foreground">
 Panel <span className="text-primary">Principal</span>
 </h1>
 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {role !== 'Editor' && (
 <>
 <TooltipProvider>
 <ShadcnTooltip>
 <TooltipTrigger asChild>
 <Button variant="ghost" size="icon" onClick={onSync}>
 <RefreshCcw className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs">Reparar datos</TooltipContent>
 </ShadcnTooltip>
 </TooltipProvider>

 <TooltipProvider>
 <ShadcnTooltip>
 <TooltipTrigger asChild>
 <Button variant="ghost" size="icon" onClick={onSeed}>
 <Sparkles className="h-4 w-4" />
 </Button>
 </TooltipTrigger>
 <TooltipContent className="text-xs">Inicializar demo</TooltipContent>
 </ShadcnTooltip>
 </TooltipProvider>

 <Button variant="outline" size="sm" onClick={onGenerateReport} className="gap-1.5">
 <BookOpen className="h-3.5 w-3.5" /> Reporte
 </Button>

 <Button variant="outline" size="sm" onClick={onQuickTask} className="gap-1.5">
 <PenLine className="h-3.5 w-3.5" /> Tarea Rápida
 </Button>

 <Button size="sm" onClick={onNewStory} className="gap-1.5">
 <Plus className="h-3.5 w-3.5" /> Nueva Historia
 </Button>
 </>
 )}
 </div>
 </header>
 )
}
