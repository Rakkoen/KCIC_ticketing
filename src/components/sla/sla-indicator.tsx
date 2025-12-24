'use client'

import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface SLAIndicatorProps {
    dueDate: string | null
    status: string
    slaBreach?: boolean
}

export function SLAIndicator({ dueDate, status, slaBreach }: SLAIndicatorProps) {
    if (!dueDate || ['resolved', 'closed'].includes(status)) {
        return null
    }

    const now = new Date()
    const due = new Date(dueDate)
    const timeRemaining = due.getTime() - now.getTime()
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

    // Determine status
    let variant: 'good' | 'warning' | 'danger' | 'breached'
    let icon: React.ReactNode
    let label: string

    if (slaBreach || timeRemaining < 0) {
        variant = 'breached'
        icon = <AlertTriangle className="h-4 w-4" />
        label = 'SLA Breached'
    } else if (hoursRemaining < 2) {
        variant = 'danger'
        icon = <AlertTriangle className="h-4 w-4" />
        label = `${hoursRemaining}h ${minutesRemaining}m remaining`
    } else if (hoursRemaining < 8) {
        variant = 'warning'
        icon = <Clock className="h-4 w-4" />
        label = `${hoursRemaining}h remaining`
    } else {
        variant = 'good'
        icon = <CheckCircle className="h-4 w-4" />
        label = `Due in ${hoursRemaining}h`
    }

    const colors = {
        good: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        danger: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        breached: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse'
    }

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${colors[variant]}`}>
            {icon}
            <span>{label}</span>
        </div>
    )
}
