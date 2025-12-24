'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type UserRole = Database['public']['Tables']['users']['Row']['role']

export function useUserRole() {
    const [userRole, setUserRole] = useState<UserRole | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchUserRole()
    }, [])

    const fetchUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) {
                setUserRole(null)
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (error) {
                console.error('Error fetching user role:', error)
                setUserRole(null)
            } else {
                setUserRole(data?.role || null)
            }
        } catch (error) {
            console.error('Error in fetchUserRole:', error)
            setUserRole(null)
        } finally {
            setLoading(false)
        }
    }

    return { userRole, loading }
}