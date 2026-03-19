import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/shared/components/table'
import { Pagination } from '@/shared/components/pagination'

interface DevLoadEntry {
 name: string
 Horas: number
 Tareas: number
}

interface LoadTableProps {
 data: DevLoadEntry[]
 currentPage: number
 totalPages: number
 onPageChange: (page: number) => void
}

export function LoadTable({ data, currentPage, totalPages, onPageChange }: LoadTableProps) {
 return (
 <div className="flex flex-col flex-1 mt-4">
 <div className="biotask-table-container">
 <div className="overflow-x-auto w-full">
 <Table>
 <TableHeader>
 <TableRow className="border-none hover:bg-transparent !bg-transparent">
 <TableHead>Desarrollador</TableHead>
 <TableHead>Tareas Activas</TableHead>
 <TableHead>Total Horas</TableHead>
 <TableHead>Carga Relativa</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {data.map((dev, i) => (
 <TableRow key={i}>
 <TableCell>
 <span className="text-sm font-semibold group-hover:text-primary transition-colors">{dev.name}</span>
 </TableCell>
 <TableCell>
 <span className="text-sm font-bold font-mono">{dev.Tareas}</span>
 </TableCell>
 <TableCell>
 <span className="text-sm font-semibold italic">{dev.Horas}h</span>
 </TableCell>
 <TableCell className="min-w-[200px]">
 <div className="flex items-center gap-3">
 <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
 <div className="h-full bg-primary/50 transition-all duration-1000" style={{ width: `${Math.min((dev.Horas / 40) * 100, 100).toFixed(0)}%` }} />
 </div>
 <span className="text-xs font-semibold opacity-40">{Math.round((dev.Horas / 40) * 100)}%</span>
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
