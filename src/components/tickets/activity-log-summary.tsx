/**
 * Activity Log Summary Component
 * Displays recent activity for a ticket (compact version for ticket cards)
 */

'use client'

import { useEffect, useState } from 'react'
import { Clock, User } from 'lucide-react'
import { formatActivityMessage } from '@/lib/activity-logger-utils'

interface ActivityLog {
    id: string
    action: string
    details: Record<string, unknown>
    created_at: string
    user: {
        id: string
        full_name: string | null
        email: string
        role: string
    } | null
}

interface ActivityLogSummaryProps {
    ticketId: string
    limit?: number
}

export function ActivityLogSummary({ ticketId, limit = 3 }: ActivityLogSummaryProps) {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [ticketId])

    async function fetchLogs() {
        try {
            const response = await fetch(`/api/tickets/${ticketId}/activity-logs`)
            if (response.ok) {
                const data = await response.json()
                setLogs(data.logs.slice(0, limit))
            }
        } catch (error) {
            console.error('Error fetching activity logs:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span>Loading activity...</span>
                </div>
            </div>
        )
    }

    if (logs.length === 0) {
        return null
    }

    return (
        <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Recent Activity
                </span>
            </div>

            <div className="space-y-1.5">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-xs">
                        <User className="h-3 w-3 text-zinc-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                {formatActivityMessage(
                                    log.action,
                                    log.details,
                                    log.user?.full_name || log.user?.email || 'Unknown'
                                )}
                            </p>
                            <p className="text-zinc-400 dark:text-zinc-500 text-[10px]">
                                {new Date(log.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
