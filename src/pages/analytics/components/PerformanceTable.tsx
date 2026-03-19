import { Badge } from '@/shared/components/badge'
import { Activity, AlertCircle, ThumbsUp } from 'lucide-react'
import { cn } from '@/shared/utils'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/shared/components/table'
import { Pagination } from '@/shared/components/pagination'
import type { DevPerformance } from '../types'

interface PerformanceTableProps {
 data: DevPerformance[]
 currentPage: number
 totalPages: number
 onPageChange: (page: number) => void
}

export function PerformanceTable({ data, currentPage, totalPages, onPageChange }: PerformanceTableProps) {
 return (
 <div className="h-full flex flex-col space-y-4">
 <div className="shrink-0 flex items-center justify-between">
 <h3 className="text-xl font-semibold italic flex items-center gap-2">
 <Activity className="h-5 w-5 text-primary" /> Daily Lab Sync
 </h3>
 <Badge className="bg-primary/20 text-primary animate-pulse border-none">LIVE TRACKING</Badge>
 </div>
 
 <div className="biotask-table-container">
 <div className="overflow-x-auto w-full">
 <Table>
 <TableHeader>
 <TableRow className="border-none hover:bg-transparent !bg-transparent">
 <TableHead>Especialista</TableHead>
 <TableHead className="text-center">Hoy (h)</TableHead>
 <TableHead className="text-center">Tareas Activas</TableHead>
 <TableHead>Insight Estratégico</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {data.map(dev => (
 <TableRow key={dev.id}>
 <TableCell>
 <div className="flex items-center gap-3">
 <img src={dev.avatar} className="h-10 w-10 rounded-xl border border-border" alt="" />
 <div>
 <p className="text-sm font-semibold">{dev.name}</p>
 <p className="text-xs font-bold text-muted-foreground">{dev.specialty}</p>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-center">
 <span className={cn(
"text-[13px] font-semibold px-3 py-1 rounded-lg",
 dev.todayHours > 6 ?"bg-emerald-500/10 text-emerald-500" :"bg-muted text-muted-foreground"
 )}>
 {dev.todayHours.toFixed(1)}
 </span>
 </TableCell>
 <TableCell className="text-center">
 <div className="flex justify-center gap-2 text-sm font-semibold">
 <span className="text-emerald-500">{dev.completedTasks}✓</span>
 <span className="text-blue-500">{dev.activeTasks}⚡</span>
 <span className="text-red-500">{dev.blockedTasks}🚩</span>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 {dev.status === 'danger' ? <AlertCircle className="h-4 w-4 text-red-500" /> : 
 dev.status === 'success' ? <ThumbsUp className="h-4 w-4 text-emerald-500" /> : 
 <Activity className="h-4 w-4 text-muted-foreground opacity-30" />}
 <span className={cn(
"text-sm font-bold italic",
 dev.status === 'danger' ?"text-red-500" : 
 dev.status === 'success' ?"text-emerald-600" : 
"text-muted-foreground"
 )}>
 {dev.insight}
 </span>
 </div>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 </div>
 <div className="pt-3">
 <Pagination 
 currentPage={currentPage}
 totalPages={totalPages}
 onPageChange={onPageChange}
 />
 </div>
 </div>
 )
}
