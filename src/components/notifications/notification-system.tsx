'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Bell,
    X,
    CheckCircle,
    AlertTriangle,
    Info,
    AlertCircle
} from 'lucide-react'

interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
    read: boolean
    ticketId?: string
}

interface NotificationContextType {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
    markAsRead: (id: string) => void
    clearAll: () => void
    unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider')
    }
    return context
}

interface NotificationProviderProps {
    children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const supabase = createClient()

    useEffect(() => {
        // Set up real-time subscription for ticket changes
        const channel = supabase
            .channel('ticket_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'tickets' },
                (payload) => {
                    handleTicketChange(payload)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleTicketChange = (payload: any) => {
        const { eventType, new: newRecord, old: oldRecord } = payload

        let notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
            type: 'info',
            title: 'Ticket Updated',
            message: 'A ticket has been updated'
        }

        switch (eventType) {
            case 'INSERT':
                notification = {
                    type: 'info',
                    title: 'New Ticket Created',
                    message: `Ticket "${newRecord.title}" has been created`,
                    ticketId: newRecord.id
                }
                break
            case 'UPDATE':
                if (oldRecord.status !== newRecord.status) {
                    notification = {
                        type: 'success',
                        title: 'Status Changed',
                        message: `Ticket status changed from ${oldRecord.status} to ${newRecord.status}`,
                        ticketId: newRecord.id
                    }
                }
                if (oldRecord.assigned_to !== newRecord.assigned_to) {
                    notification = {
                        type: 'info',
                        title: 'Assignment Changed',
                        message: `Ticket has been reassigned`,
                        ticketId: newRecord.id
                    }
                }
                if (oldRecord.priority !== newRecord.priority && newRecord.priority === 'critical') {
                    notification = {
                        type: 'warning',
                        title: 'Priority Changed',
                        message: `Ticket priority has been set to critical`,
                        ticketId: newRecord.id
                    }
                }
                break
        }

        addNotification(notification)
    }

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false
        }

        setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep only last 50
    }

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        )
    }

    const clearAll = () => {
        setNotifications([])
    }

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            markAsRead,
            clearAll,
            unreadCount
        }}>
            {children}
        </NotificationContext.Provider>
    )
}

interface NotificationDropdownProps {
    userRole?: 'admin' | 'manager' | 'worker' | 'employee'
}

export function NotificationDropdown({ userRole = 'employee' }: NotificationDropdownProps) {
    const { notifications, markAsRead, clearAll, unreadCount } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />
            default:
                return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const getTimeAgo = (timestamp: Date) => {
        const now = new Date()
        const diff = now.getTime() - timestamp.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
                                Notifications
                            </h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                        onClick={() => {
                                            markAsRead(notification.id)
                                            setIsOpen(false)
                                            // Navigate to ticket if ticketId exists
                                            if (notification.ticketId) {
                                                window.location.href = `/tickets/${notification.ticketId}`
                                            }
                                        }}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {getIcon(notification.type)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                    {getTimeAgo(notification.timestamp)}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}