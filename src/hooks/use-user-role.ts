'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

export function useUserRole() {
    const [userRole, setUserRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .returns<User>()
                        .single()

                    if (data) {
                        setUserRole(data.role)
                    }
                }
            } catch (error) {
                console.error('Error fetching user role:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRole()
    }, [])

    return { userRole, loading }
}
