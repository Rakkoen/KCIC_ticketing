/**
 * Ticket Assignees Types
 * For multi-technician assignment feature
 */

import { Database } from './database.types'

export type TicketAssignee = Database['public']['Tables']['ticket_assignees']['Row']
export type TicketAssigneeInsert = Database['public']['Tables']['ticket_assignees']['Insert']
export type TicketAssigneeUpdate = Database['public']['Tables']['ticket_assignees']['Update']

/**
 * Extended type with user details
 */
export interface AssignedTechnician {
    id: string
    user_id: string
    ticket_id: string
    full_name: string
    email: string
    avatar_url?: string | null
    is_primary: boolean
    assigned_at: string
    assigned_by: string | null
    completed_at: string | null
    work_notes: string | null
}

/**
 * Ticket with assignees included
 */
export interface TicketWithAssignees {
    id: string
    custom_id: string | null
    title: string
    description: string
    status: 'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'
    priority: 'low' | 'medium' | 'high' | 'critical'
    station: string | null
    location: string | null
    equipment_category: string | null
    created_at: string
    updated_at: string
    assigned_to: string | null
    // Extended field
    assignees: AssignedTechnician[]
}
