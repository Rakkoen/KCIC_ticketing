'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Trophy, TrendingUp, Clock, CheckCircle, Award } from 'lucide-react'

type User = Database['public']['Tables']['users']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']

interface AgentStats {
    agent: User
    ticketsAssigned: number
    ticketsResolved: number
    avgResolutionTime: number
    slaCompliance: number
}

export default function AgentPerformancePage() {
    const [agents, setAgents] = useState<AgentStats[]>([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'resolved' | 'compliance' | 'speed'>('resolved')
    const supabase = createClient()

    useEffect(() => {
        fetchAgentPerformance()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchAgentPerformance = async () => {
        setLoading(true)
        try {
            // Fetch all agents (workers, managers, admins)
            const { data: users } = await supabase
                .from('users')
                .select('*')
                .in('role', ['admin', 'manager', 'worker'])
                .returns<User[]>()

            if (!users) return

            // Fetch performance stats for each agent
            const statsPromises = users.map(async (agent) => {
                const { data: tickets } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('assigned_to', agent.id)
                    .returns<Ticket[]>()

                const assigned = tickets?.length || 0
                const resolved = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0

                // Calculate average resolution time (in hours)
                const resolvedTickets = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed') || []
                const avgTime = resolvedTickets.length > 0
                    ? resolvedTickets.reduce((sum, t) => {
                        const created = new Date(t.created_at).getTime()
                        const updated = new Date(t.updated_at).getTime()
                        return sum + (updated - created)
                    }, 0) / resolvedTickets.length / (1000 * 60 * 60)
                    : 0

                // SLA compliance
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const compliant = tickets?.filter(t => !(t as any).sla_breach).length || 0
                const compliance = assigned > 0 ? (compliant / assigned) * 100 : 100

                return {
                    agent,
                    ticketsAssigned: assigned,
                    ticketsResolved: resolved,
                    avgResolutionTime: Math.round(avgTime),
                    slaCompliance: Math.round(compliance)
                }
            })

            const stats = await Promise.all(statsPromises)
            setAgents(stats.filter(s => s.ticketsAssigned > 0)) // Only show agents with assignments
        } catch (error) {
            console.error('Error fetching agent performance:', error)
        } finally {
            setLoading(false)
        }
    }

    const sortedAgents = [...agents].sort((a, b) => {
        switch (sortBy) {
            case 'resolved':
                return b.ticketsResolved - a.ticketsResolved
            case 'compliance':
                return b.slaCompliance - a.slaCompliance
            case 'speed':
                return a.avgResolutionTime - b.avgResolutionTime
            default:
                return 0
        }
    })

    const getScoreBadge = (score: number) => {
        if (score >= 90) return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Excellent' }
        if (score >= 75) return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Good' }
        if (score >= 60) return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Average' }
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Needs Improvement' }
    }

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
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Agent Performance</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Team member productivity and metrics
                    </p>
                </div>

                {/* Sort Selector */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'resolved' | 'compliance' | 'speed')}
                    className="rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-2 border"
                >
                    <option value="resolved">Most Resolved</option>
                    <option value="compliance">Best SLA Compliance</option>
                    <option value="speed">Fastest Resolution</option>
                </select>
            </div>

            {/* Leaderboard */}
            {sortedAgents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sortedAgents.slice(0, 3).map((agent, index) => {
                        const icons = [Trophy, Award, Award]
                        const colors = ['text-yellow-500', 'text-zinc-400', 'text-amber-600']
                        const Icon = icons[index]

                        return (
                            <div key={agent.agent.id} className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-lg p-6 border-2 border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center gap-3 mb-4">
                                    <Icon className={`h-8 w-8 ${colors[index]}`} />
                                    <div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Rank #{index + 1}</p>
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                                            {agent.agent.full_name || agent.agent.email}
                                        </h3>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Resolved</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">{agent.ticketsResolved}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">SLA Compliance</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">{agent.slaCompliance}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Avg Time</span>
                                        <span className="font-semibold text-zinc-900 dark:text-white">{agent.avgResolutionTime}h</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Full Agent List */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Assigned
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Resolved
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Avg Resolution
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                SLA Compliance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Performance
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                        {sortedAgents.map((agent, index) => {
                            const badge = getScoreBadge(agent.slaCompliance)
                            return (
                                <tr key={agent.agent.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {agent.agent.full_name || agent.agent.email}
                                        </span>
                                        <p className="text-xs text-zinc-500">{agent.agent.role}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                                        {agent.ticketsAssigned}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {agent.ticketsResolved}
                                            </span>
                                            <span className="text-xs text-zinc-500">
                                                ({agent.ticketsAssigned > 0 ? Math.round((agent.ticketsResolved / agent.ticketsAssigned) * 100) : 0}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-zinc-900 dark:text-white">
                                                {agent.avgResolutionTime}h
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {agent.slaCompliance}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {sortedAgents.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                    <Trophy className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No performance data yet</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Assign tickets to agents to see performance metrics
                    </p>
                </div>
            )}
        </div>
    )
}
