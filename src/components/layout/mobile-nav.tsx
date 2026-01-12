'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { NotificationDropdown } from '@/components/notifications/notification-system'
import { useUserRole } from '@/hooks/use-user-role'
import { getAccessibleNavigation } from '@/lib/navigation-access'

interface MobileNavProps {
    user: User
}

export default function MobileNav({ user }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { userRole } = useUserRole()

    // Get navigation items based on user role
    const navigation = getAccessibleNavigation(userRole)

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 flex items-center gap-x-4 bg-white dark:bg-zinc-800 px-4 py-3 shadow-sm border-b border-zinc-200 dark:border-zinc-700">
                <button
                    type="button"
                    className="-m-2 p-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                    KCIC System
                </div>
                <NotificationDropdown userRole={(userRole || 'employee') as 'admin' | 'manager' | 'employee' | 'worker'} />
            </div>

            {/* Backdrop Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/30 md:hidden transition-opacity backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Popup Modal Navigation */}
            <div
                className={cn(
                    'fixed top-4 left-4 bottom-4 z-[101] w-[280px] max-w-[calc(100vw-2rem)] transform bg-white dark:bg-zinc-800 transition-all duration-300 ease-out md:hidden rounded-2xl shadow-2xl',
                    isOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[320px] opacity-0 scale-95'
                )}
            >
                <div className="flex h-full flex-col overflow-hidden rounded-2xl">
                    {/* Header with Logo and Close Button */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm">KC</span>
                            </div>
                            <span className="text-lg font-bold text-zinc-800 dark:text-white">
                                KCIC
                            </span>
                        </div>
                        <button
                            type="button"
                            className="-m-2 p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    {/* User Profile Section */}
                    <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">
                                    {user.email?.split('@')[0] || 'User'}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                    {userRole || 'Employee'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50',
                                        'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive
                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                : 'text-zinc-500 dark:text-zinc-400',
                                            'flex-shrink-0 h-5 w-5'
                                        )}
                                        aria-hidden="true"
                                    />
                                    <span className="flex-1">{item.name}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="flex-shrink-0 border-t border-zinc-200 dark:border-zinc-700 p-3">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
