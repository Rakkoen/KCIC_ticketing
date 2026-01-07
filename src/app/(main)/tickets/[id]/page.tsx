
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { notFound, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusSelect } from '@/components/tickets/status-select'
import { AssigneeSelect } from '@/components/tickets/assignee-select'
import { TicketProgressBar } from '@/components/tickets/ticket-progress-bar'
import { TicketComments } from '@/components/tickets/ticket-comments'
import { useUserRole } from '@/hooks/use-user-role'
import Link from 'next/link'
import { ArrowLeft, User as UserIcon, Calendar, AlertTriangle, MapPin, Activity } from 'lucide-react'
import { getActivityMessage } from '@/lib/activity-helper'

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [ticket, setTicket] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [activities, setActivities] = useState<any[]>([])
    const { userRole, loading: roleLoading } = useUserRole()
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchTicket = async () => {
            const id = (await params).id

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
            }


            const { data: ticketData, error } = await supabase
                .from('tickets')
                .select(`
                    *, 
                    created_by_user:users!tickets_created_by_fkey(id, full_name, email), 
                    assigned_to_user:users!tickets_assigned_to_fkey(id, full_name, email)
                `)
                .eq('id', id)
                .single()

            if (error || !ticketData) {
                console.error('Ticket fetch error:', error)
                setLoading(false)
                notFound()
                return
            }

            setTicket(ticketData)
            setLoading(false)

            // Fetch activity logs
            const { data: activityData } = await supabase
                .from('activity_logs')
                .select(`
                    *,
                    user:user_id (
                        full_name,
                        email
                    )
                `)
                .eq('ticket_id', id)
                .order('created_at', { ascending: false })
                .limit(10)

            setActivities(activityData || [])
        }

        fetchTicket()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]) // Only depend on params, not supabase

    if (loading || roleLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!ticket) {
        notFound()
    }

    const priorityVariants: Record<string, string> = {
        low: 'secondary',
        medium: 'info',
        high: 'warning',
        critical: 'destructive'
    }

    const priorityVariant = (priorityVariants[ticket.priority] || 'default') as any
    const isReporter = currentUserId === ticket.created_by

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/tickets" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                    {ticket.title}
                </h1>
                <Badge variant="outline" className="ml-2 font-mono text-xs">#{ticket.id.slice(0, 8)}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Description</h3>
                        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <TicketProgressBar
                        currentStatus={ticket.status}
                        ticketId={ticket.id}
                        isReporter={isReporter}
                    />

                    {/* Comments Section */}
                    <TicketComments ticketId={ticket.id} />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Status</h3>
                            <StatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Priority</h3>
                            <Badge variant={priorityVariant} className="text-sm px-3 py-1 uppercase tracking-wide">
                                {ticket.priority}
                            </Badge>
                        </div>

                        <AssigneeSelect
                            ticketId={ticket.id}
                            currentAssignee={ticket.assigned_to}
                            userRole={(userRole as any) || 'employee'}
                        />

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Details</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500 dark:text-zinc-400 flex items-center">
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        Reporter
                                    </dt>
                                    <dd className="font-medium text-zinc-900 dark:text-white">
                                        {ticket.created_by_user?.full_name || 'Unknown'}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500 dark:text-zinc-400 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Created
                                    </dt>
                                    <dd className="font-medium text-zinc-900 dark:text-white">
                                        {new Date(ticket.created_at).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500 dark:text-zinc-400 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Station
                                    </dt>
                                    <dd className="font-medium text-zinc-900 dark:text-white">
                                        {ticket.station || 'N/A'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Recent Activities */}
                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Recent Activities</h3>
                            </div>

                            {activities.length > 0 ? (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-xs font-medium text-zinc-900 dark:text-white">
                                                    {activity.user?.full_name || 'System'}
                                                </p>
                                                <time className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                                                    {new Date(activity.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </time>
                                            </div>
                                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                                {getActivityMessage(activity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-4">
                                    No activities yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
