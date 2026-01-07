// Helper function to format activity messages
export function getActivityMessage(activity: any): string {
    const action = activity.action
    const details = activity.details || {}

    switch (action) {
        case 'ticket_created':
            return `Created this ticket`
        case 'status_changed':
            return `Changed status from "${details.old_status}" to "${details.new_status}"`
        case 'priority_changed':
            return `Changed priority from "${details.old_priority}" to "${details.new_priority}"`
        case 'technician_assign':
            return `Assigned ${details.technician_name || 'technician'} to this ticket`
        case 'technician_remove':
            return `Removed ${details.technician_name || 'technician'} from this ticket`
        case 'assignee_changed':
            return details.new_assignee
                ? `Assigned ticket to ${details.new_assignee}`
                : `Unassigned ticket`
        case 'comment_added':
            return `Added a comment`
        case 'attachment_added':
            return `Uploaded an attachment: ${details.file_name || 'file'}`
        case 'ticket_resolved':
            return `Marked ticket as resolved`
        case 'ticket_closed':
            return `Closed this ticket`
        default:
            return `Performed action: ${action}`
    }
}
