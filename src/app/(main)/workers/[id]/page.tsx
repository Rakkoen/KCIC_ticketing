import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AvailabilityBadge } from '@/components/workers/availability-badge'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar, Ticket, AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function WorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch worker details
    const { data: worker, error: workerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

    if (workerError || !worker) {
        notFound()
    }

    // Fetch assigned tickets
    const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', id)
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch assigned incidents
    const { data: incidents } = await supabase
        .from('incidents')
        .select('*')
        .eq('assigned_to', id)
        .order('detected_at', { ascending: false })
        .limit(10)

    // Calculate stats
    const ticketStats = {
        total: tickets?.length || 0,
        new: tickets?.filter(t => t.status === 'new').length || 0,
        inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
        resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
        closed: tickets?.filter(t => t.status === 'closed').length || 0
    }

    const incidentStats = {
        total: incidents?.length || 0,
        open: incidents?.filter(i => i.status === 'open').length || 0,
        investigating: incidents?.filter(i => i.status === 'investigating').length || 0,
        resolved: incidents?.filter(i => i.status === 'resolved').length || 0
    }

    const workerData = worker as any

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/workers"
                className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Team Directory
            </Link>

            {/* Profile Header */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        {workerData.avatar_url ? (
                            <img
                                src={workerData.avatar_url}
                                alt={workerData.full_name || workerData.email}
                                className="h-24 w-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <span className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400">
                                    {(workerData.full_name || workerData.email).charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2">
                            <AvailabilityBadge status={workerData.availability_status} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {workerData.full_name || 'No name'}
                            </h1>
                            <Badge variant="outline">{workerData.role}</Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${workerData.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                    {workerData.email}
                                </a>
                            </div>
                            {workerData.phone && (
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <Phone className="h-4 w-4" />
                                    <a href={`tel:${workerData.phone}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                        {workerData.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Calendar className="h-4 w-4" />
                                Joined {new Date(workerData.created_at).toLocaleDateString()}
                            </div>
                            {workerData.last_active_at && (
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <Clock className="h-4 w-4" />
                                    Last active: {new Date(workerData.last_active_at).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ticket Stats */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Ticket className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Ticket Statistics</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Assigned</span>
                            <span className="text-lg font-semibold text-zinc-900 dark:text-white">{ticketStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">New</span>
                            <Badge variant="info">{ticketStats.new}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">In Progress</span>
                            <Badge variant="warning">{ticketStats.inProgress}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Resolved</span>
                            <Badge variant="success">{ticketStats.resolved}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Closed</span>
                            <Badge variant="secondary">{ticketStats.closed}</Badge>
                        </div>
                    </div>
                </div>

                {/* Incident Stats */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Incident Statistics</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Total Assigned</span>
                            <span className="text-lg font-semibold text-zinc-900 dark:text-white">{incidentStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Open</span>
                            <Badge variant="info">{incidentStats.open}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Investigating</span>
                            <Badge variant="warning">{incidentStats.investigating}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Resolved</span>
                            <Badge variant="success">{incidentStats.resolved}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Recent Tickets</h2>
                {tickets && tickets.length > 0 ? (
                    <div className="space-y-3">
                        {tickets.map((ticket: any) => (
                            <Link
                                key={ticket.id}
                                href={`/tickets/${ticket.id}`}
                                className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-zinc-900 dark:text-white">{ticket.title}</h3>
                                    <Badge variant={ticket.status === 'resolved' ? 'success' : 'info'}>
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Created {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                        No tickets assigned yet
                    </p>
                )}
            </div>
        </div>
    )
}
