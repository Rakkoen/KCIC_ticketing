import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/tickets/[id]/assignees/[userId]
 * Remove a specific technician assignment
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; userId: string } }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get technician name before deletion for activity log
        const { data: assignment } = await supabase
            .from('ticket_assignees')
            .select('users:user_id(full_name)')
            .eq('ticket_id', params.id)
            .eq('user_id', params.userId)
            .single()

        // Delete assignment
        const { error: deleteError } = await supabase
            .from('ticket_assignees')
            .delete()
            .eq('ticket_id', params.id)
            .eq('user_id', params.userId)

        if (deleteError) {
            console.error('Error removing assignee:', deleteError)
            return NextResponse.json(
                { error: deleteError.message },
                { status: 400 }
            )
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            ticket_id: params.id,
            action: 'technician_remove',
            target_type: 'user',
            target_id: params.userId,
            details: {
                technician_name: assignment?.users?.full_name || 'Unknown'
            }
        })

        return NextResponse.json(
            { message: 'Technician removed successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
