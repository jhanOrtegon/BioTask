import type { AuditEntry } from '../types'
import { Clock, Plus, Edit, Archive, RotateCcw } from 'lucide-react'
import { cn } from '@/shared/utils'

const actionConfig = {
  created:  { icon: Plus,       label: 'Creado',     color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  updated:  { icon: Edit,       label: 'Editado',    color: 'text-primary',     bg: 'bg-primary/10' },
  archived: { icon: Archive,    label: 'Archivado',  color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  restored: { icon: RotateCcw,  label: 'Restaurado', color: 'text-blue-500',    bg: 'bg-blue-500/10' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

interface AuditTimelineProps {
  entries: AuditEntry[]
  maxEntries?: number
}

export function AuditTimeline({ entries, maxEntries = 20 }: AuditTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, maxEntries)

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Sin actividad registrada.
      </p>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Línea vertical */}
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />

      {sorted.map((entry) => {
        const config = actionConfig[entry.action]
        const Icon = config.icon
        return (
          <div key={entry.id} className="relative flex gap-4 py-3 group">
            {/* Dot */}
            <div className={cn("grid place-items-center h-10 w-10 rounded-xl shrink-0 z-10", config.bg)}>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-bold uppercase tracking-wider", config.color)}>
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {entry.targetType === 'task' ? 'Tarea' : 'Historia'}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">
                {entry.targetTitle}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "{entry.comment}"
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                <Clock className="h-3 w-3" />
                {formatDate(entry.timestamp)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
