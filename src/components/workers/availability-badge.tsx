'use client'

import { Database } from '@/types/database.types'

type AvailabilityStatus = 'online' | 'busy' | 'offline'

interface AvailabilityBadgeProps {
    status: AvailabilityStatus
    showLabel?: boolean
}

export function AvailabilityBadge({ status, showLabel = false }: AvailabilityBadgeProps) {
    const config = {
        online: {
            color: 'bg-green-500',
            label: 'Online',
            dotClass: 'bg-green-500 animate-pulse'
        },
        busy: {
            color: 'bg-yellow-500',
            label: 'Busy',
            dotClass: 'bg-yellow-500'
        },
        offline: {
            color: 'bg-zinc-400',
            label: 'Offline',
            dotClass: 'bg-zinc-400'
        }
    }

    const statusConfig = config[status] || config.offline

    return (
        <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
                {status === 'online' && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusConfig.color} opacity-75`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${statusConfig.dotClass}`}></span>
            </span>
            {showLabel && (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {statusConfig.label}
                </span>
            )}
        </div>
    )
}
