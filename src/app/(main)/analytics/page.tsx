'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, Users, Ticket, Clock, CheckCircle } from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { Database } from '@/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('7d')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalTickets: 0,
        resolvedTickets: 0,
        avgResponseTime: '0h',
        avgResolutionTime: '0h',
        slaCompliance: 0
    })
    const [trendData, setTrendData] = useState<{ date: string; tickets: number; resolved: number }[]>([])
    const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([])
    const [priorityDistribution, setPriorityDistribution] = useState<{ name: string; value: number }[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchAnalytics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange])

    const getDateRangeFilter = () => {
        const days = parseInt(dateRange.replace('d', ''))
        const endDate = endOfDay(new Date())
        const startDate = startOfDay(subDays(endDate, days))
        return { startDate, endDate }
    }

    const fetchAnalytics = async () => {
        setLoading(true)
        const { startDate, endDate } = getDateRangeFilter()

        try {
            // Fetch tickets for the date range
            const { data: tickets } = await supabase
                .from('tickets')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .returns<Ticket[]>()


            if (tickets) {
                // Calculate KPIs
                const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const withResponse = tickets.filter(t => (t as any).first_response_at)

                // Calculate average response time (in hours)
                const avgResponse = withResponse.length > 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? withResponse.reduce((sum, t: any) => {
                        const created = new Date(t.created_at).getTime()
                        const responded = new Date(t.first_response_at).getTime()
                        return sum + (responded - created)
                    }, 0) / withResponse.length / (1000 * 60 * 60)
                    : 0

                // Calculate average resolution time
                const avgResolution = resolved.length > 0
                    ? resolved.reduce((sum, t) => {
                        const created = new Date(t.created_at).getTime()
                        const updated = new Date(t.updated_at).getTime()
                        return sum + (updated - created)
                    }, 0) / resolved.length / (1000 * 60 * 60)
                    : 0

                // SLA compliance
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const slaCompliant = tickets.filter(t => !(t as any).sla_breach).length
                const compliance = tickets.length > 0 ? (slaCompliant / tickets.length) * 100 : 100

                setStats({
                    totalTickets: tickets.length,
                    resolvedTickets: resolved.length,
                    avgResponseTime: `${Math.round(avgResponse)}h`,
                    avgResolutionTime: `${Math.round(avgResolution)}h`,
                    slaCompliance: Math.round(compliance)
                })

                // Status distribution
                const statusCounts = tickets.reduce((acc: Record<string, number>, t) => {
                    acc[t.status] = (acc[t.status] || 0) + 1
                    return acc
                }, {})
                setStatusDistribution(
                    Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
                )

                // Priority distribution
                const priorityCounts = tickets.reduce((acc: Record<string, number>, t) => {
                    acc[t.priority] = (acc[t.priority] || 0) + 1
                    return acc
                }, {})
                setPriorityDistribution(
                    Object.entries(priorityCounts).map(([name, value]) => ({ name, value }))
                )

                // Trend data (daily ticket count)
                const days = parseInt(dateRange.replace('d', ''))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const trendMap: any = {}
                for (let i = 0; i < days; i++) {
                    const date = format(subDays(new Date(), days - i - 1), 'MMM dd')
                    trendMap[date] = { date, tickets: 0, resolved: 0 }
                }

                tickets.forEach(t => {
                    const date = format(new Date(t.created_at), 'MMM dd')
                    if (trendMap[date]) {
                        trendMap[date].tickets++
                        if (t.status === 'resolved' || t.status === 'closed') {
                            trendMap[date].resolved++
                        }
                    }
                })

                setTrendData(Object.values(trendMap))
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Performance metrics and insights
                    </p>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="14d">Last 14 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Total Tickets</span>
                        <Ticket className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalTickets}</p>
                    <p className="text-sm text-zinc-500 mt-1">{stats.resolvedTickets} resolved</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Avg Response Time</span>
                        <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.avgResponseTime}</p>
                    <p className="text-sm text-zinc-500 mt-1">First response</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Avg Resolution Time</span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.avgResolutionTime}</p>
                    <p className="text-sm text-zinc-500 mt-1">To close tickets</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">SLA Compliance</span>
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.slaCompliance}%</p>
                    <p className="text-sm text-zinc-500 mt-1">Within SLA deadlines</p>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Resolution Rate</span>
                        <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {stats.totalTickets > 0 ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0}%
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">Closed vs total</p>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Ticket Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2} name="Created" />
                        <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Status Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Priority Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priorityDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
