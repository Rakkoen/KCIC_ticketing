'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { WorkerCard } from '@/components/workers/worker-card'
import { Users, Search, Filter } from 'lucide-react'

type Worker = Database['public']['Tables']['users']['Row'] & {
    tickets_assigned?: number
    tickets_in_progress?: number
    incidents_assigned?: number
}

export default function WorkersPage() {
    const [workers, setWorkers] = useState<Worker[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchWorkers()
    }, [roleFilter, statusFilter])

    const fetchWorkers = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from('users')
                .select('*')
                .in('role', ['admin', 'manager', 'worker'])
                .order('full_name')

            if (roleFilter) {
                query = query.eq('role', roleFilter)
            }

            if (statusFilter) {
                query = query.eq('availability_status', statusFilter)
            }

            const { data: usersData, error } = await query

            if (error) throw error

            // Fetch workload stats for each worker
            const workersWithStats = await Promise.all(
                (usersData || []).map(async (user) => {
                    const { data: ticketStats } = await supabase
                        .from('tickets')
                        .select('id, status', { count: 'exact' })
                        .eq('assigned_to', user.id)

                    const { data: incidentStats } = await supabase
                        .from('incidents')
                        .select('id', { count: 'exact' })
                        .eq('assigned_to', user.id)

                    return {
                        ...user,
                        tickets_assigned: ticketStats?.length || 0,
                        tickets_in_progress: ticketStats?.filter(t => t.status === 'in_progress').length || 0,
                        incidents_assigned: incidentStats?.length || 0
                    }
                })
            )

            setWorkers(workersWithStats)
        } catch (error) {
            console.error('Error fetching workers:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredWorkers = workers.filter(worker => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return (
            worker.full_name?.toLowerCase().includes(query) ||
            worker.email.toLowerCase().includes(query)
        )
    })

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Team Directory</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Manage your support team and monitor workload
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                    />
                </div>

                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="worker">Worker</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                >
                    <option value="">All Status</option>
                    <option value="online">Online</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                </select>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-zinc-400" />
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Workers</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{filteredWorkers.length}</p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Online</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {filteredWorkers.filter(w => w.availability_status === 'online').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Busy</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {filteredWorkers.filter(w => w.availability_status === 'busy').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-zinc-400"></div>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Offline</span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {filteredWorkers.filter(w => w.availability_status === 'offline').length}
                    </p>
                </div>
            </div>

            {/* Workers Grid */}
            {filteredWorkers.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredWorkers.map((worker) => (
                        <WorkerCard key={worker.id} worker={worker} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                    <Users className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No workers found</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {searchQuery || roleFilter || statusFilter
                            ? 'Try adjusting your filters'
                            : 'No team members to display'}
                    </p>
                </div>
            )}
        </div>
    )
}
