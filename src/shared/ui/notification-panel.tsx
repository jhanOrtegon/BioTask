import { useNotificationStore, type Notification } from '@/shared/lib/notifications-store'
import { cn } from '@/shared/utils'
import { Zap, AlertCircle, CheckCircle2, Info, X, Trash2, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/shared/ui/button'

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore()

  if (!open) return null

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm lg:hidden" 
        onClick={onClose} 
      />
      <div 
        className={cn(
          "fixed bottom-24 left-6 z-[101] w-[350px] max-h-[500px] flex flex-col",
          "bg-popover border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        )}
      >
        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black italic flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Live-Feeds
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
              Actividad del ecosistema
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-emerald-500/10 text-emerald-500" 
              onClick={markAllAsRead}
              title="Marcar todo como leído"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-xl hover:bg-red-500/10 text-red-500" 
              onClick={clearAll}
              title="Limpiar todo"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[100px]">
          {notifications.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center space-y-2 opacity-20">
              <Zap className="h-10 w-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Sin señales activas</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => { markAsRead(n.id); }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                  !n.read ? "bg-primary/5 border-primary/20 shadow-md" : "bg-card/50 border-border/40 grayscale-[0.5] opacity-70 hover:opacity-100 hover:grayscale-0",
                  n.severity === 'error' && !n.read ? "bg-red-500/5 border-red-500/20" :
                  n.severity === 'warning' && !n.read ? "bg-amber-500/5 border-amber-500/20" :
                  n.severity === 'success' && !n.read ? "bg-emerald-500/5 border-emerald-500/20" : ""
                )}
              >
                {!n.read && (
                  <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                )}
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <NotificationIcon severity={n.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black leading-tight italic">{n.title}</p>
                    <p className="text-[11px] font-bold text-muted-foreground mt-0.5 line-clamp-2 leading-tight">
                      {n.description}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-tighter opacity-40 mt-1.5">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-muted/20 border-t border-border/50 text-center">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            Protocolo de Telemetría v2
          </span>
        </div>
      </div>
    </>
  )
}

function NotificationIcon({ severity }: { severity: Notification['severity'] }) {
  switch (severity) {
    case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'warning': return <Zap className="h-4 w-4 text-amber-500" />
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    default: return <Info className="h-4 w-4 text-blue-500" />
  }
}
