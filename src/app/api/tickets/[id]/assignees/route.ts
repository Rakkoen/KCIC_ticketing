import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/tickets/[id]/assignees
 * Fetch all technicians assigned to a ticket
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('ticket_assignees')
            .select(`
                id,
                user_id,
                is_primary,
                assigned_at,
                assigned_by,
                completed_at,
                work_notes,
                created_at,
                updated_at,
                users:user_id (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            `)
            .eq('ticket_id', params.id)
            .order('is_primary', { ascending: false })
            .order('assigned_at', { ascending: true })

        if (error) {
            console.error('Error fetching assignees:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        // Transform data to match AssignedTechnician type
        const assignees = data?.map(item => ({
            id: item.id,
            user_id: item.user_id,
            ticket_id: params.id,
            full_name: item.users?.full_name || '',
            email: item.users?.email || '',
            avatar_url: item.users?.avatar_url,
            is_primary: item.is_primary,
            assigned_at: item.assigned_at,
            assigned_by: item.assigned_by,
            completed_at: item.completed_at,
            work_notes: item.work_notes
        })) || []

        return NextResponse.json({ assignees })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/tickets/[id]/assignees
 * Assign a technician to a ticket
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
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

        const body = await request.json()
        const { user_id, is_primary = false, work_notes } = body

        if (!user_id) {
            return NextResponse.json(
                { error: 'user_id is required' },
                { status: 400 }
            )
        }

        // Verify the user being assigned is a technician
        const { data: techUser, error: techError } = await supabase
            .from('users')
            .select('role, full_name')
            .eq('id', user_id)
            .single()

        if (techError || !techUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        if (techUser.role !== 'technician') {
            return NextResponse.json(
                { error: 'Only technicians can be assigned to tickets' },
                { status: 400 }
            )
        }

        // Insert assignment
        const { data: assignee, error: insertError } = await supabase
            .from('ticket_assignees')
            .insert({
                ticket_id: params.id,
                user_id,
                assigned_by: user.id,
                is_primary,
                work_notes
            })
            .select()
            .single()

        if (insertError) {
            // Check for unique constraint violation
            if (insertError.code === '23505') {
                return NextResponse.json(
                    { error: 'Technician already assigned to this ticket' },
                    { status: 409 }
                )
            }

            console.error('Error assigning technician:', insertError)
            return NextResponse.json(
                { error: insertError.message },
                { status: 400 }
            )
        }

        // Log activity
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            ticket_id: params.id,
            action: 'technician_assign',
            target_type: 'user',
            target_id: user_id,
            details: {
                technician_name: techUser.full_name,
                is_primary
            }
        })

        return NextResponse.json(
            { assignee, message: 'Technician assigned successfully' },
            { status: 201 }
        )
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/tickets/[id]/assignees/[userId]
 * Remove a technician from a ticket
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
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

        // Extract userId from URL
        const url = new URL(request.url)
        const userId = url.pathname.split('/').pop()

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Delete assignment
        const { error: deleteError } = await supabase
            .from('ticket_assignees')
            .delete()
            .eq('ticket_id', params.id)
            .eq('user_id', userId)

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
            target_id: userId,
            details: {}
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
