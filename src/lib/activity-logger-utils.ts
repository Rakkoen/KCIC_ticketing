/**
 * Activity Logger Utilities (Client-Safe)
 * Utility functions that can be used in both client and server components
 */

/**
 * Activity action types
 */
export const ACTIVITY_ACTIONS = {
    // Ticket actions
    TICKET_CREATE: 'ticket_create',
    TICKET_UPDATE: 'ticket_update',
    TICKET_DELETE: 'ticket_delete',
    TICKET_ASSIGN: 'ticket_assign',
    TICKET_STATUS_CHANGE: 'ticket_status_change',

    // Comment actions
    COMMENT_ADD: 'comment_add',
    COMMENT_UPDATE: 'comment_update',
    COMMENT_DELETE: 'comment_delete',

    // Attachment actions
    ATTACHMENT_UPLOAD: 'attachment_upload',
    ATTACHMENT_DELETE: 'attachment_delete',
} as const

/**
 * Format activity log message for display
 */
export function formatActivityMessage(
    action: string,
    details: Record<string, unknown>,
    userName: string
): string {
    switch (action) {
        case ACTIVITY_ACTIONS.TICKET_CREATE:
            return `${userName} created this ticket`

        case ACTIVITY_ACTIONS.TICKET_UPDATE:
            const changes = details.changes as Array<{ field: string; oldValue: string; newValue: string }>
            if (changes && changes.length > 0) {
                const fields = changes.map(c => c.field).join(', ')
                return `${userName} updated ${fields}`
            }
            return `${userName} updated this ticket`

        case ACTIVITY_ACTIONS.TICKET_STATUS_CHANGE:
            return `${userName} changed status from ${details.old_status} to ${details.new_status}`

        case ACTIVITY_ACTIONS.TICKET_ASSIGN:
            return `${userName} assigned ticket to ${details.assigned_to_name}`

        case ACTIVITY_ACTIONS.COMMENT_ADD:
            return `${userName} added a comment`

        case ACTIVITY_ACTIONS.ATTACHMENT_UPLOAD:
            return `${userName} uploaded ${details.file_name}`

        case ACTIVITY_ACTIONS.TICKET_DELETE:
            return `${userName} deleted ticket "${details.title}"`

        default:
            return `${userName} performed an action`
    }
}
