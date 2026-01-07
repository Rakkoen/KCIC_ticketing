import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    try {
        let query = supabase
            .from('users')
            .select('id, full_name, email, role, avatar_url, availability_status')

        // Filter by role if provided
        if (role) {
            query = query.eq('role', role)
        }

        const { data: users, error } = await query.order('full_name')

        if (error) {
            console.error('Error fetching users:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
