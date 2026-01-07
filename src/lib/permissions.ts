/**
 * RBAC Permission System
 * Centralized permission checking for role-based access control
 */

import { Database } from '@/types/database.types'

type UserRole = 'admin' | 'manager' | 'technician' | 'employee'
type Ticket = Database['public']['Tables']['tickets']['Row']

export const ROLES = {
    ADMIN: 'admin' as UserRole,
    MANAGER: 'manager' as UserRole,
    TECHNICIAN: 'technician' as UserRole,
    EMPLOYEE: 'employee' as UserRole,
}

/**
 * Permission Matrix
 * Defines what each role can do
 */
export const PERMISSIONS = {
    // Ticket Viewing
    VIEW_ALL_TICKETS: ['admin', 'manager'],
    VIEW_ASSIGNED_TICKETS: ['admin', 'manager', 'technician'],
    VIEW_OWN_TICKETS: ['admin', 'manager', 'technician', 'employee'],

    // Ticket Management
    CREATE_TICKET: ['admin', 'manager', 'technician', 'employee'],
    UPDATE_TICKET_STATUS: ['admin', 'manager', 'technician'],
    ASSIGN_TICKET: ['admin', 'manager'],
    DELETE_TICKET: ['admin'],

    // Comments & Attachments
    ADD_COMMENT: ['admin', 'manager', 'technician', 'employee'],
    UPLOAD_EVIDENCE: ['admin', 'manager', 'technician'],
    DELETE_ATTACHMENT: ['admin', 'manager'],

    // Analytics & Reports
    VIEW_ANALYTICS: ['admin', 'manager'],
    VIEW_REPORTS: ['admin', 'manager'],
    EXPORT_DATA: ['admin', 'manager'],

    // User Management
    MANAGE_USERS: ['admin'],
    VIEW_ALL_USERS: ['admin', 'manager'],

    // System Configuration
    CONFIGURE_SLA: ['admin', 'manager'],
    MANAGE_SETTINGS: ['admin'],
} as const

/**
 * Check if user has a specific permission
 */
export function hasPermission(
    userRole: UserRole | null,
    permission: keyof typeof PERMISSIONS
): boolean {
    if (!userRole) return false
    return PERMISSIONS[permission].includes(userRole)
}

/**
 * Check if user can view a specific ticket
 */
export function canViewTicket(
    userRole: UserRole | null,
    ticket: Ticket | null,
    userId: string | null
): boolean {
    if (!userRole || !ticket || !userId) return false

    // Admin and Manager can view all tickets
    if (hasPermission(userRole, 'VIEW_ALL_TICKETS')) return true

    // Technician can view assigned tickets
    if (userRole === ROLES.TECHNICIAN && ticket.assigned_to === userId) {
        return true
    }

    // Employee can view their own tickets
    if (userRole === ROLES.EMPLOYEE && ticket.created_by === userId) {
        return true
    }

    return false
}

/**
 * Check if user can update a ticket
 */
export function canUpdateTicket(
    userRole: UserRole | null,
    ticket: Ticket | null,
    userId: string | null
): boolean {
    if (!userRole || !ticket || !userId) return false

    // Admin can update any ticket
    if (userRole === ROLES.ADMIN) return true

    // Manager can update any ticket
    if (userRole === ROLES.MANAGER) return true

    // Technician can update assigned tickets
    if (userRole === ROLES.TECHNICIAN && ticket.assigned_to === userId) {
        return true
    }

    return false
}

/**
 * Check if user can assign tickets
 */
export function canAssignTicket(userRole: UserRole | null): boolean {
    return hasPermission(userRole, 'ASSIGN_TICKET')
}

/**
 * Check if user can delete tickets
 */
export function canDeleteTicket(userRole: UserRole | null): boolean {
    return hasPermission(userRole, 'DELETE_TICKET')
}

/**
 * Check if user can upload evidence/attachments
 */
export function canUploadEvidence(
    userRole: UserRole | null,
    ticket: Ticket | null,
    userId: string | null
): boolean {
    if (!userRole || !ticket || !userId) return false

    // Admin and Manager can always upload
    if (hasPermission(userRole, 'UPLOAD_EVIDENCE')) {
        if (userRole === ROLES.ADMIN || userRole === ROLES.MANAGER) return true
    }

    // Technician can upload to assigned tickets
    if (userRole === ROLES.TECHNICIAN && ticket.assigned_to === userId) {
        return true
    }

    return false
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(userRole: UserRole | null): boolean {
    return hasPermission(userRole, 'VIEW_ANALYTICS')
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(userRole: UserRole | null): boolean {
    return hasPermission(userRole, 'MANAGE_USERS')
}

/**
 * Check if user can configure SLA policies
 */
export function canConfigureSLA(userRole: UserRole | null): boolean {
    return hasPermission(userRole, 'CONFIGURE_SLA')
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
    const roleNames = {
        admin: 'Administrator',
        manager: 'Manager',
        technician: 'Technician',
        employee: 'Employee',
    }
    return roleNames[role] || role
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
    const colors = {
        admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        technician: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        employee: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    }
    return colors[role] || colors.employee
}
