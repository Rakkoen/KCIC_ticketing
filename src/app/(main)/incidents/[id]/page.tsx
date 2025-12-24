'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    ArrowLeft,
    Edit,
    Save,
    Plus
} from 'lucide-react'
import Link from 'next/link'
import { useUserRole } from '@/hooks/use-user-role'

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

type IncidentHistory = Database['public']['Tables']['incident_history']['Row'] & {
    changed_by_user?: {
        full_name: string | null
        email: string
    }
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [incident, setIncident] = useState<Incident | null>(null)
    const [history, setHistory] = useState<IncidentHistory[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [relatedTickets, setRelatedTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        root_cause_analysis: '',
        resolution_summary: '',
        resolution_steps: ['']
    })
    const { userRole } = useUserRole()
    const supabase = createClient()

    useEffect(() => {
        fetchIncident()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params])

    const fetchIncident = async () => {
        const id = (await params).id
        setLoading(true)

        try {
            // Fetch incident details
            const { data: incidentData, error: incidentError } = await supabase
                .from('incidents')
                .select(`
                    *,
                    created_by_user:users!created_by(*),
                    assigned_to_user:users!assigned_to(*)
                `)
                .eq('id', id)
                .single()

            if (incidentError || !incidentData) {
                throw new Error('Incident not found')
            }

            // Fetch incident history
            const { data: historyData, error: historyError } = await supabase
                .from('incident_history')
                .select(`
                    *,
                    changed_by_user:users!changed_by(*)
                `)
                .eq('incident_id', id)
                .order('created_at', { ascending: false })

            // Fetch related tickets
            const { data: ticketsData, error: ticketsError } = await supabase
                .from('incident_tickets')
                .select(`
                    tickets!ticket_id(*)
                `)
                .eq('incident_id', id)

            if (historyError || ticketsError) {
                throw new Error('Error fetching additional data')
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const tickets = ticketsData?.map(item => item.tickets) || []

            setIncident(incidentData)
            setHistory(historyData || [])
            setRelatedTickets(tickets)
        } catch (error) {
            console.error('Error fetching incident:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        if (!incident) return

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                status: newStatus,
                resolved_at: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : null
            }

            const { error } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('incidents') as any)
                .update(updateData)
                .eq('id', incident.id)

            if (error) throw error

            // Refresh the incident data
            fetchIncident()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        }
    }

    const handleSaveRCA = async () => {
        if (!incident) return

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                root_cause_analysis: editForm.root_cause_analysis || null,
                resolution_summary: editForm.resolution_summary || null,
                resolution_steps: editForm.resolution_steps.filter(step => step.trim() !== '') || null
            }

            const { error } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('incidents') as any)
                .update(updateData)
                .eq('id', incident.id)

            if (error) throw error

            setEditing(false)
            fetchIncident()
        } catch (error) {
            console.error('Error saving RCA:', error)
            alert('Failed to save RCA')
        }
    }

    const getSeverityVariant = (severity: string) => {
        const variants = {
            low: 'secondary',
            medium: 'info',
            high: 'warning',
            critical: 'destructive'
        }
        return (variants[severity as keyof typeof variants] || 'default') as "default" | "secondary" | "destructive" | "outline" | "secondary" | "info" | "success" | "warning"
    }

    const getStatusVariant = (status: string) => {
        const variants = {
            open: 'info',
            investigating: 'warning',
            resolved: 'success',
            closed: 'secondary'
        }
        return (variants[status as keyof typeof variants] || 'default') as "default" | "secondary" | "destructive" | "outline" | "secondary" | "info" | "success" | "warning"
    }

    const canEdit = userRole === 'admin' || userRole === 'manager'

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!incident) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-500 dark:text-zinc-400">Incident not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/incidents" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                    {incident.title}
                </h1>
                <Badge variant="outline" className="ml-2 font-mono text-xs">#{incident.id.slice(0, 8)}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Details */}
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Incident Details</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</span>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={getStatusVariant(incident.status)}>
                                        {incident.status.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    {canEdit && (
                                        <select
                                            value={incident.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                                        >
                                            <option value="open">Open</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Severity</span>
                                <Badge variant={getSeverityVariant(incident.severity)}>
                                    {incident.severity.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Impact</span>
                                <span className="text-sm text-zinc-900 dark:text-white">
                                    {incident.impact?.toUpperCase() || 'NONE'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Urgency</span>
                                <span className="text-sm text-zinc-900 dark:text-white">
                                    {incident.urgency?.toUpperCase() || 'NONE'}
                                </span>
                            </div>

                            {incident.category && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Category</span>
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {incident.category}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Affected Users</span>
                                <span className="text-sm text-zinc-900 dark:text-white">
                                    {incident.affected_users}
                                </span>
                            </div>

                            {incident.estimated_downtime_minutes && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Estimated Downtime</span>
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {incident.estimated_downtime_minutes} minutes
                                    </span>
                                </div>
                            )}

                            {incident.actual_downtime_minutes && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Actual Downtime</span>
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {incident.actual_downtime_minutes} minutes
                                    </span>
                                </div>
                            )}

                            {incident.affected_systems && incident.affected_systems.length > 0 && (
                                <div>
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Affected Systems</span>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {incident.affected_systems.map((system, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {system}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Detected</span>
                                <span className="text-sm text-zinc-900 dark:text-white">
                                    {new Date(incident.detected_at).toLocaleString()}
                                </span>
                            </div>

                            {incident.resolved_at && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Resolved</span>
                                    <span className="text-sm text-zinc-900 dark:text-white">
                                        {new Date(incident.resolved_at).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Description</h3>
                        <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                            {incident.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* People */}
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">People</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Reporter</span>
                                <div className="text-sm text-zinc-900 dark:text-white">
                                    {incident.created_by_user?.full_name || 'Unknown'}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Assignee</span>
                                <div className="text-sm text-zinc-900 dark:text-white">
                                    {incident.assigned_to_user?.full_name || 'Unassigned'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Tickets */}
                    {relatedTickets.length > 0 && (
                        <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Related Tickets</h3>
                                <Link
                                    href={`/incidents/${incident.id}/tickets`}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Manage
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {relatedTickets.map((ticket: any) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/tickets/${ticket.id}`}
                                        className="block p-3 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                {ticket.title}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                #{ticket.id.slice(0, 8)}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RCA Section */}
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Root Cause Analysis</h3>
                            {canEdit && (
                                <button
                                    onClick={() => setEditing(!editing)}
                                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    {editing ? (
                                        <Save className="h-4 w-4" />
                                    ) : (
                                        <Edit className="h-4 w-4" />
                                    )}
                                </button>
                            )}
                        </div>

                        {editing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Root Cause Analysis
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={editForm.root_cause_analysis}
                                        onChange={(e) => setEditForm({ ...editForm, root_cause_analysis: e.target.value })}
                                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                                        placeholder="Describe the root cause of this incident..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Resolution Summary
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={editForm.resolution_summary}
                                        onChange={(e) => setEditForm({ ...editForm, resolution_summary: e.target.value })}
                                        className="block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                                        placeholder="Summarize how this incident was resolved..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Resolution Steps
                                    </label>
                                    {editForm.resolution_steps.map((step, index) => (
                                        <div key={index} className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="text"
                                                value={step}
                                                onChange={(e) => {
                                                    const newSteps = [...editForm.resolution_steps]
                                                    newSteps[index] = e.target.value
                                                    setEditForm({ ...editForm, resolution_steps: newSteps })
                                                }}
                                                className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                                                placeholder={`Step ${index + 1}`}
                                            />
                                            {editForm.resolution_steps.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSteps = editForm.resolution_steps.filter((_, i) => i !== index)
                                                        setEditForm({ ...editForm, resolution_steps: newSteps })
                                                    }}
                                                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, resolution_steps: [...editForm.resolution_steps, ''] })}
                                        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Step
                                    </button>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="bg-white dark:bg-zinc-800 py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveRCA}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {incident.root_cause_analysis && (
                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Root Cause Analysis</h4>
                                        <div className="prose dark:prose-invert text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                            {incident.root_cause_analysis}
                                        </div>
                                    </div>
                                )}
                                {incident.resolution_summary && (
                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Resolution Summary</h4>
                                        <div className="prose dark:prose-invert text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                            {incident.resolution_summary}
                                        </div>
                                    </div>
                                )}
                                {incident.resolution_steps && incident.resolution_steps.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Resolution Steps</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                                            {incident.resolution_steps.map((step, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="font-medium">{index + 1}.</span>
                                                    <span className="ml-2">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                                {!incident.root_cause_analysis && !incident.resolution_summary && (!incident.resolution_steps || incident.resolution_steps.length === 0) && (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                                        No root cause analysis or resolution information available yet.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-zinc-800 shadow sm:rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Activity Timeline</h3>
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    No activity recorded yet.
                                </p>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-3 pb-4 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {new Date(item.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {item.action}
                                            </div>
                                        </div>
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                            {item.changed_by_user?.full_name || 'System'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}