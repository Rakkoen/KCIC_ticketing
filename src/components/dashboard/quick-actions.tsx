'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Plus,
    Clock,
    AlertTriangle,
    Users,
    TrendingUp,
    FileText,
    Settings
} from 'lucide-react'

interface QuickActionsProps {
    userRole?: 'admin' | 'manager' | 'technician' | 'employee'
}

export function QuickActions({ userRole = 'employee' }: QuickActionsProps) {
    const [loading, setLoading] = useState(false)

    const baseActions = [
        {
            title: 'Create Ticket',
            description: 'Submit a new support ticket',
            icon: Plus,
            href: '/tickets/create',
            color: 'blue'
        },
        {
            title: 'My Tickets',
            description: 'View tickets assigned to me',
            icon: Clock,
            href: '/tickets',
            color: 'yellow'
        }
    ]

    const managerActions = [
        {
            title: 'Unassigned Tickets',
            description: 'View tickets needing assignment',
            icon: Users,
            href: '/tickets?filter=unassigned',
            color: 'indigo'
        },
        {
            title: 'Critical Tickets',
            description: 'View high-priority issues',
            icon: AlertTriangle,
            href: '/tickets?filter=critical',
            color: 'red'
        }
    ]

    const adminActions = [
        {
            title: 'Analytics',
            description: 'View detailed reports',
            icon: TrendingUp,
            href: '/analytics',
            color: 'purple'
        }
    ]

    const allActions = [...baseActions]

    if (userRole === 'manager' || userRole === 'admin') {
        allActions.push(...managerActions)
    }

    if (userRole === 'admin') {
        allActions.push(...adminActions)
    }

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30',
            yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30',
            red: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
            indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30',
            purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30',
            green: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
        }
        return colors[color as keyof typeof colors] || colors.blue
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                    Quick Actions
                </h3>
                <Settings className="h-5 w-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <Link
                            key={index}
                            href={action.href}
                            className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${getColorClasses(action.color)}`}
                        >
                            <Icon className="h-8 w-8 mb-2" />
                            <h4 className="text-sm font-medium text-center">
                                {action.title}
                            </h4>
                            <p className="text-xs text-center mt-1 opacity-75">
                                {action.description}
                            </p>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}