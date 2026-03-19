import { 
 flexRender, 
 type Table as ReactTableType 
} from '@tanstack/react-table'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/shared/components/table'
import { Layers } from 'lucide-react'
import { Button } from '@/shared/components/button'
import type { Template } from '@/features/templates/types'

interface TemplateTableProps {
 table: ReactTableType<Template>
 columnCount: number
 role: string | null
 onOpenCreate: () => void
}

export function TemplateTable({ table, columnCount, role, onOpenCreate }: TemplateTableProps) {
 return (
 <div className="biotask-table-container">
 <div className="overflow-x-auto w-full">
 <Table>
 <TableHeader>
 {table.getHeaderGroups().map((headerGroup) => (
 <TableRow key={headerGroup.id} className="border-none hover:bg-transparent !bg-transparent">
 {headerGroup.headers.map((header) => (
 <TableHead key={header.id}>
 {header.isPlaceholder
 ? null
 : flexRender(
 header.column.columnDef.header,
 header.getContext()
 )}
 </TableHead>
 ))}
 </TableRow>
 ))}
 </TableHeader>
 <TableBody>
 {table.getRowModel().rows.length ? (
 table.getRowModel().rows.map((row) => (
 <TableRow
 key={row.id}
 data-state={row.getIsSelected() && "selected"}
 className="group"
 >
 {row.getVisibleCells().map((cell) => (
 <TableCell key={cell.id}>
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </TableCell>
 ))}
 </TableRow>
 ))
 ) : (
 <TableRow className="hover:bg-transparent">
 <TableCell colSpan={columnCount} className="h-48 text-center">
 <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
 <div className="h-14 w-14 rounded-xl bg-muted/30 flex items-center justify-center">
 <Layers className="h-7 w-7 opacity-20" />
 </div>
 <div className="space-y-1">
 <p className="text-sm font-bold text-foreground/50">Sin plantillas creadas</p>
 <p className="text-xs text-muted-foreground/50">Crea tu primera plantilla para agilizar el trabajo</p>
 </div>
 {role !== 'Editor' && (
 <Button variant="outline" size="sm" onClick={onOpenCreate} className="mt-1 text-xs font-bold rounded-lg border-border/60 hover:bg-secondary/50">
 Crear la primera
 </Button>
 )}
 </div>
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 </div>
 </div>
 )
}
