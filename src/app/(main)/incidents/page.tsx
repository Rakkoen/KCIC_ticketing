'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react'
import Link from 'next/link'

type Incident = Database['public']['Tables']['incidents']['Row'] & {
    created_by_user?: {
        full_name: string | null
        email: string
    }
    assigned_to_user?: {
        full_name: string | null
        email: string
    }
}

const ITEMS_PER_PAGE = 12

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        severity: '',
        status: '',
        category: ''
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        fetchIncidents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, currentPage])

    const fetchIncidents = async () => {
        setLoading(true)
        try {
            // Get total count with filters
            let countQuery = supabase.from('incidents').select('*', { count: 'exact', head: true })

            if (filters.severity) {
                countQuery = countQuery.eq('severity', filters.severity)
            }
            if (filters.status) {
                countQuery = countQuery.eq('status', filters.status)
            }
            if (filters.category) {
                countQuery = countQuery.ilike('category', `%${filters.category}%`)
            }

            const { count, error: countError } = await countQuery
            if (countError) throw countError

            // Get paginated data
            let query = supabase
                .from('incidents')
                .select(`
                    *,
                    created_by_user:users!created_by(*),
                    assigned_to_user:users!assigned_to(*)
                `)

            if (filters.severity) {
                query = query.eq('severity', filters.severity)
            }
            if (filters.status) {
                query = query.eq('status', filters.status)
            }
            if (filters.category) {
                query = query.ilike('category', `%${filters.category}%`)
            }

            const from = (currentPage - 1) * ITEMS_PER_PAGE
            const to = from + ITEMS_PER_PAGE - 1

            const { data, error } = await query
                .order('detected_at', { ascending: false })
                .range(from, to)

            if (error) throw error

            setIncidents(data || [])
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Error fetching incidents:', error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityVariant = (severity: string) => {
        const variants = {
            low: 'secondary',
            medium: 'info',
            high: 'warning',
            critical: 'destructive'
        }
        return variants[severity as keyof typeof variants] || 'default'
    }

    const getStatusVariant = (status: string) => {
        const variants = {
            open: 'info',
            investigating: 'warning',
            resolved: 'success',
            closed: 'secondary'
        }
        return variants[status as keyof typeof variants] || 'default'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <AlertTriangle className="h-4 w-4" />
            case 'investigating':
                return <Clock className="h-4 w-4" />
            case 'resolved':
                return <CheckCircle className="h-4 w-4" />
            case 'closed':
                return <XCircle className="h-4 w-4" />
            default:
                return <AlertTriangle className="h-4 w-4" />
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
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Incidents</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Track and manage system incidents.</p>
                </div>
                <Link
                    href="/incidents/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Incident
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label htmlFor="severity-filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Severity
                        </label>
                        <select
                            id="severity-filter"
                            value={filters.severity}
                            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                            className="rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="">All Severities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Status
                        </label>
                        <select
                            id="status-filter"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="category-filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category-filter"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            placeholder="Filter by category..."
                            className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                        />
                    </div>
                </div>
            </div>

            {/* Incidents List */}
            {incidents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                    <AlertTriangle className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                    <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">No incidents found</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {filters.severity || filters.status || filters.category
                            ? 'Try adjusting your filters or create a new incident.'
                            : 'No incidents have been reported yet.'}
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/incidents/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            New Incident
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <Link
                                key={incident.id}
                                href={`/incidents/${incident.id}`}
                                className="block bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white truncate">
                                                {incident.title}
                                            </h3>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            <Badge variant={getSeverityVariant(incident.severity) as any}>
                                                {incident.severity.toUpperCase()}
                                            </Badge>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(incident.status)}
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <Badge variant={getStatusVariant(incident.status) as any} className="text-xs">
                                                    {incident.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                                            {incident.description}
                                        </p>
                                        <div className="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                                            <span>
                                                Detected: {new Date(incident.detected_at).toLocaleDateString()}
                                            </span>
                                            {incident.affected_users > 0 && (
                                                <span>
                                                    {incident.affected_users} users affected
                                                </span>
                                            )}
                                            {incident.category && (
                                                <span>
                                                    Category: {incident.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
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