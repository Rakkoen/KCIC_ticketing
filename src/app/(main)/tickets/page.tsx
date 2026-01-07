'use client'

import { useState, useEffect, useCallback } from 'react'
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

    const fetchTickets = useCallback(async () => {
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
                    created_by_user:users!tickets_created_by_fkey(id, full_name, email),
                    assigned_to_user:users!tickets_assigned_to_fkey(id, full_name, email)
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

            if (error) {
                console.error('Query error:', error)
                throw error
            }

            setTickets(data || [])
            setTotalCount(totalCount || 0)
        } catch (error) {
            console.error('Error fetching tickets:', error)
            setTickets([]) // Set empty array on error so UI doesn't break
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, currentPage]) // supabase removed to prevent infinite loop

    useEffect(() => {
        if (viewMode !== 'kanban') {
            fetchTickets()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, filters, currentPage]) // Only re-run when these change

    const handleFiltersChange = useCallback((newFilters: TicketFiltersType) => {
        setFilters(newFilters)
        setCurrentPage(1) // Reset to first page when filters change
    }, [])

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
                // Use landscape orientation to fit all 12 columns
                const doc = new jsPDF({ orientation: 'landscape' })

                // Title
                doc.setFontSize(18)
                doc.text('KCIC Tickets Report', 14, 20)

                // Metadata
                doc.setFontSize(10)
                doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
                doc.text(`Total Tickets: ${data.length}`, 14, 34)

                // Table data with enhanced columns including SLA
                const tableData = data.map((ticket: any) => [
                    // 1. Timestamp
                    new Date(ticket.created_at).toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    // 2. Ticket Number
                    ticket.custom_id || 'N/A',
                    // 3. Report Date
                    new Date(ticket.created_at).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    }),
                    // 4. Reporter Name
                    ticket.created_by_user?.full_name || 'Unknown',
                    // 5. Report Receiver Name (assigned_to)
                    ticket.assigned_to_user?.full_name || 'Unassigned',
                    // 6. Station & Location
                    `${ticket.station || 'N/A'}${ticket.location ? ' - ' + ticket.location : ''}`,
                    // 7. Asset Category (Equipment)
                    ticket.equipment_category || 'N/A',
                    // 8. Problem Description (truncated)
                    ticket.description.substring(0, 35) + (ticket.description.length > 35 ? '...' : ''),
                    // 9. Priority
                    ticket.priority.toUpperCase(),
                    // 10. Status
                    ticket.status.replace('_', ' ').toUpperCase(),
                    // 11. SLA Response
                    (ticket.sla_response_status || 'pending').toUpperCase(),
                    // 12. SLA Solving
                    (ticket.sla_solving_status || 'pending').toUpperCase(),
                    // 13. WR Document Number
                    ticket.wr_document_number || 'N/A',
                    // 14. Escalation Status
                    (ticket.escalation_status || 'no').toUpperCase()
                ])

                // Generate table with enhanced columns
                autoTable(doc, {
                    head: [[
                        'Timestamp',
                        'Ticket #',
                        'Report Date',
                        'Reporter',
                        'Receiver',
                        'Station & Loc',
                        'Asset Cat.',
                        'Problem',
                        'Priority',
                        'Status',
                        'SLA Resp',
                        'SLA Solve',
                        'WR Doc #',
                        'Escalation'
                    ]],
                    body: tableData,
                    startY: 40,
                    styles: {
                        fontSize: 7,
                        cellPadding: 2
                    },
                    headStyles: {
                        fillColor: [79, 70, 229],
                        fontSize: 7,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    columnStyles: {
                        0: { cellWidth: 24 }, // Timestamp
                        1: { cellWidth: 18 }, // Ticket #
                        2: { cellWidth: 16 }, // Report Date
                        3: { cellWidth: 18 }, // Reporter
                        4: { cellWidth: 18 }, // Receiver
                        5: { cellWidth: 22 }, // Station & Location
                        6: { cellWidth: 16 }, // Asset Category
                        7: { cellWidth: 30 }, // Problem (reduced for SLA columns)
                        8: { cellWidth: 14 }, // Priority
                        9: { cellWidth: 16 }, // Status
                        10: { cellWidth: 14 }, // SLA Response
                        11: { cellWidth: 14 }, // SLA Solving
                        12: { cellWidth: 18 }, // WR Doc #
                        13: { cellWidth: 14 }  // Escalation
                    }
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
