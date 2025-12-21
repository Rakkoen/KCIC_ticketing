
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']

interface TicketCardProps {
    ticket: Ticket
}

export function TicketCard({ ticket }: TicketCardProps) {
    const statusVariants: Record<string, string> = {
        new: 'info',
        in_progress: 'warning',
        resolved: 'success',
        closed: 'secondary'
    }

    const priorityVariants: Record<string, string> = {
        low: 'secondary',
        medium: 'info',
        high: 'warning',
        critical: 'destructive'
    }

    const statusVariant = (statusVariants[ticket.status] || 'default') as any
    const priorityVariant = (priorityVariants[ticket.priority] || 'default') as any

    return (
        <Link href={`/dashboard/tickets/${ticket.id}`} className="block">
            <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white truncate pr-4">
                        {ticket.title}
                    </h3>
                    <Badge variant={priorityVariant}>{ticket.priority}</Badge>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {ticket.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                    <Badge variant={statusVariant}>{ticket.status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    )
}
