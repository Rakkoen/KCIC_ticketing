/**
 * Navigation Access Control
 * Defines menu items and their role-based access rules
 */

import { Home, FileText, Users, BarChart2, FileBarChart, Clock, Settings, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type UserRole = 'admin' | 'manager' | 'technician' | 'employee'

export interface NavigationItem {
    name: string
    href: string
    icon: LucideIcon
    allowedRoles: UserRole[]
}

/**
 * Complete navigation configuration with role-based access control
 */
export const navigationItems: NavigationItem[] = [
    {
        name: 'Dashboard',
        href: '/',
        icon: Home,
        allowedRoles: ['admin', 'manager', 'technician', 'employee'], // All roles
    },
    {
        name: 'Tickets',
        href: '/tickets',
        icon: FileText,
        allowedRoles: ['admin', 'manager', 'technician', 'employee'], // All roles
    },
    {
        name: 'Workers',
        href: '/workers',
        icon: Users,
        allowedRoles: ['admin', 'employee'], // Admin and Employee only
    },
    {
        name: 'User Management',
        href: '/users',
        icon: UserCog,
        allowedRoles: ['admin', 'employee', 'manager'], // Admin, Employee, and Manager
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: BarChart2,
        allowedRoles: ['admin', 'employee'], // Admin and Employee only
    },
    {
        name: 'Reports',
        href: '/reports',
        icon: FileBarChart,
        allowedRoles: ['admin', 'employee', 'manager'], // Admin, Employee, and Manager
    },
    {
        name: 'SLA Policies',
        href: '/sla-policies',
        icon: Clock,
        allowedRoles: ['admin', 'employee'], // Admin and Employee only
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        allowedRoles: ['admin', 'employee'], // Admin and Employee only
    },
]

/**
 * Filter navigation items based on user role
 */
export function getAccessibleNavigation(userRole: UserRole | null): NavigationItem[] {
    if (!userRole) {
        // If no role, only show public items (Dashboard and Tickets)
        return navigationItems.filter(item =>
            item.href === '/' || item.href === '/tickets'
        )
    }

    return navigationItems.filter(item =>
        item.allowedRoles.includes(userRole)
    )
}

/**
 * Check if a user has access to a specific route
 */
export function hasRouteAccess(userRole: UserRole | null, route: string): boolean {
    if (!userRole) {
        return route === '/' || route === '/tickets'
    }

    const item = navigationItems.find(nav =>
        route === nav.href || route.startsWith(nav.href + '/')
    )

    if (!item) {
        // If route not in navigation, allow access (could be a detail page)
        return true
    }

    return item.allowedRoles.includes(userRole)
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
        admin: 'Administrator',
        manager: 'Manager',
        technician: 'Technician',
        employee: 'Employee',
    }
    return roleNames[role]
}
