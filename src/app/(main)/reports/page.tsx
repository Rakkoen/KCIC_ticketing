'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TicketFilters, TicketFilters as TicketFiltersType } from '@/components/tickets/ticket-filters'
import { Calendar, Download, FileText, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { RouteProtection } from '@/components/route-protection'

export default function TicketReportPage() {
    return (
        <RouteProtection route="/reports">
            <TicketReportPageContent />
        </RouteProtection>
    )
}

function TicketReportPageContent() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [filters, setFilters] = useState<TicketFiltersType>({
        status: [],
        priority: [],
        assignee: [],
        dateRange: null
    })
    const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all')
    const [totalCount, setTotalCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        fetchTickets()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, timeFilter])

    const getTimeFilterRange = () => {
        const now = new Date()
        let startDate: Date | null = null

        switch (timeFilter) {
            case 'daily':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                break
            case 'weekly':
                const weekAgo = new Date(now)
                weekAgo.setDate(now.getDate() - 7)
                startDate = weekAgo
                break
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1)
                break
            default:
                startDate = null
        }

        return startDate
    }

    const fetchTickets = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('tickets')
                .select(`
                    *,
                    created_by_user:users!created_by(full_name, email),
                    assigned_to_user:users!assigned_to(full_name, email)
                `, { count: 'exact' })

            // Apply status filters
            if (filters.status.length > 0) {
                query = query.in('status', filters.status)
            }

            // Apply priority filters
            if (filters.priority.length > 0) {
                query = query.in('priority', filters.priority)
            }

            // Apply assignee filters
            if (filters.assignee.length > 0) {
                query = query.in('assigned_to', filters.assignee)
            }

            // Apply date range filters
            if (filters.dateRange) {
                if (filters.dateRange.from) {
                    query = query.gte('created_at', filters.dateRange.from)
                }
                if (filters.dateRange.to) {
                    query = query.lte('created_at', filters.dateRange.to)
                }
            }

            // Apply time filter
            const timeFilterStart = getTimeFilterRange()
            if (timeFilterStart) {
                query = query.gte('created_at', timeFilterStart.toISOString())
            }

            const { data, error, count } = await query.order('created_at', { ascending: false })

            if (error) throw error

            setTickets(data || [])
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Error fetching tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const generatePDF = () => {
        setGenerating(true)
        try {
            // Use landscape orientation to fit all 12 columns
            const doc = new jsPDF({ orientation: 'landscape' })

            // Title
            doc.setFontSize(18)
            doc.text('KCIC Ticket Report', 14, 20)

            // Report metadata
            doc.setFontSize(10)
            doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}`, 14, 28)
            doc.text(`Total Tickets: ${totalCount}`, 14, 34)
            doc.text(`Time Filter: ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`, 14, 40)

            // Filter summary
            let filterY = 46
            if (filters.status.length > 0) {
                doc.text(`Status Filter: ${filters.status.join(', ')}`, 14, filterY)
                filterY += 6
            }
            if (filters.priority.length > 0) {
                doc.text(`Priority Filter: ${filters.priority.join(', ')}`, 14, filterY)
                filterY += 6
            }

            // Table data with all 12 columns
            const tableData = tickets.map(ticket => [
                // 1. Timestamp
                new Date(ticket.created_at).toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                // 2. Ticket Number
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticket as any).custom_id || 'N/A',
                // 3. Report Date
                new Date(ticket.created_at).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }),
                // 4. Reporter Name
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticket as any).created_by_user?.full_name || 'Unknown',
                // 5. Report Receiver Name (assigned_to)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticket as any).assigned_to_user?.full_name || 'All Users',
                // 6. Station & Location
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                `${(ticket as any).station || 'N/A'}${(ticket as any).location ? ' - ' + (ticket as any).location : ''}`,
                // 7. Asset Category (Equipment)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticket as any).equipment_category || 'N/A',
                // 8. Problem Description (full text with wrapping)
                ticket.description,
                // 9. Priority
                ticket.priority.toUpperCase(),
                // 10. Status
                ticket.status.replace('_', ' ').toUpperCase(),
                // 11. WR Document Number
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticket as any).wr_document_number || 'N/A',
                // 12. Escalation Status
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ((ticket as any).escalation_status || 'no').toUpperCase()
            ])

            // Generate table with all 12 columns
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
                    'WR Doc #',
                    'Escalation'
                ]],
                body: tableData,
                startY: filterY + 6,
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak' // Enable text wrapping
                },
                headStyles: {
                    fillColor: [79, 70, 229],
                    fontSize: 7,
                    fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                columnStyles: {
                    0: { cellWidth: 22 }, // Timestamp
                    1: { cellWidth: 18 }, // Ticket #
                    2: { cellWidth: 18 }, // Report Date
                    3: { cellWidth: 20 }, // Reporter
                    4: { cellWidth: 20 }, // Receiver
                    5: { cellWidth: 22 }, // Station & Location
                    6: { cellWidth: 16 }, // Asset Category
                    7: { cellWidth: 'auto', overflow: 'linebreak' }, // Problem - auto width with wrapping
                    8: { cellWidth: 14 }, // Priority
                    9: { cellWidth: 16 }, // Status
                    10: { cellWidth: 20 }, // WR Doc #
                    11: { cellWidth: 16 }  // Escalation
                }
            })

            // Save PDF
            const fileName = `ticket-report-${timeFilter}-${new Date().getTime()}.pdf`
            doc.save(fileName)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Ticket Reports</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Generate and export ticket reports with filters
                    </p>
                </div>
                <button
                    onClick={generatePDF}
                    disabled={generating || tickets.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {generating ? (
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="-ml-1 mr-2 h-5 w-5" />
                            Export PDF
                        </>
                    )}
                </button>
            </div>

            {/* Time Filter */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Time Period</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['all', 'daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                        <button
                            key={period}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={() => setTimeFilter(period as any)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeFilter === period
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">Filters</h3>
                <TicketFilters onFiltersChange={setFilters} />
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Tickets</p>
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalCount}</p>
                    </div>
                    <FileText className="h-12 w-12 text-indigo-600" />
                </div>
            </div>

            {/* Ticket List Preview */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Report Preview</h3>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">No tickets found with current filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Ticket ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Assigned To
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(ticket as any).custom_id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-white max-w-xs truncate">
                                            {ticket.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {ticket.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'closed' ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-400' :
                                                ticket.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {ticket.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(ticket as any).assigned_to_user?.full_name || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
