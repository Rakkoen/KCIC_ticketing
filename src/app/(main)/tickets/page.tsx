'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TicketCard } from '@/components/tickets/ticket-card'
import { TicketFilters, TicketFilters as TicketFiltersType } from '@/components/tickets/ticket-filters'
import { KanbanBoard } from '@/components/tickets/kanban-board'
import { Grid, List, Layout, ChevronLeft, ChevronRight, FileDown } from 'lucide-react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ITEMS_PER_PAGE = 12

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [allTickets, setAllTickets] = useState<any[]>([]) // For PDF export
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [filters, setFilters] = useState<TicketFiltersType>({
        status: [],
        priority: [],
        assignee: [],
        dateRange: null
    })
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        if (viewMode !== 'kanban') {
            fetchTickets()
        }
    }, [filters, currentPage, viewMode])

    const fetchTickets = async () => {
        setLoading(true)
        try {
            // First get the total count with filters
            let countQuery = supabase.from('tickets').select('*', { count: 'exact', head: true })

            if (filters.status.length > 0) {
                countQuery = countQuery.in('status', filters.status)
            }
            if (filters.priority.length > 0) {
                countQuery = countQuery.in('priority', filters.priority)
            }
            if (filters.assignee.length > 0) {
                countQuery = countQuery.in('assigned_to', filters.assignee)
            }
            if (filters.dateRange) {
                if (filters.dateRange.from) {
                    countQuery = countQuery.gte('created_at', filters.dateRange.from)
                }
                if (filters.dateRange.to) {
                    countQuery = countQuery.lte('created_at', filters.dateRange.to)
                }
            }

            const { count: totalCount, error: countError } = await countQuery
            if (countError) throw countError

            // Then get the paginated data
            let query = supabase
                .from('tickets')
                .select(`
                    *,
                    created_by_user:users!created_by(*),
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

            // Apply pagination
            const from = (currentPage - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .range(from, to)

            if (error) throw error

            setTickets(data || [])
            setTotalCount(totalCount || 0)
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFiltersChange = (newFilters: TicketFiltersType) => {
        setFilters(newFilters)
        setCurrentPage(1) // Reset to first page when filters change
    }

    const generatePDF = async () => {
        setExporting(true)
        try {
            // Fetch all tickets with current filters (no pagination)
            let query = supabase
                .from('tickets')
                .select(`
                    *,
                    created_by_user:users!created_by(*),
                    assigned_to_user:users!assigned_to(*)
                `)

            // Apply same filters
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

            const { data } = await query.order('created_at', { ascending: false })

            if (data) {
                const doc = new jsPDF()

                // Title
                doc.setFontSize(18)
                doc.text('KCIC Tickets Report', 14, 20)

                // Metadata
                doc.setFontSize(10)
                doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
                doc.text(`Total Tickets: ${data.length}`, 14, 34)

                // Table
                const tableData = data.map((ticket: any) => [
                    ticket.custom_id || 'N/A',
                    ticket.title.substring(0, 40),
                    ticket.priority.toUpperCase(),
                    ticket.status.replace('_', ' ').toUpperCase(),
                    ticket.station || 'N/A',
                    ticket.assigned_to_user?.full_name || 'Unassigned',
                    new Date(ticket.created_at).toLocaleDateString()
                ])

                autoTable(doc, {
                    head: [['ID', 'Title', 'Priority', 'Status', 'Station', 'Assigned', 'Created']],
                    body: tableData,
                    startY: 40,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [79, 70, 229] }
                })

                doc.save(`tickets-${new Date().getTime()}.pdf`)
            }
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF')
        } finally {
            setExporting(false)
        }
    }

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
                <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 ${viewMode === 'grid' ? 'bg-zinc-100 dark:bg-zinc-700' : ''} rounded-l-md`}
                            title="Grid view"
                        >
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-700' : ''} rounded-r-md`}
                            title="List view"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 ${viewMode === 'kanban' ? 'bg-zinc-100 dark:bg-zinc-700' : ''} rounded-r-md`}
                            title="Kanban board"
                        >
                            <Layout className="h-4 w-4" />
                        </button>
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={exporting || tickets.length === 0}
                        className="inline-flex items-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
                        title="Export to PDF"
                    >
                        <FileDown className="h-4 w-4" />
                    </button>
                    <TicketFilters onFiltersChange={handleFiltersChange} />
                    <Link
                        href="/tickets/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        New Ticket
                    </Link>
                </div>
            </div>

            {viewMode === 'kanban' ? (
                <KanbanBoard filters={filters} />
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                    <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">No tickets found</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0 || filters.dateRange
                            ? 'Try adjusting your filters or create a new ticket.'
                            : 'Get started by creating a new ticket.'}
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/tickets/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            New Ticket
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                        {tickets.map((ticket) => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                viewMode={viewMode}
                                onDelete={fetchTickets}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-8">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                Page {currentPage} of {totalPages} ({totalCount} total)
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-zinc-300 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
