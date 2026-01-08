/**
 * Route Protection Component
 * Prevents unauthorized access to protected routes
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRole } from '@/hooks/use-user-role'
import { hasRouteAccess, getRoleDisplayName } from '@/lib/navigation-access'
import { ShieldAlert } from 'lucide-react'

interface RouteProtectionProps {
    children: React.ReactNode
    route: string
}

export function RouteProtection({ children, route }: RouteProtectionProps) {
    const { userRole, loading } = useUserRole()
    const router = useRouter()
    const [hasAccess, setHasAccess] = useState<boolean | null>(null)

    useEffect(() => {
        if (!loading) {
            const access = hasRouteAccess(userRole, route)
            setHasAccess(access)

            if (!access) {
                // Redirect to dashboard after a brief moment to show the message
                setTimeout(() => {
                    router.push('/')
                }, 2000)
            }
        }
    }, [userRole, loading, route, router])

    // Show loading state
    if (loading || hasAccess === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    // Show access denied message
    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-900">
                <div className="text-center p-8 max-w-md">
                    <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        Access Denied
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        You don't have permission to access this page.
                        {userRole && (
                            <span className="block mt-2 text-sm">
                                Your role: <span className="font-semibold">{getRoleDisplayName(userRole)}</span>
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        )
    }

    // User has access, render children
    return <>{children}</>
}
