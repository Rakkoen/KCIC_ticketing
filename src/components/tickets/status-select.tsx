
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface StatusSelectProps {
    ticketId: string
    currentStatus: 'new' | 'in_progress' | 'resolved' | 'closed'
}

export function StatusSelect({ ticketId, currentStatus }: StatusSelectProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as any
        if (newStatus === currentStatus) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('tickets')
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .update({ status: newStatus })
                .eq('id', ticketId)

            if (error) throw error

            router.refresh()
        } catch (error) {
            console.error('Error updating status:', error)
        } finally {
            setLoading(false)
        }
    }

    const statusVariants: Record<string, string> = {
        new: 'info',
        in_progress: 'warning',
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
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
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
