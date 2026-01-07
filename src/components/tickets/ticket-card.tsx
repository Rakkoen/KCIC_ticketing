'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database.types'
import { User as UserIcon, Calendar, MoreVertical, Edit, Trash2, MapPin, Package, FileText, AlertCircle, MessageSquare, Users, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SLAIndicator } from './sla-indicator'
import { ActivityLogSummary } from './activity-log-summary'
import { AssignedTechnician } from '@/types/ticket-assignees.types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type Ticket = Database['public']['Tables']['tickets']['Row'] & {
    created_by_user?: {
        full_name: string | null
        email: string
    }
    assigned_to_user?: {
        full_name: string | null
        email: string
    }
}

interface TicketCardProps {
    ticket: Ticket
    viewMode?: 'grid' | 'list'
    onDelete?: () => void
    assignees?: AssignedTechnician[]
}

export function TicketCard({ ticket, viewMode = 'grid', onDelete, assignees = [] }: TicketCardProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const statusVariants: Record<string, string> = {
        open: 'info',
        in_progress: 'warning',
        on_escalation: 'destructive',
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

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('tickets')
                .delete()
                .eq('id', ticket.id)

            if (error) throw error

            if (onDelete) onDelete()
            router.refresh()
        } catch (error) {
            console.error('Error deleting ticket:', error)
            alert('Failed to delete ticket. Please try again.')
        } finally {
            setDeleting(false)
            setShowMenu(false)
        }
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(`/tickets/${ticket.id}/edit`)
    }

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowMenu(!showMenu)
    }

    if (viewMode === 'list') {
        return (
            <div className="relative bg-white dark:bg-zinc-800 shadow rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                <Link href={`/tickets/${ticket.id}`} className="block">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                                {(ticket as any).custom_id && (
                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                                        {(ticket as any).custom_id}
                                    </span>
                                )}
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white truncate">
                                    {ticket.title}
                                </h3>
                                <Badge variant={priorityVariant} className="flex-shrink-0">
                                    {ticket.priority}
                                </Badge>
                                <Badge variant={statusVariant} className="flex-shrink-0">
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {ticket.description}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
                                <div className="flex items-center">
                                    <UserIcon className="h-3 w-3 mr-1" />
                                    {ticket.created_by_user?.full_name || 'Unknown'}
                                </div>
                                {ticket.assigned_to_user?.full_name && (
                                    <div className="flex items-center">
                                        <UserIcon className="h-3 w-3 mr-1" />
                                        Assigned to: {ticket.assigned_to_user.full_name}
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                                {(ticket as any).station && (
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {(ticket as any).station}
                                    </div>
                                )}
                                {(ticket as any).location && (
                                    <div className="flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Location: {(ticket as any).location}
                                    </div>
                                )}
                                {(ticket as any).equipment_category && (
                                    <div className="flex items-center">
                                        <Package className="h-3 w-3 mr-1" />
                                        {(ticket as any).equipment_category}
                                    </div>
                                )}
                                {(ticket as any).wr_document_number && (
                                    <div className="flex items-center">
                                        <FileText className="h-3 w-3 mr-1" />
                                        WR: {(ticket as any).wr_document_number}
                                    </div>
                                )}
                                {(ticket as any).escalation_status && (ticket as any).escalation_status !== 'no' && (
                                    <div className="flex items-center">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Escalation: {(ticket as any).escalation_status}
                                    </div>
                                )}
                            </div>
                            {(ticket as any).comments && (
                                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start">
                                    <MessageSquare className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{(ticket as any).comments}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Link>

                {/* Action Menu */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={handleMenuToggle}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        disabled={deleting}
                    >
                        <MoreVertical className="h-5 w-5 text-zinc-500" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 z-10">
                            <button
                                onClick={handleEdit}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Ticket
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {deleting ? 'Deleting...' : 'Delete Ticket'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="relative bg-white dark:bg-zinc-800 shadow rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
            <Link href={`/tickets/${ticket.id}`} className="block">
                {(ticket as any).custom_id && (
                    <div className="mb-2">
                        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded">
                            {(ticket as any).custom_id}
                        </span>
                    </div>
                )}
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
                {ticket.assigned_to_user?.full_name && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Assigned to: {ticket.assigned_to_user.full_name}
                    </div>
                )}
                {(ticket as any).station && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {(ticket as any).station}
                    </div>
                )}
                {(ticket as any).location && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location: {(ticket as any).location}
                    </div>
                )}
                {(ticket as any).equipment_category && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        Asset Category: {(ticket as any).equipment_category}
                    </div>
                )}

                {/* Assigned Technicians */}
                {assignees && assignees.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                        <div className="flex items-center gap-1 mb-2">
                            <Users className="h-3 w-3 text-zinc-500" />
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                Assigned Technicians
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {assignees.map((assignee) => (
                                <div
                                    key={assignee.id}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${assignee.is_primary
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                                        }`}
                                    title={assignee.email}
                                >
                                    <span className="font-medium">{assignee.full_name}</span>
                                    {assignee.is_primary && (
                                        <span className="text-[10px] opacity-75">(Primary)</span>
                                    )}
                                    {assignee.completed_at && (
                                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(ticket as any).wr_document_number && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        WR: {(ticket as any).wr_document_number}
                    </div>
                )}
                {(ticket as any).escalation_status && (ticket as any).escalation_status !== 'no' && (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Escalation: {(ticket as any).escalation_status}
                    </div>
                )}
                {(ticket as any).comments && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-start">
                        <MessageSquare className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{(ticket as any).comments}</span>
                    </div>
                )}

                {/* SLA Indicator */}
                <SLAIndicator ticket={ticket} compact />

                {/* Activity Log Summary */}
                <ActivityLogSummary ticketId={ticket.id} limit={2} />
            </Link>

            {/* Action Menu */}
            <div className="absolute top-3 right-3">
                <button
                    onClick={handleMenuToggle}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    disabled={deleting}
                >
                    <MoreVertical className="h-5 w-5 text-zinc-500" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 z-10">
                        <button
                            onClick={handleEdit}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center rounded-t-md"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Ticket
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center disabled:opacity-50 rounded-b-md"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleting ? 'Deleting...' : 'Delete Ticket'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
