import type { ReactNode } from 'react'

export interface PerformanceMetric {
 name: string
 fullDate: string
 hours: number
 seconds: number
}

export interface TodayMetrics {
 hours: number
 status: string
 icon: ReactNode
 color: string
 formattedTime: string
}

export interface DeviationMetrics {
 totalEst: number
 totalReal: number
 accuracy: number
 status: string
 typeData: {
 name: string
 Estimado: number
 Real: number
 }[]
}

export interface SystemForecast {
 predictedEndDate: Date
 daysToFinish: number
 isDelayLikely: boolean
 velocity: string
 status: 'danger' | 'healthy' | 'stagnant'
}
