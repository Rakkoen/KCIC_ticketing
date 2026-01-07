/**
 * API Route: Get Recent Activity Logs (for Dashboard)
 * GET /api/activity-logs/recent
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRecentActivityLogs } from '@/lib/activity-logger'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

        // Get limit from query params (default 20)
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '20')

        // Get recent activity logs
        const logs = await getRecentActivityLogs(limit)

        return NextResponse.json({
            success: true,
            logs,
            count: logs.length,
        })

    } catch (error) {
        console.error('Error fetching recent activity logs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
