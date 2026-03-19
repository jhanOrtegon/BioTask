import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { MoreVertical, Rocket, Target, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/shared/utils'
import type { Epic } from '@/features/epics/types'

interface EpicCardProps {
 epic: Epic & { storyCount: number; taskCount: number; formattedTime: string; calculatedProgress: number }
 onEdit: (epic: Epic) => void
 onAnalyze: (id: string) => void
}

export function EpicCard({ epic, onEdit, onAnalyze }: EpicCardProps) {
 return (
 <Card className="group relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/60 backdrop-blur-sm rounded-xl">
 <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: epic.color }} />
 
 <CardHeader className="pb-3 pt-6 px-6">
 <div className="flex items-start justify-between">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 <span className="font-mono text-xs font-semibold text-muted-foreground/60 tracking-wide bg-muted px-2 py-0.5 rounded-md uppercase">
 {epic.code}
 </span>
 <Badge 
 variant="outline" 
 className={cn(
 "text-xs font-medium px-2 py-0 rounded-md",
 epic.status === 'active' ? "border-primary/20 text-primary bg-primary/5" :
 epic.status === 'completed' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
 "border-muted text-muted-foreground bg-muted/10"
 )}
 >
 {epic.status}
 </Badge>
 </div>
 <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors leading-tight lining-nums">
 {epic.title}
 </CardTitle>
 </div>
 <Button 
 variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity"
 onClick={() => { onEdit(epic); }}
 >
 <MoreVertical className="h-4 w-4" />
 </Button>
 </div>
 </CardHeader>

 <CardContent className="space-y-6 px-6 pb-6">
 <p className="text-xs text-muted-foreground/80 font-medium line-clamp-2 leading-relaxed">
 {epic.description || 'Sin descripción detallada.'}
 </p>

 <div className="grid grid-cols-3 gap-3 border-y border-border/10 py-4">
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-muted-foreground/40">
 <Rocket className="h-3 w-3" />
 <span className="text-xs font-medium">Stories</span>
 </div>
 <p className="text-base font-semibold text-foreground lining-nums">{epic.storyCount}</p>
 </div>
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-muted-foreground/40">
 <Target className="h-3 w-3" />
 <span className="text-xs font-medium">Tasks</span>
 </div>
 <p className="text-base font-semibold text-foreground lining-nums">{epic.taskCount}</p>
 </div>
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5 text-primary/40">
 <Clock className="h-3 w-3" />
 <span className="text-xs font-medium text-muted-foreground/60">Burned</span>
 </div>
 <p className="text-base font-semibold text-foreground lining-nums">{epic.formattedTime}</p>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-muted-foreground/60 flex items-center gap-1.5">
 <TrendingUp className="h-3 w-3 text-primary opacity-50" /> Progreso
 </span>
 <span className="text-primary font-semibold text-xs lining-nums">{epic.calculatedProgress}%</span>
 </div>
 <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
 <div 
 className="h-full bg-primary transition-all duration-1000 ease-out rounded-full shadow-sm shadow-primary/10"
 style={{ width: `${String(epic.calculatedProgress)}%`, backgroundColor: epic.color }}
 />
 </div>
 </div>

 <Button 
 variant="secondary" 
 className="w-full h-9 text-xs font-medium text-primary hover:bg-primary/10 rounded-xl transition-all shadow-sm"
 onClick={() => { onAnalyze(epic.id); }}
 >
 Analizar Historias
 </Button>
 </CardContent>
 </Card>
 )
}
