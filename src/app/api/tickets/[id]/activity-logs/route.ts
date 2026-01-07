/**
 * API Route: Get Activity Logs for a Ticket
 * GET /api/tickets/[id]/activity-logs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTicketActivityLogs } from '@/lib/activity-logger'
import { createClient } from '@/lib/supabase/server'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const ticketId = params.id

        // Verify ticket exists and user has access
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('id, created_by, assigned_to')
            .eq('id', ticketId)
            .single()

        if (ticketError || !ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            )
        }

        // Get activity logs
        const logs = await getTicketActivityLogs(ticketId)

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
        })

    } catch (error) {
        console.error('Error fetching activity logs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
