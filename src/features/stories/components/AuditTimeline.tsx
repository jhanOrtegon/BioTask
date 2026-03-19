import { useMemo } from 'react'
import type { AuditEntry } from '../types'
import { Clock, Plus, Edit, Archive, RotateCcw, User, Tag } from 'lucide-react'
import { cn } from '@/shared/utils'

const actionConfig = {
 created: { icon: Plus, label: 'Creado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
 updated: { icon: Edit, label: 'Editado', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
 archived: { icon: Archive, label: 'Archivado', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
 restored: { icon: RotateCcw, label: 'Restaurado', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
}

function formatRelativeDate(iso: string) {
 const date = new Date(iso)
 const now = new Date()
 const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

 if (diffDays === 0) return 'Hoy'
 if (diffDays === 1) return 'Ayer'
 if (diffDays < 7) return date.toLocaleDateString('es-ES', { weekday: 'long' })
 return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatTime(iso: string) {
 return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

interface AuditTimelineProps {
 entries: AuditEntry[]
 maxEntries?: number
}

interface GroupedEntries {
 dateLabel: string
 items: AuditEntry[]
}

export function AuditTimeline({ entries, maxEntries = 30 }: AuditTimelineProps) {
 const grouped = useMemo(() => {
 const sorted = [...entries].sort(
 (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
 ).slice(0, maxEntries)

 const groups: GroupedEntries[] = []
 sorted.forEach(entry => {
 const label = formatRelativeDate(entry.timestamp)
 const existingGroup = groups.find(g => g.dateLabel === label)
 if (existingGroup) {
 existingGroup.items.push(entry)
 } else {
 groups.push({ dateLabel: label, items: [entry] })
 }
 })
 return groups
 }, [entries, maxEntries])

 if (entries.length === 0) {
 return (
 <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3 bg-muted/5 rounded-xl border border-dashed border-border/50">
 <Clock className="h-10 w-10 text-muted-foreground/20" />
 <div>
 <p className="text-sm font-bold text-foreground">Sin actividad reciente</p>
 <p className="text-xs text-muted-foreground mt-1">Los cambios aparecerán aquí automáticamente.</p>
 </div>
 </div>
 )
 }

 return (
 <div className="relative space-y-8 pb-4">
 {grouped.map((group, groupIdx) => (
 <div key={group.dateLabel} className="space-y-4">
 {/* Date Label */}
 <div className="sticky top-0 z-20 flex items-center gap-4 py-2 bg-background/80 backdrop-blur-sm -mx-2 px-2">
 <span className="text-[11px] font-semibold text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-md">
 {group.dateLabel}
 </span>
 <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
 </div>

 <div className="relative space-y-1">
 {/* vertical line for the group */}
 <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />

 {group.items.map((entry, entryIdx) => {
 const config = actionConfig[entry.action]
 const Icon = config.icon
 return (
 <div key={entry.id} className="relative flex gap-5 py-4 group animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${String((groupIdx * 5 + entryIdx) * 50)}ms` }}>
 {/* Icon Container */}
 <div className={cn(
 "grid place-items-center h-10 w-10 rounded-xl shrink-0 z-10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/10 border shadow-sm",
 config.bg,
 config.border,
 config.color
 )}>
 <Icon className="h-4 w-4" />
 </div>

 {/* Content Card */}
 <div className="flex-1 min-w-0 bg-card/40 hover:bg-card border border-border/30 hover:border-border/60 p-3 rounded-xl transition-all duration-300">
 <div className="flex items-start justify-between gap-2 mb-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={cn("text-[11px] font-semibold px-1.5 py-0.5 rounded border", config.bg, config.border, config.color)}>
 {config.label}
 </span>
 <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase opacity-60">
 <Tag className="h-2.5 w-2.5" />
 {entry.targetType === 'task' ? 'Tarea' : 'Historia'}
 </div>
 </div>
 <time className="text-[11px] font-mono font-bold text-muted-foreground whitespace-nowrap bg-muted/40 px-1.5 py-0.5 rounded">
 {formatTime(entry.timestamp)}
 </time>
 </div>

 <h4 className="text-sm font-bold text-foreground leading-snug">
 {entry.targetTitle}
 </h4>
 
 {entry.comment && (
 <div className="mt-2 text-xs text-muted-foreground/80 italic line-clamp-2 leading-relaxed pl-3 border-l-2 border-border">
 {entry.comment}
 </div>
 )}

 {/* Placeholder for User (Point 6) */}
 <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/30">
 <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
 <User className="h-3 w-3 text-muted-foreground" />
 </div>
 <span className="text-[11px] font-bold text-muted-foreground tracking-tight">Sistema</span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 ))}
 </div>
 )
}
