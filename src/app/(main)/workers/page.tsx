'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { RouteProtection } from '@/components/route-protection'

interface Technician {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
    availability_status: string
}

interface TechnicianStats {
    technician: Technician
    total_assigned: number
    total_completed: number
    in_progress: number
    completion_rate: number
    recent_tickets: Array<{
        id: string
        custom_id: string | null
        title: string
        status: string
        completed_at: string | null
        is_primary: boolean
    }>
}

export default function WorkersPage() {
    return (
        <RouteProtection route="/workers">
            <WorkersPageContent />
        </RouteProtection>
    )
}

function WorkersPageContent() {
    const [technicians, setTechnicians] = useState<TechnicianStats[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchTechnicians()
    }, [])

    async function fetchTechnicians() {
        try {
            // Fetch all technicians
            const { data: technicianData, error: techError } = await supabase
                .from('users')
                .select('id, full_name, email, avatar_url, availability_status')
                .eq('role', 'technician')
                .order('full_name')

            if (techError) throw techError

            // Fetch assignment stats for each technician
            const stats = await Promise.all(
                (technicianData || []).map(async (tech) => {
                    // Get all tickets assigned to this technician
                    const { data: tickets }: {
                        data: Array<{
                            id: string
                            custom_id: string | null
                            title: string
                            status: string
                            created_at: string
                        }> | null
                    } = await supabase
                        .from('tickets')
                        .select('id, custom_id, title, status, created_at')
                        .eq('assigned_to', tech.id)
                        .order('created_at', { ascending: false })

                    const total_assigned = tickets?.length || 0
                    // Count tickets with status 'resolved' or 'closed' as completed
                    const total_completed = tickets?.filter(t =>
                        t.status === 'resolved' || t.status === 'closed'
                    )?.length || 0
                    const in_progress = tickets?.filter(t =>
                        t.status !== 'resolved' && t.status !== 'closed'
                    )?.length || 0
                    const completion_rate = total_assigned > 0 ? (total_completed / total_assigned) * 100 : 0

                    const recent_tickets = (tickets || [])
                        .slice(0, 5)
                        .map(t => ({
                            id: t.id,
                            custom_id: t.custom_id,
                            title: t.title,
                            status: t.status,
                            completed_at: (t.status === 'resolved' || t.status === 'closed') ? t.created_at : null,
                            is_primary: true // Always true since we're using assigned_to
                        }))

                    return {
                        technician: tech,
                        total_assigned,
                        total_completed,
                        in_progress,
                        completion_rate,
                        recent_tickets
                    }
                })
            )

            setTechnicians(stats)
        } catch (error) {
            console.error('Error fetching technicians:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Workers (Technicians)</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        View all technicians and their assigned tickets
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <Users className="h-5 w-5 mr-2" />
                    {technicians.length} Technicians
                </Badge>
            </div>

            {technicians.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">No technicians found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {technicians.map((stats) => (
                        <Card key={stats.technician.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                                {stats.technician.full_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{stats.technician.full_name}</CardTitle>
                                            <CardDescription className="text-xs">{stats.technician.email}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={stats.technician.availability_status === 'available' ? 'success' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {stats.technician.availability_status}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Statistics */}
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800">
                                        <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {stats.total_assigned}
                                        </div>
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Assigned</div>
                                    </div>
                                    <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            {stats.total_completed}
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-500">Completed</div>
                                    </div>
                                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                                            {stats.in_progress}
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-500">Active</div>
                                    </div>
                                </div>

                                {/* Completion Rate */}
                                <div className="flex items-center justify-between p-2 rounded bg-indigo-50 dark:bg-indigo-900/20">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                            Completion Rate
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                        {stats.completion_rate.toFixed(0)}%
                                    </span>
                                </div>

                                {/* Recent Tickets */}
                                <div>
                                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Recent Tickets
                                    </h4>
                                    {stats.recent_tickets.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {stats.recent_tickets.map((ticket) => (
                                                <Link
                                                    key={ticket.id}
                                                    href={`/tickets/${ticket.id}`}
                                                    className="block p-2 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            {ticket.custom_id && (
                                                                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                                                                    {ticket.custom_id}
                                                                </p>
                                                            )}
                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                                {ticket.title}
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {ticket.status}
                                                                </Badge>
                                                                {ticket.is_primary && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        Primary
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {ticket.completed_at && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                            No tickets assigned yet
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
