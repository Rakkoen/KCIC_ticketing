'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { TicketFilters as TicketFiltersType } from '@/components/tickets/ticket-filters'
import { GripVertical, Plus } from 'lucide-react'
import Link from 'next/link'

type Ticket = {
    id: string
    title: string
    description: string
    status: string
    priority: string
    created_at: string
    assigned_to_user?: {
        full_name: string | null
        email: string
    }
}

interface KanbanBoardProps {
    filters: TicketFiltersType
}

const COLUMNS = [
    { id: 'new', title: 'New', color: 'blue' },
    { id: 'in_progress', title: 'In Progress', color: 'yellow' },
    { id: 'resolved', title: 'Resolved', color: 'green' },
    { id: 'closed', title: 'Closed', color: 'gray' }
]

const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export function KanbanBoard({ filters }: KanbanBoardProps) {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchTickets()
    }, [filters])

    const fetchTickets = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('tickets')
                .select(`
                    *,
                    assigned_to_user:users!assigned_to(*)
                `)

            // Apply filters
            if (filters.status.length > 0) {
                query = query.in('status', filters.status)
            }

            if (filters.priority.length > 0) {
                query = query.in('priority', filters.priority)
            }

            if (filters.assignee.length > 0) {
                query = query.in('assigned_to', filters.assignee)
            }

            if (filters.dateRange) {
                if (filters.dateRange.from) {
                    query = query.gte('created_at', filters.dateRange.from)
                }
                if (filters.dateRange.to) {
                    query = query.lte('created_at', filters.dateRange.to)
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false })

            if (error) throw error

            setTickets(data || [])
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ status: newStatus as any })
                .eq('id', ticketId)

            if (error) throw error

            // Update local state
            setTickets(prev =>
                prev.map(ticket =>
                    ticket.id === ticketId
                        ? { ...ticket, status: newStatus }
                        : ticket
                )
            )
        } catch (error) {
            console.error('Error updating ticket status:', error)
        }
    }

    const getTicketsByStatus = (status: string) => {
        return tickets.filter(ticket => ticket.status === status)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="h-full">
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {COLUMNS.map((column) => {
                    const columnTickets = getTicketsByStatus(column.id)
                    const columnColor = {
                        blue: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
                        yellow: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
                        green: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
                        gray: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
                    }[column.color]

                    return (
                        <div key={column.id} className="flex-shrink-0 w-80">
                            <div className={`rounded-lg border-2 border-dashed ${columnColor} p-4`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                                        {column.title}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {columnTickets.length}
                                    </Badge>
                                </div>

                                <div className="space-y-3 min-h-[200px]">
                                    {columnTickets.map((ticket) => (
                                        <Link
                                            key={ticket.id}
                                            href={`/tickets/${ticket.id}`}
                                            className="block"
                                        >
                                            <div className="bg-white dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2 pr-2">
                                                        {ticket.title}
                                                    </h4>
                                                    <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                                </div>

                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                                                    {ticket.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                                                        {ticket.priority}
                                                    </span>

                                                    {ticket.assigned_to_user?.full_name && (
                                                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            {ticket.assigned_to_user.full_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}

                                    {columnTickets.length === 0 && (
                                        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                            <p className="text-sm">No tickets in {column.title.toLowerCase()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}