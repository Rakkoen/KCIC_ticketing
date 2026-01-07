/**
 * SLA Calculator
 * Utilities for calculating and managing SLA (Service Level Agreement)
 * for ticket response and resolution times
 */

import { Database } from '@/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type SLAPolicy = Database['public']['Tables']['sla_policies']['Row']

export type SLAStatus = 'on_time' | 'breached' | 'pending'

/**
 * Default SLA times (in hours) by priority
 */
export const DEFAULT_SLA_TIMES = {
    critical: {
        response: 1, // 1 hour
        solving: 4,  // 4 hours
    },
    high: {
        response: 4,  // 4 hours
        solving: 24, // 24 hours (1 day)
    },
    medium: {
        response: 8,  // 8 hours
        solving: 48, // 48 hours (2 days)
    },
    low: {
        response: 24, // 24 hours (1 day)
        solving: 120, // 120 hours (5 days)
    },
} as const

/**
 * Calculate hours between two timestamps
 */
function calculateHoursDiff(startTime: string, endTime: string): number {
    const start = new Date(startTime)
    const end = new Date(endTime)
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

/**
 * Get SLA policy times for a ticket priority
 */
export function getSLATimes(priority: Ticket['priority'], slaPolicy?: SLAPolicy | null) {
    if (slaPolicy) {
        return {
            response: slaPolicy.response_time_hours,
            solving: slaPolicy.resolution_time_hours,
        }
    }

    return DEFAULT_SLA_TIMES[priority] || DEFAULT_SLA_TIMES.medium
}

/**
 * Calculate SLA response status
 * Response SLA: Time from ticket creation to first response
 */
export function calculateResponseSLA(
    ticket: Ticket,
    slaPolicy?: SLAPolicy | null
): {
    status: SLAStatus
    hoursElapsed: number
    hoursAllowed: number
    percentUsed: number
} {
    const slaTimes = getSLATimes(ticket.priority, slaPolicy)

    // If no first response yet, calculate based on current time
    const endTime = ticket.first_response_at || new Date().toISOString()
    const hoursElapsed = calculateHoursDiff(ticket.created_at, endTime)
    const percentUsed = (hoursElapsed / slaTimes.response) * 100

    let status: SLAStatus = 'pending'

    if (ticket.first_response_at) {
        // Response has been made, check if it was on time
        status = hoursElapsed <= slaTimes.response ? 'on_time' : 'breached'
    } else {
        // No response yet, check if still within SLA
        status = hoursElapsed > slaTimes.response ? 'breached' : 'pending'
    }

    return {
        status,
        hoursElapsed,
        hoursAllowed: slaTimes.response,
        percentUsed,
    }
}

/**
 * Calculate SLA solving status
 * Solving SLA: Time from ticket creation to resolution
 */
export function calculateSolvingSLA(
    ticket: Ticket,
    slaPolicy?: SLAPolicy | null
): {
    status: SLAStatus
    hoursElapsed: number
    hoursAllowed: number
    percentUsed: number
} {
    const slaTimes = getSLATimes(ticket.priority, slaPolicy)

    // If not resolved yet, calculate based on current time
    const endTime = ticket.resolved_at || new Date().toISOString()
    const hoursElapsed = calculateHoursDiff(ticket.created_at, endTime)
    const percentUsed = (hoursElapsed / slaTimes.solving) * 100

    let status: SLAStatus = 'pending'

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
        // Ticket is resolved, check if it was on time
        status = hoursElapsed <= slaTimes.solving ? 'on_time' : 'breached'
    } else {
        // Not resolved yet, check if still within SLA
        status = hoursElapsed > slaTimes.solving ? 'breached' : 'pending'
    }

    return {
        status,
        hoursElapsed,
        hoursAllowed: slaTimes.solving,
        percentUsed,
    }
}

/**
 * Check if SLA breach is imminent (>80% of time used)
 */
export function isSLABreachImminent(percentUsed: number): boolean {
    return percentUsed > 80 && percentUsed < 100
}

/**
 * Get SLA status badge color
 */
export function getSLAStatusColor(status: SLAStatus): string {
    switch (status) {
        case 'on_time':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        case 'breached':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
}

/**
 * Get SLA progress bar color based on percentage
 */
export function getSLAProgressColor(percentUsed: number): string {
    if (percentUsed < 50) {
        return 'bg-green-500'
    } else if (percentUsed < 80) {
        return 'bg-yellow-500'
    } else if (percentUsed < 100) {
        return 'bg-orange-500'
    } else {
        return 'bg-red-500'
    }
}

/**
 * Format hours into human-readable time
 */
export function formatSLATime(hours: number): string {
    if (hours < 1) {
        const minutes = Math.round(hours * 60)
        return `${minutes} min`
    } else if (hours < 24) {
        return `${Math.round(hours)} hrs`
    } else {
        const days = Math.floor(hours / 24)
        const remainingHours = Math.round(hours % 24)
        if (remainingHours === 0) {
            return `${days} day${days > 1 ? 's' : ''}`
        }
        return `${days}d ${remainingHours}h`
    }
}

/**
 * Calculate remaining time until SLA breach
 */
export function calculateRemainingTime(
    hoursElapsed: number,
    hoursAllowed: number
): {
    hours: number
    formatted: string
    isBreached: boolean
} {
    const remaining = hoursAllowed - hoursElapsed

    return {
        hours: remaining,
        formatted: remaining > 0 ? formatSLATime(remaining) : 'Breached',
        isBreached: remaining <= 0,
    }
}

/**
 * Update ticket SLA statuses in database
 */
export async function updateTicketSLAStatuses(
    ticket: Ticket,
    slaPolicy?: SLAPolicy | null
): Promise<{
    sla_response_status: SLAStatus
    sla_solving_status: SLAStatus
}> {
    const responseSLA = calculateResponseSLA(ticket, slaPolicy)
    const solvingSLA = calculateSolvingSLA(ticket, slaPolicy)

    return {
        sla_response_status: responseSLA.status,
        sla_solving_status: solvingSLA.status,
    }
}

/**
 * Get SLA summary for a ticket
 */
export function getSLASummary(
    ticket: Ticket,
    slaPolicy?: SLAPolicy | null
) {
    const responseSLA = calculateResponseSLA(ticket, slaPolicy)
    const solvingSLA = calculateSolvingSLA(ticket, slaPolicy)

    return {
        response: {
            ...responseSLA,
            remaining: calculateRemainingTime(responseSLA.hoursElapsed, responseSLA.hoursAllowed),
            color: getSLAStatusColor(responseSLA.status),
            progressColor: getSLAProgressColor(responseSLA.percentUsed),
        },
        solving: {
            ...solvingSLA,
            remaining: calculateRemainingTime(solvingSLA.hoursElapsed, solvingSLA.hoursAllowed),
            color: getSLAStatusColor(solvingSLA.status),
            progressColor: getSLAProgressColor(solvingSLA.percentUsed),
        },
    }
}
