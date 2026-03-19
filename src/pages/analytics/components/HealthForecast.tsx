import { Card } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import { useNavigate } from 'react-router-dom'

interface HealthForecastProps {
 data: {
 dayNum: string
 dayName: string
 hours: number
 stories: number
 }[]
}

export function HealthForecast({ data }: HealthForecastProps) {
 const navigate = useNavigate()
 return (
 <Card className="rounded-xl border-border/40 bg-card p-8 flex flex-col justify-between shadow-lg">
 <div className="space-y-6">
 <div className="space-y-1 text-center md:text-left">
 <h3 className="text-lg font-semibold italic">Forecast Diario</h3>
 <p className="text-xs font-bold text-muted-foreground opacity-40">Ritmo Sugerido</p>
 </div>
 <div className="space-y-5">
 {data.map((day, idx) => (
 <div key={idx} className="flex items-center justify-between group">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-semibold text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
 {day.dayNum}
 </div>
 <div className="text-xs font-medium opacity-40 group-hover:opacity-100 transition-opacity">
 {day.dayName}
 </div>
 </div>
 <div className="flex flex-col items-end">
 <span className="text-sm font-semibold">+{day.hours}h</span>
 <span className="text-xs font-bold text-primary/70">{day.stories} historias</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 <Button variant="outline" className="mt-8 rounded-xl border-dashed font-semibold text-xs h-10 hover:bg-secondary/50" onClick={() => { void navigate('/editor') }}>
 Optimizar Sprint
 </Button>
 </Card>
 )
}
