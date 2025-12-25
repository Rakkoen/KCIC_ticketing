'use client'

import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts'

interface TicketChartsProps {
    timeRange?: '7d' | '30d' | '90d'
}

const COLORS = {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6',
    indigo: '#6366F1',
    gray: '#6B7280'
}

// Optimization: Memoize the component
export const TicketCharts = memo(function TicketCharts({ timeRange = '7d' }: TicketChartsProps) {
    const [statusData, setStatusData] = useState<any[]>([])
    const [priorityData, setPriorityData] = useState<any[]>([])
    const [trendData, setTrendData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Optimization: useCallback for fetch function
    const fetchChartData = useCallback(async () => {
        setLoading(true)
        try {
            // Calculate date range
            const now = new Date()
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
            const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

            // Fetch status distribution
            const { data: statusDataRaw, error: statusError } = await supabase
                .from('tickets')
                .select('status')
                .gte('created_at', startDate.toISOString())

            // Fetch priority distribution
            const { data: priorityDataRaw, error: priorityError } = await supabase
                .from('tickets')
                .select('priority')
                .gte('created_at', startDate.toISOString())

            // Fetch trend data (daily ticket creation)
            const { data: trendDataRaw, error: trendError } = await supabase
                .from('tickets')
                .select('created_at')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true })

            if (statusError || priorityError || trendError) {
                throw new Error('Error fetching chart data')
            }

            // Process status data
            const statusCounts = statusDataRaw?.reduce((acc: any, ticket: any) => {
                const status = ticket.status.replace('_', ' ')
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {}) || {}

            const processedStatusData = Object.entries(statusCounts).map(([name, value]) => ({
                name,
                value
            }))

            // Process priority data
            const priorityCounts = priorityDataRaw?.reduce((acc: any, ticket: any) => {
                acc[ticket.priority] = (acc[ticket.priority] || 0) + 1
                return acc
            }, {}) || {}

            const processedPriorityData = Object.entries(priorityCounts).map(([name, value]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value
            }))

            // Process trend data
            const dailyCounts = trendDataRaw?.reduce((acc: any, ticket: any) => {
                const date = new Date(ticket.created_at).toLocaleDateString()
                acc[date] = (acc[date] || 0) + 1
                return acc
            }, {}) || {}

            const processedTrendData = Object.entries(dailyCounts)
                .map(([date, count]) => ({
                    date,
                    tickets: count
                }))
                .slice(-7) // Last 7 days for cleaner chart

            setStatusData(processedStatusData)
            setPriorityData(processedPriorityData)
            setTrendData(processedTrendData)
        } catch (error) {
            console.error('Error fetching chart data:', error)
        } finally {
            setLoading(false)
        }
    }, [timeRange, supabase])

    useEffect(() => {
        fetchChartData()
    }, [fetchChartData])

    // Optimization: Memoize render content for PieChart to prevent unnecessary re-computations 
    // although Recharts handles its own updates, keeping data stable helps.
    const renderPieChart = useMemo(() => (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {statusData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={
                                entry.name === 'New' ? COLORS.blue :
                                    entry.name === 'In progress' ? COLORS.yellow :
                                        entry.name === 'Resolved' ? COLORS.green :
                                            COLORS.gray
                            }
                        />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    ), [statusData]) // Only re-render when statusData changes

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 animate-pulse">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
                        <div className="h-64 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                    Status Distribution
                </h3>
                {renderPieChart}
            </div>

            {/* Priority Distribution Bar Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                    Priority Breakdown
                </h3>
                {/* Optimization: Directly use ResponsiveContainer here as logic is simple */}
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                            dataKey="value"
                            fill={COLORS.indigo}
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 7-Day Trend Line Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 lg:col-span-2">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                    7-Day Ticket Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="tickets"
                            stroke={COLORS.blue}
                            strokeWidth={2}
                            dot={{ fill: COLORS.blue, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
})