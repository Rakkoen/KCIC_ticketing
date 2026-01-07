/**
 * SLA Indicator Component
 * Displays SLA status and progress for a ticket
 */

'use client'

import { Database } from '@/types/database.types'
import { Clock, AlertCircle } from 'lucide-react'
import { getSLASummary, formatSLATime } from '@/lib/sla-calculator'

type Ticket = Database['public']['Tables']['tickets']['Row']

interface SLAIndicatorProps {
    ticket: Ticket
    compact?: boolean
}

export function SLAIndicator({ ticket, compact = false }: SLAIndicatorProps) {
    const sla = getSLASummary(ticket)

    if (compact) {
        // Compact view for ticket cards
        return (
            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">SLA:</span>
                    </div>
                    <div className="flex gap-2">
                        {/* Response SLA */}
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Response</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sla.response.color}`}>
                                {sla.response.status === 'pending' && !sla.response.remaining.isBreached
                                    ? sla.response.remaining.formatted
                                    : sla.response.status}
                            </span>
                        </div>
                        {/* Solving SLA */}
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-500">Solving</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sla.solving.color}`}>
                                {sla.solving.status === 'pending' && !sla.solving.remaining.isBreached
                                    ? sla.solving.remaining.formatted
                                    : sla.solving.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bars */}
                <div className="mt-2 space-y-1">
                    {/* Response progress */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 w-16">Response</span>
                        <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${sla.response.progressColor}`}
                                style={{ width: `${Math.min(sla.response.percentUsed, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 w-8 text-right">
                            {Math.round(sla.response.percentUsed)}%
                        </span>
                    </div>

                    {/* Solving progress */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 w-16">Solving</span>
                        <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${sla.solving.progressColor}`}
                                style={{ width: `${Math.min(sla.solving.percentUsed, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 w-8 text-right">
                            {Math.round(sla.solving.percentUsed)}%
                        </span>
                    </div>
                </div>

                {/* Breach warning */}
                {(sla.response.percentUsed > 80 || sla.solving.percentUsed > 80) && (
                    <div className="mt-2 flex items-center gap-1 text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-[10px]">SLA breach imminent</span>
                    </div>
                )}
            </div>
        )
    }

    // Full view for ticket detail page
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                SLA Status
            </h3>

            <div className="space-y-4">
                {/* Response SLA */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Response Time</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${sla.response.color}`}>
                            {sla.response.status}
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${sla.response.progressColor}`}
                            style={{ width: `${Math.min(sla.response.percentUsed, 100)}%` }}
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-zinc-500">
                        <span>Elapsed: {formatSLATime(sla.response.hoursElapsed)}</span>
                        <span>Target: {formatSLATime(sla.response.hoursAllowed)}</span>
                    </div>
                    {sla.response.status === 'pending' && (
                        <div className="mt-1 text-xs">
                            {sla.response.remaining.isBreached ? (
                                <span className="text-red-600 dark:text-red-400">
                                    ⚠️ Breached {formatSLATime(Math.abs(sla.response.remaining.hours))} ago
                                </span>
                            ) : (
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    {sla.response.remaining.formatted} remaining
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Solving SLA */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Resolution Time</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${sla.solving.color}`}>
                            {sla.solving.status}
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${sla.solving.progressColor}`}
                            style={{ width: `${Math.min(sla.solving.percentUsed, 100)}%` }}
                        />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-zinc-500">
                        <span>Elapsed: {formatSLATime(sla.solving.hoursElapsed)}</span>
                        <span>Target: {formatSLATime(sla.solving.hoursAllowed)}</span>
                    </div>
                    {sla.solving.status === 'pending' && (
                        <div className="mt-1 text-xs">
                            {sla.solving.remaining.isBreached ? (
                                <span className="text-red-600 dark:text-red-400">
                                    ⚠️ Breached {formatSLATime(Math.abs(sla.solving.remaining.hours))} ago
                                </span>
                            ) : (
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    {sla.solving.remaining.formatted} remaining
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
