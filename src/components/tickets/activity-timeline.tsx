/**
 * Activity Timeline Component
 * Displays full activity log timeline for a ticket
 */

'use client'

import { useEffect, useState } from 'react'
import { Clock, User, AlertCircle, CheckCircle, FileUp, MessageSquare, Edit, UserPlus, Trash } from 'lucide-react'
import { formatActivityMessage, ACTIVITY_ACTIONS } from '@/lib/activity-logger-utils'

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

interface ActivityTimelineProps {
    ticketId: string
}

const getActionIcon = (action: string) => {
    switch (action) {
        case ACTIVITY_ACTIONS.TICKET_CREATE:
            return <CheckCircle className="h-4 w-4 text-green-500" />
        case ACTIVITY_ACTIONS.TICKET_STATUS_CHANGE:
            return <AlertCircle className="h-4 w-4 text-blue-500" />
        case ACTIVITY_ACTIONS.COMMENT_ADD:
            return <MessageSquare className="h-4 w-4 text-purple-500" />
        case ACTIVITY_ACTIONS.ATTACHMENT_UPLOAD:
            return <FileUp className="h-4 w-4 text-indigo-500" />
        case ACTIVITY_ACTIONS.TICKET_ASSIGN:
            return <UserPlus className="h-4 w-4 text-cyan-500" />
        case ACTIVITY_ACTIONS.TICKET_UPDATE:
            return <Edit className="h-4 w-4 text-yellow-500" />
        case ACTIVITY_ACTIONS.TICKET_DELETE:
            return <Trash className="h-4 w-4 text-red-500" />
        default:
            return <Clock className="h-4 w-4 text-zinc-400" />
    }
}

export function ActivityTimeline({ ticketId }: ActivityTimelineProps) {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchLogs()
    }, [ticketId])

    async function fetchLogs() {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`/api/tickets/${ticketId}/activity-logs`)

            if (!response.ok) {
                throw new Error('Failed to fetch activity logs')
            }

            const data = await response.json()
            setLogs(data.logs || [])
        } catch (err) {
            console.error('Error fetching activity logs:', err)
            setError('Failed to load activity timeline')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-zinc-400 animate-pulse" />
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Activity Timeline</h3>
                        <p className="text-xs text-zinc-500">Loading activity...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-zinc-400" />
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Activity Timeline</h3>
                        <p className="text-xs text-zinc-500">No activity yet</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Activity Timeline
                </h3>
                <span className="text-xs text-zinc-500">
                    ({logs.length} {logs.length === 1 ? 'activity' : 'activities'})
                </span>
            </div>

            <div className="space-y-4">
                {logs.map((log, index) => (
                    <div key={log.id} className="relative">
                        {/* Timeline line */}
                        {index < logs.length - 1 && (
                            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700" />
                        )}

                        <div className="flex gap-3">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-5 h-5 mt-0.5 relative z-10">
                                {getActionIcon(log.action)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="text-sm text-zinc-900 dark:text-white">
                                            {formatActivityMessage(
                                                log.action,
                                                log.details,
                                                log.user?.full_name || log.user?.email || 'Unknown User'
                                            )}
                                        </p>

                                        {/* User info */}
                                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                                            <User className="h-3 w-3" />
                                            <span>{log.user?.full_name || log.user?.email || 'Unknown'}</span>
                                            <span>•</span>
                                            <span className="capitalize">{log.user?.role || 'user'}</span>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <time className="text-xs text-zinc-400 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </time>
                                </div>

                                {/* Details if available */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded text-xs">
                                        {log.action === ACTIVITY_ACTIONS.TICKET_STATUS_CHANGE && (
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded">
                                                    {log.details.old_status as string}
                                                </span>
                                                <span>→</span>
                                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                                                    {log.details.new_status as string}
                                                </span>
                                            </div>
                                        )}

                                        {log.action === ACTIVITY_ACTIONS.ATTACHMENT_UPLOAD && (
                                            <div className="text-zinc-600 dark:text-zinc-400">
                                                📎 {log.details.file_name as string}
                                                {log.details.file_size && (
                                                    <span className="ml-2 text-zinc-500">
                                                        ({Math.round((log.details.file_size as number) / 1024)} KB)
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {log.action === ACTIVITY_ACTIONS.COMMENT_ADD && log.details.comment_preview && (
                                            <div className="text-zinc-600 dark:text-zinc-400 italic">
                                                "{log.details.comment_preview as string}..."
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
