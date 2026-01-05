'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, BarChart2, Settings, LogOut, Home, Clock, FileBarChart } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NotificationDropdown } from '@/components/notifications/notification-system'
import { useUserRole } from '@/hooks/use-user-role'

const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Tickets', href: '/tickets', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Reports', href: '/reports', icon: FileBarChart },
    { name: 'SLA Policies', href: '/sla-policies', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ user }: { user: User }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { userRole } = useUserRole()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex flex-col h-0 flex-1 border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                    <div className="flex items-center justify-between flex-shrink-0 px-4 py-4">
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">KCIC System</span>
                        <NotificationDropdown userRole={userRole || 'employee'} />
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-300',
                                            'mr-3 flex-shrink-0 h-6 w-6'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                                    {user.email}
                                </p>
                                <button
                                    onClick={handleSignOut}
                                    className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 flex items-center mt-1"
                                >
                                    <LogOut className="mr-1 h-3 w-3" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
