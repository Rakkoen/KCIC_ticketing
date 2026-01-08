import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const supabase = await createClient()
        const adminSupabase = createAdminClient()

        // KCIC User accounts
        const kcicAccounts = [
            // Admin users
            { email: 'annisa@kcic.com', password: 'kcic2024', fullName: 'Annisa', role: 'admin' },
            { email: 'hasna@kcic.com', password: 'kcic2024', fullName: 'Hasna', role: 'admin' },
            { email: 'inna@kcic.com', password: 'kcic2024', fullName: 'Inna', role: 'admin' },

            // Technician users
            { email: 'dastin@kcic.com', password: 'kcic2024', fullName: 'Dastin', role: 'technician' },
            { email: 'alif.firdaus@kcic.com', password: 'kcic2024', fullName: 'Alif Firdaus', role: 'technician' },
            { email: 'jalu@kcic.com', password: 'kcic2024', fullName: 'Jalu', role: 'technician' },
            { email: 'muh.rizal@kcic.com', password: 'kcic2024', fullName: 'Muh. Rizal', role: 'technician' },
            { email: 'alif.alghifari@kcic.com', password: 'kcic2024', fullName: 'Alif Al Ghifari', role: 'technician' },
            { email: 'fatah@kcic.com', password: 'kcic2024', fullName: 'Fatah', role: 'technician' },
            { email: 'egi@kcic.com', password: 'kcic2024', fullName: 'Egi', role: 'technician' },
            { email: 'rizal.mutaqien@kcic.com', password: 'kcic2024', fullName: 'Rizal Mutaqien', role: 'technician' },
        ]

        const results = []

        for (const account of kcicAccounts) {
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
                                full_name: account.fullName,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', data.user.id)

                        if (updateError) {
                            results.push({ email: account.email, status: 'created_role_error', message: updateError.message })
                        } else {
                            results.push({ email: account.email, status: 'success', role: account.role, password: account.password })
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
            message: 'KCIC accounts processed',
            results
        })

    } catch (error) {
        console.error('Error creating KCIC users:', error)
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to create KCIC users'
        }, { status: 500 })
    }
}
