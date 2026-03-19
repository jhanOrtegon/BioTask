import { useState } from 'react'
import { Badge } from '@/shared/components/badge'
import { Progress } from '@/shared/components/progress'
import { 
 CheckCircle2, 
 Clock,
 User,
 Zap,
 Code2,
 ShieldCheck,
 Database,
 Terminal,
 ChevronDown,
 Target,
 LayoutGrid,
 Cpu,
 Layers
} from 'lucide-react'
import { format } from 'date-fns'
import { es as localeEs } from 'date-fns/locale'
import type { TrackedTask } from '@/features/stories/types'
import type { TeamMember } from '@/features/team/types'
import { cn } from '@/shared/utils'
import { JsonCodeBlock } from '@/shared/components/json-code-block'

interface BioTaskDetailProps {
 task: TrackedTask
 getMemberById: (id: string) => TeamMember | undefined
 onEdit?: () => void
 onFullView?: () => void
}

export function BioTaskDetail({ task, getMemberById, onEdit, onFullView }: BioTaskDetailProps) {
 const [expandedService, setExpandedService] = useState<string | null>(null)
 
 const assignedMember = task.assignedTo ? getMemberById(task.assignedTo) : null
 
 const progress = task.estimatedHours 
 ? Math.min(100, Math.round(((task.timeSpent || 0) / 3600 / task.estimatedHours) * 100))
 : 0

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-7xl mx-auto">
 
 {/* 1. SECCIÓN SUPERIOR: GRID ALINEADO (8/4) */}
 <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
 
 {/* Título y Status (8 columnas) */}
 <div className="lg:col-span-8 p-8 rounded-xl bg-card border-2 border-border/60 shadow-xl relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
 <Cpu className="h-40 w-40 rotate-12" />
 </div>
 
 <div className="relative space-y-4">
 <div className="flex items-center gap-3">
 <Badge variant="outline" className="px-2 h-6 text-[11px] font-semibold tracking-wide uppercase border-primary/20 bg-primary/5 text-primary rounded-lg">
 {task.code || 'BIO-TSK'}
 </Badge>
 <Badge className={cn(
 "h-6 px-3 rounded-lg text-xs font-medium border-none shadow-md",
 task.status === 'completed' ? "bg-emerald-500 text-white" :
 task.status === 'in_progress' ? "bg-blue-500 text-white" :
 "bg-amber-500 text-white"
 )}>
 {task.status.replace('_', ' ')}
 </Badge>
 </div>

 <h1 className="text-3xl font-semibold tracking-tighter text-foreground leading-tight">
 {task.title}
 </h1>

 <div className="flex flex-wrap gap-5 pt-2 border-t border-border/10 mt-2">
 <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50 ">
 <Layers className="h-3 w-3 text-primary" /> {task.type}
 </div>
 <div className={cn("flex items-center gap-2 text-[11px] font-bold ", 
 task.priority === 'urgent' ? "text-rose-500" : "text-amber-500"
 )}>
 <Zap className="h-3 w-3" /> Prioridad {task.priority || 'Normal'}
 </div>
 <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50 ">
 <Clock className="h-3 w-3 text-primary" /> {Math.round((task.timeSpent || 0)/3600)}h / {task.estimatedHours}h
 </div>
 </div>
 </div>
 </div>

 {/* Responsable Arriba (Alineado 4 columnas) */}
 <div className="lg:col-span-4 p-6 rounded-xl bg-secondary/5 border-2 border-border/60 shadow-lg flex flex-col justify-between group hover:border-primary/20 transition-all">
 <div className="space-y-4">
 <span className="text-xs font-semibold text-primary/60 px-1">Enlace Responsable</span>
 <div className="flex items-center gap-4">
 <div className="h-16 w-16 rounded-xl bg-card border-2 border-background shadow-xl flex items-center justify-center overflow-hidden transform group-hover:scale-105 transition-transform duration-500 ring-4 ring-primary/5">
 {assignedMember?.avatarUrl ? <img src={assignedMember.avatarUrl} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-primary/20" />}
 </div>
 <div className="space-y-0.5">
 <p className="text-base font-semibold text-foreground">{assignedMember?.name || 'No Asignado'}</p>
 <p className="text-[11px] font-bold text-muted-foreground ">{assignedMember?.role || 'Awaiting Node'}</p>
 </div>
 </div>
 </div>
 <div className="pt-6 border-t border-border/10 space-y-4">
 <div className="flex gap-2">
 {onEdit && (
 <button 
 onClick={onEdit}
 className="flex-1 h-11 rounded-xl bg-primary/10 text-primary font-semibold text-xs border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
 >
 Intervenir Nodo
 </button>
 )}
 {onFullView && (
 <button 
 onClick={onFullView}
 className="flex-1 h-11 rounded-xl bg-secondary/10 text-muted-foreground font-semibold text-xs border border-border/40 hover:bg-secondary hover:text-foreground transition-all"
 >
 Expediente
 </button>
 )}
 </div>
 <div className="space-y-2.5 pt-1">
 <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground/30 ">
 <span>Sincronía Operativa</span>
 <span className="text-primary/60">{progress}%</span>
 </div>
 <Progress value={progress} className="h-2 bg-background/50 border border-border/20" />
 </div>
 </div>
 </div>
 </section>

 {/* 2. CUERPO DE DATOS */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* LADO IZQUIERDO: EJECUCIÓN (8 COLUMNAS) */}
 <div className="lg:col-span-8 space-y-4">
 
 <details open className="group rounded-[1.5rem] border-2 border-border/60 bg-card shadow-lg hover:border-primary/20 transition-all overflow-hidden">
 <summary className="p-6 flex items-center justify-between cursor-pointer list-none select-none">
 <div className="flex items-center gap-3">
 <Target className="h-4 w-4 text-primary" />
 <h3 className="text-[11px] font-semibold text-foreground/60">Objetivo BioTask</h3>
 </div>
 <ChevronDown className="h-4 w-4 text-muted-foreground/30 group-open:rotate-180 transition-transform" />
 </summary>
 <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-2 duration-300">
 <p className="text-base font-medium leading-relaxed text-foreground/80 italic border-l-4 border-primary/20 pl-6">
 {task.data.objective}
 </p>
 </div>
 </details>

 <details open className="group rounded-[1.5rem] border-2 border-border/60 bg-card shadow-lg hover:border-primary/20 transition-all overflow-hidden">
 <summary className="p-6 flex items-center justify-between cursor-pointer list-none select-none">
 <div className="flex items-center gap-3">
 <LayoutGrid className="h-4 w-4 text-primary" />
 <h3 className="text-[11px] font-semibold text-foreground/60">Requerimientos</h3>
 </div>
 <ChevronDown className="h-4 w-4 text-muted-foreground/30 group-open:rotate-180 transition-transform" />
 </summary>
 <div className="px-8 pb-8 pt-0 animate-in slide-in-from-top-2 duration-300">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {task.data.requirements.map((req, idx) => (
 <div key={idx} className="flex gap-4 p-4 rounded-xl bg-secondary/5 border border-border/20 group hover:border-primary/20 transition-all">
 <span className="text-xs font-semibold text-primary/40 pt-0.5">{String(idx + 1).padStart(2, '0')}</span>
 <p className="text-xs font-bold text-foreground/60 group-hover:text-foreground leading-relaxed">{req}</p>
 </div>
 ))}
 </div>
 </div>
 </details>

 {/* Servicios: Ahora con respuesta ya agrandada al abrir */}
 <div className="rounded-[1.5rem] border-2 border-border/60 bg-card shadow-lg overflow-hidden">
 <div className="p-6 flex items-center gap-3 border-b border-border/70">
 <Database className="h-4 w-4 text-primary" />
 <h3 className="text-[11px] font-semibold text-foreground/60">Servicios</h3>
 <Badge className="ml-2 h-4 px-1.5 text-[11px] bg-primary/10 text-primary border-none">{task.data.services.length}</Badge>
 </div>
 <div className="p-4 space-y-2">
 {task.data.services.map((s, i) => {
 const sId = s.id || `srv-${String(i)}`;
 const isExpanded = expandedService === sId;

 return (
 <div key={sId} className={cn(
 "rounded-xl border transition-all duration-300 overflow-hidden",
 isExpanded ? "border-primary/40 bg-secondary/5 mt-2 mb-4" : "border-border/60 hover:border-primary/20 bg-background/50"
 )}>
 <div 
 onClick={() => { setExpandedService(isExpanded ? null : sId); }}
 className="p-3.5 flex items-center justify-between cursor-pointer group"
 >
 <div className="flex items-center gap-4 truncate">
 <span className={cn(
 "text-[7px] font-semibold w-10 h-4 flex items-center justify-center rounded border tracking-tighter",
 s.method === 'GET' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
 )}>
 {s.method}
 </span>
 <span className="text-xs font-semibold text-foreground/70 group-hover:text-primary transition-colors">{s.name}</span>
 <span className="text-xs font-mono text-muted-foreground/30 truncate hidden md:block">{s.url}</span>
 </div>
 <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/20 transition-transform", isExpanded && "rotate-180 text-primary")} />
 </div>

 {isExpanded && (
 <div className="px-5 pb-5 pt-0 space-y-4 animate-in slide-in-from-top-2">
 <div className="p-2.5 rounded-lg bg-background/80 border border-border/20 font-mono text-xs text-muted-foreground flex items-center gap-2 truncate">
 <Terminal className="h-3 w-3 opacity-30" />
 <span className="truncate">{s.url}</span>
 </div>

 <div className="grid grid-cols-1 gap-5">
 <div className="space-y-2">
 <span className="text-[11px] font-semibold uppercase text-muted-foreground/30 px-1 italic">Entrada_Payload</span>
 <JsonCodeBlock 
 code={s.payload || "{}"} 
 className="rounded-xl text-[11px] bg-background border-none p-4 shadow-inner overflow-auto max-h-[400px]" 
 />
 </div>
 <div className="space-y-2">
 <span className="text-[11px] font-semibold uppercase text-muted-foreground/30 px-1 italic">Respuesta_Esperada</span>
 <JsonCodeBlock 
 code={s.response || "{}"} 
 className="rounded-xl text-[11px] bg-background border-none p-4 shadow-inner overflow-auto max-h-[400px]" 
 />
 </div>
 </div>
 </div>
 )}
 </div>
 )
 })}
 </div>
 </div>
 </div>

 {/* LADO DERECHO: VALIDACIONES Y META (4 COLUMNAS) */}
 <div className="lg:col-span-4 space-y-6">
 
 <details open className="group rounded-xl border-2 border-emerald-500/10 bg-emerald-500/[0.02] shadow-lg hover:border-emerald-500/30 transition-all overflow-hidden">
 <summary className="p-6 flex items-center justify-between cursor-pointer list-none select-none">
 <div className="flex items-center gap-3">
 <ShieldCheck className="h-4 w-4 text-emerald-500" />
 <h3 className="text-[11px] font-semibold text-emerald-500/60">Validaciones</h3>
 </div>
 <ChevronDown className="h-4 w-4 text-muted-foreground/30 group-open:rotate-180 transition-transform" />
 </summary>
 <div className="px-6 pb-6 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
 {task.data.validations.map((val, i) => (
 <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm group">
 <CheckCircle2 className="h-4 w-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
 <span className="text-xs font-bold text-foreground/60 leading-snug">{val}</span>
 </div>
 ))}
 </div>
 </details>

 <div className="p-6 rounded-[1.5rem] bg-secondary/5 border-2 border-border/60 space-y-4">
 <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground/30 border-b border-border/70 pb-3">
 <span>Última Sincronía</span>
 <span className="text-foreground/60">{format(new Date(task.updatedAt || new Date()), "HH:mm 'hs'", { locale: localeEs })}</span>
 </div>
 <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground/30 pt-1">
 <span className="flex items-center gap-2"><Code2 className="h-3 w-3" /> Security_Alpha</span>
 <span className="text-primary/60">Node V.09</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
