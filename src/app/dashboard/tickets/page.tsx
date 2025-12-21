
import { createClient } from '@/lib/supabase/server'
import { TicketCard } from '@/components/tickets/ticket-card'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function TicketsPage() {
    const supabase = await createClient()

    const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false })

    const tickets = ticketsData as any[]

    if (error) {
        return (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200">
                Error loading tickets: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tickets</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage support requests and issues.</p>
                </div>
                <Link
                    href="/dashboard/tickets/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Ticket
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tickets && tickets.length > 0 ? (
                    tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">No tickets</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Get started by creating a new ticket.</p>
                        <div className="mt-6">
                            <Link
                                href="/dashboard/tickets/create"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                New Ticket
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
