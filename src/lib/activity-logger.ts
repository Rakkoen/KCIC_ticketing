/**
 * Activity Logger
 * Centralized utility for logging user actions to activity_logs table
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { ACTIVITY_ACTIONS, formatActivityMessage } from './activity-logger-utils'

// Re-export for convenience
export { ACTIVITY_ACTIONS, formatActivityMessage }

type ActivityLog = Database['public']['Tables']['activity_logs']['Insert']

/**
 * Log ticket creation
 */
export async function logTicketCreate(
    userId: string,
    ticketId: string,
    ticketData: {
        title: string
        priority: string
        status: string
    }
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.TICKET_CREATE,
        target_type: 'ticket',
        target_id: ticketId,
        details: {
            title: ticketData.title,
            priority: ticketData.priority,
            status: ticketData.status,
        },
    })
}

/**
 * Log ticket update
 */
export async function logTicketUpdate(
    userId: string,
    ticketId: string,
    changes: {
        field: string
        oldValue: string | null
        newValue: string | null
    }[]
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.TICKET_UPDATE,
        target_type: 'ticket',
        target_id: ticketId,
        details: {
            changes,
        },
    })
}

/**
 * Log ticket status change
 */
export async function logTicketStatusChange(
    userId: string,
    ticketId: string,
    oldStatus: string,
    newStatus: string
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.TICKET_STATUS_CHANGE,
        target_type: 'ticket',
        target_id: ticketId,
        details: {
            old_status: oldStatus,
            new_status: newStatus,
        },
    })
}

/**
 * Log ticket assignment
 */
export async function logTicketAssign(
    userId: string,
    ticketId: string,
    assignedToId: string,
    assignedToName: string
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.TICKET_ASSIGN,
        target_type: 'ticket',
        target_id: ticketId,
        details: {
            assigned_to_id: assignedToId,
            assigned_to_name: assignedToName,
        },
    })
}

/**
 * Log comment addition
 */
export async function logCommentAdd(
    userId: string,
    ticketId: string,
    commentId: string,
    commentPreview: string
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.COMMENT_ADD,
        target_type: 'comment',
        target_id: commentId,
        details: {
            comment_preview: commentPreview.substring(0, 100),
        },
    })
}

/**
 * Log file upload
 */
export async function logFileUpload(
    userId: string,
    ticketId: string,
    fileId: string,
    fileName: string,
    fileSize: number
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.ATTACHMENT_UPLOAD,
        target_type: 'attachment',
        target_id: fileId,
        details: {
            file_name: fileName,
            file_size: fileSize,
        },
    })
}

/**
 * Log ticket deletion
 */
export async function logTicketDelete(
    userId: string,
    ticketId: string,
    ticketTitle: string
) {
    const supabase = await createClient()

    return await supabase.from('activity_logs').insert({
        user_id: userId,
        ticket_id: ticketId,
        action: ACTIVITY_ACTIONS.TICKET_DELETE,
        target_type: 'ticket',
        target_id: ticketId,
        details: {
            title: ticketTitle,
        },
    })
}

/**
 * Get activity logs for a ticket
 */
export async function getTicketActivityLogs(ticketId: string, limit = 50) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
      id,
      action,
      details,
      created_at,
      user:users!activity_logs_user_id_fkey(
        id,
        full_name,
        email,
        role
      )
    `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching activity logs:', error)
        return []
    }

    return data || []
}

/**
 * Get recent activity logs for all tickets (for dashboard)
 */
export async function getRecentActivityLogs(limit = 20) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
      id,
      action,
      ticket_id,
      details,
      created_at,
      user:users!activity_logs_user_id_fkey(
        id,
        full_name,
        email,
        role
      ),
      ticket:tickets!activity_logs_ticket_id_fkey(
        id,
        custom_id,
        title,
        status
      )
    `)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent activity logs:', error)
        return []
    }

    return data || []
}


