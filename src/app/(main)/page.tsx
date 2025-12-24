'use client'

import { useState } from 'react'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TicketCharts } from '@/components/dashboard/ticket-charts'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { useUserRole } from '@/hooks/use-user-role'
import { Calendar, Filter } from 'lucide-react'

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
    const { userRole, loading: roleLoading } = useUserRole()

    if (roleLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with time range selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Welcome back! Here&apos;s what&apos;s happening with your tickets today.
                    </p>
                </div>

                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <select
                        value={timeRange}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards timeRange={timeRange} />

            {/* Quick Actions */}
            <QuickActions userRole={userRole || 'employee'} />

            {/* Charts */}
            <TicketCharts timeRange={timeRange} />

            {/* Recent Activity Placeholder */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                        Recent Activity
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                        View all
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Placeholder for recent activity */}
                    <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                        <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Recent activity will appear here</p>
                        <p className="text-sm mt-2">
                            This feature will be implemented with real-time updates
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
