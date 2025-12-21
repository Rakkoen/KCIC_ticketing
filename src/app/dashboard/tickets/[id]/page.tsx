
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { StatusSelect } from '@/components/tickets/status-select'
import Link from 'next/link'
import { ArrowLeft, User as UserIcon, Calendar, AlertTriangle } from 'lucide-react'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const supabase = await createClient()

    const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('*, created_by_user:users!created_by(*), assigned_to_user:users!assigned_to(*)')
        .eq('id', id)
        .single()

    const ticket = ticketData as any

    if (error || !ticket) {
        notFound()
    }

    const priorityVariants: Record<string, string> = {
        low: 'secondary',
        medium: 'info',
        high: 'warning',
        critical: 'destructive'
    }

    const priorityVariant = (priorityVariants[ticket.priority] || 'default') as any

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/tickets" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                    {ticket.title}
                </h1>
                <Badge variant="outline" className="ml-2 font-mono text-xs">#{id.slice(0, 8)}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Description</h3>
                        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                    </div>
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

                        <div>
                            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Details</h3>
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
                                        <UserIcon className="h-4 w-4 mr-2" />
                                        Assignee
                                    </dt>
                                    <dd className="font-medium text-zinc-900 dark:text-white">
                                        {ticket.assigned_to_user?.full_name || 'Unassigned'}
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
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
