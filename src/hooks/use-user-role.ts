'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type UserRole = Database['public']['Tables']['users']['Row']['role']

export function useUserRole() {
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data, error } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .single<{ role: UserRole }>()

                    if (error) {
                        console.error('Error fetching user role:', error)
                    } else if (data) {
                        setUserRole(data.role)
                    }
                }
            } catch (error) {
                console.error('Error in useUserRole:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRole()
    }, [])

    return { userRole, loading }
}
