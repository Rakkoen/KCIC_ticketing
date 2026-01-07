'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, User as UserIcon } from 'lucide-react'

interface AssigneeSelectProps {
    ticketId: string
    currentAssignee: string | null
    userRole: 'admin' | 'manager' | 'worker' | 'employee'
}

interface User {
    id: string
    full_name: string | null
    email: string
    role: 'admin' | 'manager' | 'worker' | 'employee'
}

export function AssigneeSelect({ ticketId, currentAssignee, userRole }: AssigneeSelectProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || '')
    const router = useRouter()
    const supabase = createClient()

    // Only admins and managers can assign tickets
    const canAssign = userRole === 'admin' || userRole === 'manager'

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        setSelectedAssignee(currentAssignee || '')
    }, [currentAssignee])

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, role')
            .eq('role', 'technician') // Only fetch technicians
            .order('full_name')

        if (error) {
            console.error('Error fetching users:', error)
        } else {
            setUsers(data || [])
        }
    }

    const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAssigneeId = e.target.value
        if (newAssigneeId === selectedAssignee) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('tickets')
                .update({ assigned_to: newAssigneeId || null })
                .eq('id', ticketId)

            if (error) throw error

            setSelectedAssignee(newAssigneeId)
            router.refresh()
        } catch (error) {
            console.error('Error updating assignee:', error)
        } finally {
            setLoading(false)
        }
    }

    const currentAssigneeUser = users.find(u => u.id === currentAssignee)

    if (!canAssign) {
        return (
            <div>
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Assignee</h3>
                <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="h-4 w-4 text-zinc-400" />
                    <span className="text-zinc-900 dark:text-white">
                        {currentAssigneeUser?.full_name || 'Unassigned'}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Assignee</h3>
            <div className="relative">
                <select
                    disabled={loading}
                    value={selectedAssignee}
                    onChange={handleAssigneeChange}
                    className="appearance-none bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 disabled:opacity-50"
                >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.full_name || user.email} ({user.role})
                        </option>
                    ))}
                </select>
                {loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    </div>
                )}
            </div>
        </div>
    )
}