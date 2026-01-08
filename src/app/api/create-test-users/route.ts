import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Test accounts data
    const testAccounts = [
      { email: 'admin@kcic.com', password: 'admin123', fullName: 'Admin KCIC', role: 'admin' },
      { email: 'manager@kcic.com', password: 'manager123', fullName: 'Manager KCIC', role: 'manager' },
      { email: 'technician@kcic.com', password: 'technician123', fullName: 'Technician KCIC', role: 'technician' },
      { email: 'employee@kcic.com', password: 'employee123', fullName: 'Employee KCIC', role: 'employee' }
    ]

    const results = []

    for (const account of testAccounts) {
      try {
        // Create user with admin privileges using service role
        const { data, error } = await adminSupabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            full_name: account.fullName,
            role: account.role
          }
        })

        if (error) {
          // If user already exists, try to update their role
          if (error.message.includes('already registered')) {
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', account.email)
              .single()

            if (existingUser) {
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  role: account.role as 'admin' | 'manager' | 'technician' | 'employee',
                  full_name: account.fullName,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingUser.id)

              if (updateError) {
                results.push({ email: account.email, status: 'error', message: updateError.message })
              } else {
                results.push({ email: account.email, status: 'updated', role: account.role })
              }
            } else {
              results.push({ email: account.email, status: 'error', message: 'User exists but not found in users table' })
            }
          } else {
            results.push({ email: account.email, status: 'error', message: error.message })
          }
        } else {
          // User created successfully, now update the role in users table
          if (data.user) {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                role: account.role as 'admin' | 'manager' | 'technician' | 'employee',
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)

            if (updateError) {
              results.push({ email: account.email, status: 'created_role_error', message: updateError.message })
            } else {
              results.push({ email: account.email, status: 'success', role: account.role })
            }
          }
        }
      } catch (err) {
        results.push({
          email: account.email,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test accounts processed',
      results
    })

  } catch (error) {
    console.error('Error creating test users:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create test users'
    }, { status: 500 })
  }
}