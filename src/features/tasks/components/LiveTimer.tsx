import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import type { TimeLog } from '@/features/stories/types'

interface LiveTimerProps {
 timeSpent: number
 timeLogs?: TimeLog[]
 className?: string
 showIcon?: boolean
}

export function LiveTimer({ timeSpent, timeLogs = [], className = '', showIcon = true }: LiveTimerProps) {
 const [currentSeconds, setCurrentSeconds] = useState(timeSpent)

 useEffect(() => {
 // Determine active elapsed time based on current logs
 const activeLog = timeLogs.find(log => !log.endedAt)
 let intervalId: number

 // Sync state down initially
 const tick = () => {
 if (activeLog) {
 const startedAt = new Date(activeLog.startedAt).getTime()
 const now = Date.now()
 const elapsedSinceStartSeconds = Math.floor((now - startedAt) / 1000)
 setCurrentSeconds(timeSpent + elapsedSinceStartSeconds)
 } else {
 setCurrentSeconds(timeSpent)
 }
 }

 tick()

 if (activeLog) {
 intervalId = window.setInterval(tick, 1000)
 }

 return () => {
 if (intervalId) window.clearInterval(intervalId)
 }
 }, [timeSpent, timeLogs])

 const formatTime = (seconds: number) => {
 const h = Math.floor(seconds / 3600)
 const m = Math.floor((seconds % 3600) / 60)
 const s = Math.floor(seconds % 60)
 
 return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
 }

 return (
 <div className={`flex items-center gap-1 font-mono font-bold ${className}`}>
 {showIcon && <Clock className="h-3 w-3" />}
 {formatTime(currentSeconds)}
 </div>
 )
}
