import { useState, useEffect } from 'react'
import { pulseBus } from '@/shared/lib/pulse-bus'
import { cn } from '@/shared/utils'
import { Zap, AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useNotificationStore } from '@/shared/lib/notifications-store'

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    const unsubscribe = pulseBus.subscribe((event) => {
      const id = Math.random().toString(36).substr(2, 9)
      const severity = event.severity || 'info'
      
      const newNotif: Notification = {
        id,
        type: event.type,
        title: event.title,
        description: event.description,
        severity
      }
      
      // Add to persistent store
      addNotification({
        type: event.type,
        title: event.title,
        description: event.description,
        severity
      })

      setNotifications(prev => [newNotif, ...prev])
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => { return prev.filter(n => n.id !== id) })
      }, 5000)
    })
    return () => { unsubscribe() }
  }, [addNotification])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={cn(
            "p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex gap-3 group relative overflow-hidden",
            n.severity === 'error' ? "bg-red-500/10 border-red-500/20" :
            n.severity === 'warning' ? "bg-amber-500/10 border-amber-500/20" :
            n.severity === 'success' ? "bg-emerald-500/10 border-emerald-500/20" :
            "bg-blue-500/10 border-blue-500/20"
          )}
        >
          <div className="shrink-0 mt-1">
             {n.severity === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
             {n.severity === 'warning' && <Zap className="h-5 w-5 text-amber-500" />}
             {n.severity === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
             {n.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-black italic">{n.title}</p>
             <p className="text-[11px] font-bold text-muted-foreground leading-tight mt-0.5">{n.description}</p>
          </div>
          <button 
            onClick={() => { setNotifications(prev => { return prev.filter(notif => notif.id !== n.id) }) }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded-lg transition-all"
          >
             <X className="h-3 w-3" />
          </button>
          
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full animate-progress-shrink" />
        </div>
      ))}
    </div>
  )
}
