import { useMemo } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/shared/components/table'
import {
 flexRender,
 getCoreRowModel,
 useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { TrackedTask, TimeLog } from '@/features/stories/types'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/tooltip'
import { GripVertical, Eye, Edit, Play, Pause, Square, CheckCircle2, RotateCcw, AlertTriangle, AlertCircle, Info, Users, Archive } from 'lucide-react'
import { LiveTimer } from '@/features/tasks/components/LiveTimer'
import { getTaskAlertStatus } from '@/shared/utils/task-utils'
import { cn } from '@/shared/utils'
import type { TeamMember } from '@/features/team/types'

interface TaskTableProps {
 tasks: TrackedTask[]
 isReadOnly: boolean
 onDragEnd: (result: DropResult) => void
 getMemberById: (id: string) => TeamMember | null
 onStatusChange: (task: TrackedTask, newStatus: string) => void
 startTaskTimer: (storyId: string, taskId: string) => void
 pauseTaskTimer: (storyId: string, taskId: string) => void
 stopTaskTimer: (storyId: string, taskId: string) => void
 onViewTask: (task: TrackedTask) => void
 onEditTask: (task: TrackedTask) => void
 onArchiveTask: (task: TrackedTask) => void
 onResetTimer: (task: TrackedTask) => void
 formatDate: (iso: string) => string
}

export function TaskTable({
 tasks,
 isReadOnly,
 onDragEnd,
 getMemberById,
 onStatusChange,
 startTaskTimer,
 pauseTaskTimer,
 stopTaskTimer,
 onViewTask,
 onEditTask,
 onArchiveTask,
 onResetTimer,
 formatDate
}: TaskTableProps) {
 const columns = useMemo<ColumnDef<TrackedTask>[]>(
   () => [
     {
       id: "drag-handle",
       header: "",
       cell: () => (
         <div
           className={`flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary/50 transition-colors ${isReadOnly ? "opacity-0 pointer-events-none" : ""}`}
         >
           <GripVertical className="h-4 w-4" />
         </div>
       ),
     },
     {
       accessorKey: "title",
       header: "Tarea",
       cell: ({ row }) => (
         <div
           className="space-y-0.5"
           onClick={() => {
             onViewTask(row.original);
           }}
         >
           <div className="flex items-center gap-2">
             {row.original.code && (
               <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                 {row.original.code}
               </span>
             )}
             <p className="font-semibold text-foreground text-[13px]">
               {row.original.title}
             </p>
           </div>
           <p className="text-xs text-muted-foreground">
             {row.original.featureName || "Sin funcionalidad"}
           </p>
         </div>
       ),
     },
     {
       accessorKey: "assignedTo",
       header: "Responsable",
       cell: ({ row }) => {
         const member = row.original.assignedTo
           ? getMemberById(row.original.assignedTo)
           : null;
         return (
           <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-border/50">
               {member ? (
                 <span className="text-xs font-semibold text-primary">
                   {member.name.charAt(0).toUpperCase()}
                 </span>
               ) : (
                 <Users className="h-3 w-3 text-muted-foreground/40" />
               )}
             </div>
             {member && (
               <span className="text-[11px] font-bold text-foreground/80 truncate max-w-[80px]">
                 {member.name.split(" ")[0]}
               </span>
             )}
           </div>
         );
       },
     },
     {
       accessorKey: "type",
       header: "Tipo",
       cell: ({ row }) => (
         <Badge
           variant="outline"
           className="capitalize text-xs font-bold tracking-wider"
         >
           {row.original.type}
         </Badge>
       ),
     },
     {
       accessorKey: "status",
       header: "Estado",
       cell: ({ row }) => {
         const task = row.original;
         const s = task.status;

         const badgeColors =
           s === "completed"
             ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
             : s === "in_progress"
               ? "border-blue-500/30 text-blue-500 bg-blue-500/10"
               : s === "qa"
                 ? "border-violet-500/30 text-violet-500 bg-violet-500/10"
                 : s === "blocked"
                   ? "border-rose-600/30 text-rose-600 bg-rose-600/10"
                   : s === "archived"
                     ? "border-muted text-muted-foreground bg-muted/50"
                     : "border-amber-500/30 text-amber-500 bg-amber-500/10";

         return (
           <Select
             value={s}
             onValueChange={(v) => {
               onStatusChange(task, v);
             }}
             disabled={isReadOnly}
           >
             <SelectTrigger
               className={`h-7 px-2 text-xs font-bold tracking-wider rounded-full border ${badgeColors} focus:ring-0 focus:ring-offset-0`}
             >
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               <SelectItem
                 value="pending"
                 className="text-xs font-bold text-amber-500"
               >
                 Por Hacer
               </SelectItem>
               <SelectItem
                 value="in_progress"
                 className="text-xs font-bold text-blue-500"
               >
                 En Progreso
               </SelectItem>
               <SelectItem
                 value="qa"
                 className="text-xs font-bold text-violet-500"
               >
                 En Revisión / QA
               </SelectItem>
               <SelectItem
                 value="blocked"
                 className="text-xs font-bold text-rose-600"
               >
                 Bloqueado
               </SelectItem>
               <SelectItem
                 value="completed"
                 className="text-xs font-bold text-emerald-500"
               >
                 Completada
               </SelectItem>
               <SelectItem
                 value="archived"
                 className="text-xs font-bold text-destructive"
               >
                 Eliminar
               </SelectItem>
             </SelectContent>
           </Select>
         );
       },
     },
     {
       accessorKey: "timeSpent",
       header: "Tiempo",
       cell: ({ row }) => {
         const task = row.original;
         const isTimerRunning = (task.timeLogs || []).some(
           (l: TimeLog) => !l.endedAt,
         );

         return (
           <div className="flex items-center gap-2">
             <div className="bg-muted/50 px-2 py-1 flex items-center justify-center rounded border border-border/50 text-xs text-foreground font-medium">
               <LiveTimer
                 timeSpent={task.timeSpent || 0}
                 timeLogs={task.timeLogs}
               />
               <span className="text-xs text-muted-foreground ml-1.5 font-bold">
                 / {String(task.estimatedHours || 0)}h
               </span>
             </div>

             {getTaskAlertStatus(task).length > 0 && (
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div className="flex -space-x-1">
                       {getTaskAlertStatus(task).map((alert, i) => {
                         return (
                           <div
                             key={i}
                             className={cn(
                               "h-5 w-5 rounded-full flex items-center justify-center border-2 border-background",
                               alert.type === "error"
                                 ? "bg-red-500 text-white"
                                 : alert.type === "warning"
                                   ? "bg-amber-500 text-white"
                                   : "bg-blue-500 text-white",
                             )}
                           >
                             {alert.type === "error" ? (
                               <AlertCircle className="h-2.5 w-2.5" />
                             ) : alert.type === "warning" ? (
                               <AlertTriangle className="h-2.5 w-2.5" />
                             ) : (
                               <Info className="h-2.5 w-2.5" />
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </TooltipTrigger>
                   <TooltipContent className="p-2 flex flex-col gap-1 max-w-[200px]">
                     {getTaskAlertStatus(task).map((alert, i) => {
                       return (
                         <div
                           key={i}
                           className="flex gap-2 items-start leading-tight"
                         >
                           <div
                             className={cn(
                               "h-1.5 w-1.5 rounded-full mt-1 shrink-0",
                               alert.type === "error"
                                 ? "bg-red-500"
                                 : alert.type === "warning"
                                   ? "bg-amber-500"
                                   : "bg-blue-500",
                             )}
                           />
                           <span className="text-xs font-bold">
                             {alert.message}
                           </span>
                         </div>
                       );
                     })}
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             )}

             {task.status !== "completed" &&
               task.status !== "archived" &&
               !isReadOnly && (
                 <div className="flex bg-muted/30 rounded-md border border-border/50">
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                           onClick={() => {
                             onViewTask(task);
                           }}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent className="font-bold">
                         Ver detalles
                       </TooltipContent>
                     </Tooltip>

                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-7 w-7 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                           onClick={() => {
                             onEditTask(task);
                           }}
                         >
                           <Edit className="h-3.5 w-3.5" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent className="font-bold">
                         Abrir Editor
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>

                   {!isTimerRunning ? (
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-6 w-6 text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                       onClick={() => {
                         startTaskTimer(task.storyId || "", task.id);
                       }}
                     >
                       <Play className="h-3 w-3" />
                     </Button>
                   ) : (
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-6 w-6 text-amber-500 hover:text-amber-500 hover:bg-amber-500/10 animate-pulse"
                       onClick={() => {
                         pauseTaskTimer(task.storyId || "", task.id);
                       }}
                     >
                       <Pause className="h-3 w-3" />
                     </Button>
                   )}

                   <div className="w-px h-6 bg-border/50" />

                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-6 w-6 text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
                     onClick={() => {
                       stopTaskTimer(task.storyId || "", task.id);
                     }}
                   >
                     <Square className="h-2.5 w-2.5" />
                   </Button>
                 </div>
               )}

             {task.status === "completed" && (
               <CheckCircle2 className="h-4 w-4 text-emerald-500" />
             )}

             {(task.timeSpent ?? 0) > 0 && (
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="h-7 w-7 p-0 text-muted-foreground hover:text-primary transition-colors"
                       onClick={() => {
                         onResetTimer(task);
                       }}
                     >
                       <RotateCcw className="h-3.5 w-3.5" />
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent className="font-bold">
                     Reiniciar tiempo
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             )}
           </div>
         );
       },
     },
     {
       accessorKey: "updatedAt",
       header: "Última Edición",
       cell: ({ row }) => (
         <span className="text-xs text-muted-foreground">
           {formatDate(row.original.updatedAt)}
         </span>
       ),
     },
     {
       id: "actions",
       header: () => <div className="text-right">Acciones</div>,
       cell: ({ row }) => {
         const task = row.original;
         if (task.status === "archived") return null;
         return (
           <div className="flex justify-end gap-1">
             <TooltipProvider delayDuration={200}>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-muted-foreground/50 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                     onClick={() => {
                       onViewTask(task);
                     }}
                   >
                     <Eye className="h-4 w-4" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent className="font-bold text-xs bg-background border-border/40">
                   Expandir detalles técnicos
                 </TooltipContent>
               </Tooltip>

               {task.status === "pending" || task.status === "in_progress" ? (
                 <>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button
                         variant="ghost"
                         size="icon"
                         className={`h-8 w-8 rounded-lg transition-all ${
                           task.status === "in_progress"
                             ? "opacity-20 cursor-not-allowed"
                             : "text-muted-foreground/50 hover:text-blue-500 hover:bg-blue-500/5"
                         }`}
                         onClick={() => {
                           if (task.status !== "in_progress") {
                             onEditTask(task);
                           }
                         }}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent className="font-bold text-xs bg-background border-border/40">
                       {task.status === "in_progress"
                         ? "Bloqueado por Timer activo"
                         : "Abrir en el editor de protocolos"}
                     </TooltipContent>
                   </Tooltip>

                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-8 w-8 text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all"
                         onClick={() => {
                           onArchiveTask(task);
                         }}
                       >
                         <Archive className="h-4 w-4" />
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent className="font-bold text-xs bg-background border-border/40">
                       Archivar y justificar remoción
                     </TooltipContent>
                   </Tooltip>
                 </>
               ) : (
                 <div className="h-8 w-8 flex items-center justify-center text-emerald-500/40">
                   <CheckCircle2 className="h-4 w-4" />
                 </div>
               )}
             </TooltipProvider>
           </div>
         );
       },
     },
   ],
   [
     onViewTask,
     getMemberById,
     onStatusChange,
     isReadOnly,
     startTaskTimer,
     pauseTaskTimer,
     stopTaskTimer,
     onEditTask,
     onArchiveTask,
     onResetTimer,
     formatDate,
   ],
 );

 const table = useReactTable({
   data: tasks,
   columns,
   getCoreRowModel: getCoreRowModel(),
 });

 return (
   <div className="flex-1 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl shadow-black/20">
     <DragDropContext onDragEnd={onDragEnd}>
       <Droppable droppableId="tasks-list" isDropDisabled={isReadOnly}>
         {(provided) => (
           <div
             className="flex-1 overflow-auto custom-scrollbar"
             {...provided.droppableProps}
             ref={provided.innerRef}
           >
             <Table>
               <TableHeader className="sticky top-0 z-10 bg-card backdrop-blur-md border-b border-border">
                 {table.getHeaderGroups().map((headerGroup) => (
                   <TableRow
                     key={headerGroup.id}
                     className="border-none hover:bg-transparent"
                   >
                     {headerGroup.headers.map((header) => (
                       <TableHead
                         key={header.id}
                         className="h-11 text-[11px] font-bold text-muted-foreground whitespace-nowrap bg-transparent px-5"
                       >
                         {header.isPlaceholder
                           ? null
                           : flexRender(
                               header.column.columnDef.header,
                               header.getContext(),
                             )}
                       </TableHead>
                     ))}
                   </TableRow>
                 ))}
               </TableHeader>
               <TableBody>
                 {table.getRowModel().rows.length ? (
                   table.getRowModel().rows.map((row) => (
                     <Draggable
                       key={row.original.id}
                       draggableId={row.original.id}
                       index={row.index}
                       isDragDisabled={isReadOnly}
                     >
                       {(provided, snapshot) => (
                         <TableRow
                           ref={provided.innerRef}
                           {...provided.draggableProps}
                           {...provided.dragHandleProps}
                           className={`group border-b border-border hover:bg-secondary/40 transition-colors ${snapshot.isDragging ? "bg-secondary/60 shadow-lg" : ""}`}
                         >
                           {row.getVisibleCells().map((cell) => (
                             <TableCell
                               key={cell.id}
                               className="py-3 px-5 align-middle border-none"
                             >
                               {flexRender(
                                 cell.column.columnDef.cell,
                                 cell.getContext(),
                               )}
                             </TableCell>
                           ))}
                         </TableRow>
                       )}
                     </Draggable>
                   ))
                 ) : (
                   <TableRow>
                     <TableCell
                       colSpan={columns.length}
                       className="h-24 text-center text-muted-foreground font-bold"
                     >
                       No hay tareas registradas.
                     </TableCell>
                   </TableRow>
                 )}
                 {provided.placeholder}
               </TableBody>
             </Table>
           </div>
         )}
       </Droppable>
     </DragDropContext>
   </div>
 );
}
