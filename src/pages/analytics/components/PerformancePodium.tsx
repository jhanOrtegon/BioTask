import { Card, CardContent } from '@/shared/components/card'
import { Crown, Medal } from 'lucide-react'
import { cn } from '@/shared/utils'
import type { DevPerformance } from '../types'

interface PerformancePodiumProps {
 top3: DevPerformance[]
}

export function PerformancePodium({ top3 }: PerformancePodiumProps) {
 return (
 <div className="lg:col-span-1 space-y-6">
 <h3 className="text-xl font-semibold italic flex items-center gap-2">
 <Crown className="h-5 w-5 text-amber-500" /> Bio-Hall of Fame
 </h3>
 {top3.map((dev, idx) => (
 <Card key={dev.id} className={cn(
"relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02]",
 idx === 0 ?"bg-amber-500/10 border-amber-500/20 shadow-xl shadow-amber-500/5" :"bg-card border-border/40"
 )}>
 <CardContent className="p-6">
 <div className="flex items-center gap-4">
 <div className="relative">
 <img src={dev.avatar} alt="" className="h-16 w-16 rounded-xl border-2 border-background shadow-lg" />
 <div className={cn(
"absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-background",
 idx === 0 ?"bg-amber-500 text-white" :"bg-muted text-muted-foreground"
 )}>{idx + 1}</div>
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-lg font-semibold truncate">{dev.name}</p>
 <p className="text-xs font-semibold text-muted-foreground">{dev.specialty}</p>
 </div>
 {idx === 0 && <Medal className="h-8 w-8 text-amber-500 animate-pulse" />}
 </div>
 <div className="mt-6 grid grid-cols-2 gap-4">
 <div className="bg-background/50 p-3 rounded-xl">
 <span className="block text-xs font-semibold text-muted-foreground">Eficiencia</span>
 <span className="text-xl font-semibold text-primary">{dev.efficiency}%</span>
 </div>
 <div className="bg-background/50 p-3 rounded-xl">
 <span className="block text-xs font-semibold text-muted-foreground">Total Invertido</span>
 <span className="text-xl font-semibold text-foreground">{dev.totalHours.toFixed(1)}h</span>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )
}
