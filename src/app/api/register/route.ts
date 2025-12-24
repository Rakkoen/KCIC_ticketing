import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Default role to employee if not provided
    const userRole = role || 'employee'

    // Validate role
    const validRoles = ['admin', 'manager', 'worker', 'employee']
    if (!validRoles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create user with email confirmation disabled
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Disable email confirmation
      user_metadata: {
        full_name: fullName,
        role: userRole,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create a session for the newly registered user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Session creation error:', signInError)
      // User was created but session failed, still return success
      return NextResponse.json(
        {
          message: 'Registration successful. Please log in.',
          user: data.user,
          role: userRole,
          redirectTo: '/login'
        },
        { status: 200 }
      )
    }

    // Set session cookie
    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: data.user,
        role: userRole,
        redirectTo: '/'
      },
      { status: 200 }
    )

    // Set auth cookies
    if (signInData.session) {
      response.cookies.set('sb-access-token', signInData.session.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      response.cookies.set('sb-refresh-token', signInData.session.refresh_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}