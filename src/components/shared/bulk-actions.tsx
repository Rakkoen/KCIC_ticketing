'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckSquare, Trash2, UserPlus, Tag } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BulkActionsProps {
    selectedIds: string[]
    onComplete: () => void
    entityType: 'tickets' | 'incidents'
}

export function BulkActions({ selectedIds, onComplete, entityType }: BulkActionsProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    if (selectedIds.length === 0) {
        return null
    }

    const handleBulkStatusChange = async (newStatus: string) => {
        setLoading(true)
        try {
            const table = entityType === 'tickets' ? 'tickets' : 'incidents'
            const { error } = await supabase
                .from(table)
                .update({ status: newStatus })
                .in('id', selectedIds)

            if (!error) {
                onComplete()
                router.refresh()
            }
        } catch (error) {
            console.error('Bulk status update failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBulkAssign = async () => {
        // In a real app, this would open a modal to select assignee
        const assigneeId = prompt('Enter assignee user ID:')
        if (!assigneeId) return

        setLoading(true)
        try {
            const table = entityType === 'tickets' ? 'tickets' : 'incidents'
            const { error } = await supabase
                .from(table)
                .update({ assigned_to: assigneeId })
                .in('id', selectedIds)

            if (!error) {
                onComplete()
                router.refresh()
            }
        } catch (error) {
            console.error('Bulk assign failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} ${entityType}?`)) {
            return
        }

        setLoading(true)
        try {
            const table = entityType === 'tickets' ? 'tickets' : 'incidents'
            const { error } = await supabase
                .from(table)
                .delete()
                .in('id', selectedIds)

            if (!error) {
                onComplete()
                router.refresh()
            }
        } catch (error) {
            console.error('Bulk delete failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-700 p-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {selectedIds.length} selected
                    </span>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-600"></div>

                    {/* Status Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkStatusChange('in_progress')}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm rounded bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 disabled:opacity-50"
                        >
                            <CheckSquare className="h-4 w-4 inline mr-1" />
                            In Progress
                        </button>
                        <button
                            onClick={() => handleBulkStatusChange('resolved')}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm rounded bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 disabled:opacity-50"
                        >
                            <CheckSquare className="h-4 w-4 inline mr-1" />
                            Resolve
                        </button>
                    </div>

                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-600"></div>

                    {/* Assignment */}
                    <button
                        onClick={handleBulkAssign}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm rounded bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 disabled:opacity-50"
                    >
                        <UserPlus className="h-4 w-4 inline mr-1" />
                        Assign
                    </button>

                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-600"></div>

                    {/* Delete */}
                    <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm rounded bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}
