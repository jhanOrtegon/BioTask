import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { BrainCircuit, AlertTriangle, ChevronRight } from 'lucide-react'

interface SmartInsightProps {
 insight: { id: string; title: string; message: string; bottleneck?: string } | null
 onActionPlan: (id: string) => void
}

export function SmartInsight({ insight, onActionPlan }: SmartInsightProps) {
 if (!insight) return null

 return (
 <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-2xl shadow-primary/5 group animate-in fade-in slide-in-from-top-4 duration-1000">
 <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />
 
 <div className="relative flex flex-col md:flex-row items-center gap-8">
 <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-primary shadow-2xl shadow-primary/40 group-hover:scale-110 transition-transform duration-500">
 <BrainCircuit className="h-10 w-10 text-primary-foreground animate-pulse" />
 </div>
 <div className="flex-1 space-y-3">
 <div className="flex items-center gap-3">
 <h3 className="text-xl font-semibold tracking-tight">{insight.title}</h3>
 <Badge className="bg-primary text-primary-foreground border-none text-xs font-semibold px-3 py-0.5 rounded-full">Management v5.0</Badge>
 </div>
 <p className="text-base text-muted-foreground font-semibold max-w-3xl leading-relaxed">
 {insight.message}
 {insight.bottleneck && (
 <span className="text-foreground block mt-2 p-3 bg-card/50 rounded-xl border border-border/50">
 <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-500" />
 <span className="text-xs font-semibold text-amber-500/80 mr-2">Cuello de Botella:</span>
 <span className="font-bold underline decoration-primary/30 decoration-primary underline-offset-4">{insight.bottleneck}</span>
 </span>
 )}
 </p>
 </div>
 <Button 
 size="lg" 
 className="rounded-xl font-semibold gap-2 shadow-xl shadow-primary/20 px-8"
 onClick={() => { onActionPlan(insight.id); }}
 >
 Análisis Proactive <ChevronRight className="h-5 w-5" />
 </Button>
 </div>
 </div>
 )
}
