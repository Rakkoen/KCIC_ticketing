
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface StatusSelectProps {
    ticketId: string
    currentStatus: 'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'
}

export function StatusSelect({ ticketId, currentStatus }: StatusSelectProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as any
        if (newStatus === currentStatus) return

        setLoading(true)

        console.log('=== Status Update Debug ===')
        console.log('Ticket ID:', ticketId)
        console.log('Current Status:', currentStatus)
        console.log('New Status:', newStatus)

        try {
            // Check authentication first
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            console.log('Auth user:', user?.id)
            console.log('Auth error:', authError)

            if (!user) {
                alert('You are not authenticated. Please log in again.')
                return
            }

            console.log('Attempting update...')
            const { error, data } = await supabase
                .from('tickets')
                .update({ status: newStatus })
                .eq('id', ticketId)
                .select()

            console.log('Update response data:', data)
            console.log('Update response error:', error)
            console.log('Error type:', typeof error)
            console.log('Error constructor:', error?.constructor?.name)
            console.log('Error as JSON:', JSON.stringify(error))

            if (error) {
                console.error('Supabase error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    rawError: error
                })
                alert(`Failed to update status: ${error.message || 'Unknown error'}. Please check your permissions.`)
                throw error
            }

            if (!data || data.length === 0) {
                console.error('No rows updated. Possible RLS issue.')
                alert('No ticket was updated. You may not have permission to update this ticket.')
                return
            }

            console.log('Update successful!')
            router.refresh()
        } catch (error) {
            console.error('Caught error:', error)
            console.error('Error type:', typeof error)
            console.error('Error string:', String(error))
            console.error('Error JSON:', JSON.stringify(error))
        } finally {
            setLoading(false)
        }
    }

    const statusVariants: Record<string, string> = {
        open: 'info',
        in_progress: 'warning',
        on_escalation: 'destructive',
        resolved: 'success',
        closed: 'secondary'
    }

    const statusVariant = (statusVariants[currentStatus] || 'default') as any

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status:</span>
            <div className="relative">
                <select
                    disabled={loading}
                    value={currentStatus}
                    onChange={handleStatusChange}
                    className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 disabled:opacity-50"
                >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_escalation">On Escalation</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                {loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    </div>
                )}
            </div>
            <Badge variant={statusVariant}>{currentStatus.replace('_', ' ')}</Badge>
        </div>
    )
}
