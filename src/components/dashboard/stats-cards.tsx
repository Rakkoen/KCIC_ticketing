'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
    Ticket, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    TrendingUp,
    Users
} from 'lucide-react'

interface StatsCardsProps {
    timeRange?: '7d' | '30d' | '90d'
}

interface Stats {
    totalTickets: number
    openTickets: number
    resolvedTickets: number
    criticalTickets: number
    avgResolutionTime: number
    activeAgents: number
    trendPercentage: number
}

export function StatsCards({ timeRange = '7d' }: StatsCardsProps) {
    const [stats, setStats] = useState<Stats>({
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        criticalTickets: 0,
        avgResolutionTime: 0,
        activeAgents: 0,
        trendPercentage: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchStats()
    }, [timeRange])

    const fetchStats = async () => {
        setLoading(true)
        try {
            // Calculate date range
            const now = new Date()
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
            const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

            // Fetch total tickets in date range
            const { count: totalTickets, error: totalError } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startDate.toISOString())

            // Fetch open tickets
            const { count: openTickets, error: openError } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .in('status', ['new', 'in_progress'])

            // Fetch resolved tickets in date range
            const { count: resolvedTickets, error: resolvedError } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'resolved')
                .gte('created_at', startDate.toISOString())

            // Fetch critical tickets
            const { count: criticalTickets, error: criticalError } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('priority', 'critical')
                .in('status', ['new', 'in_progress'])

            // Fetch active agents (workers/managers with assigned tickets)
            const { data: activeAgentsData, error: agentsError } = await supabase
                .from('tickets')
                .select('assigned_to')
                .not('assigned_to', 'is', null)
                .in('status', ['new', 'in_progress'])

            // Calculate average resolution time (simplified)
            const { data: resolvedTicketsData, error: avgTimeError } = await supabase
                .from('tickets')
                .select('created_at, updated_at')
                .eq('status', 'resolved')
                .gte('created_at', startDate.toISOString())
                .limit(100)

            let avgResolutionTime = 0
            if (resolvedTicketsData && resolvedTicketsData.length > 0) {
                const totalTime = resolvedTicketsData.reduce((acc, ticket: any) => {
                    const created = new Date(ticket.created_at)
                    const updated = new Date(ticket.updated_at)
                    return acc + (updated.getTime() - created.getTime())
                }, 0)
                avgResolutionTime = totalTime / resolvedTicketsData.length / (1000 * 60 * 60) // Convert to hours
            }

            // Calculate trend (simplified - comparing with previous period)
            const previousStartDate = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000))
            const { count: previousTickets, error: previousError } = await supabase
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', previousStartDate.toISOString())
                .lt('created_at', startDate.toISOString())

            const trendPercentage = totalTickets && previousTickets && previousTickets > 0 
                ? ((totalTickets - previousTickets) / previousTickets) * 100 
                : 0

            const activeAgents = activeAgentsData 
                ? [...new Set(activeAgentsData.map((t: any) => t.assigned_to))].length 
                : 0

            if (totalError || openError || resolvedError || criticalError || agentsError || avgTimeError || previousError) {
                throw new Error('Error fetching stats')
            }

            setStats({
                totalTickets: totalTickets || 0,
                openTickets: openTickets || 0,
                resolvedTickets: resolvedTickets || 0,
                criticalTickets: criticalTickets || 0,
                avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
                activeAgents,
                trendPercentage: Math.round(trendPercentage * 10) / 10
            })
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: 'Total Tickets',
            value: stats.totalTickets,
            icon: Ticket,
            color: 'blue',
            trend: stats.trendPercentage
        },
        {
            title: 'Open Tickets',
            value: stats.openTickets,
            icon: Clock,
            color: 'yellow'
        },
        {
            title: 'Resolved',
            value: stats.resolvedTickets,
            icon: CheckCircle,
            color: 'green'
        },
        {
            title: 'Critical',
            value: stats.criticalTickets,
            icon: AlertTriangle,
            color: 'red'
        },
        {
            title: 'Avg Resolution Time',
            value: `${stats.avgResolutionTime}h`,
            icon: TrendingUp,
            color: 'purple'
        },
        {
            title: 'Active Agents',
            value: stats.activeAgents,
            icon: Users,
            color: 'indigo'
        }
    ]

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
            yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
            green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
            purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
        }
        return colors[color as keyof typeof colors] || colors.blue
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 animate-pulse">
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <div key={index} className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    {stat.title}
                                </p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                                    {stat.value}
                                </p>
                                {stat.trend !== undefined && (
                                    <div className="flex items-center mt-2">
                                        <TrendingUp 
                                            className={`h-4 w-4 mr-1 ${
                                                stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                                            }`} 
                                        />
                                        <span className={`text-sm ${
                                            stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}