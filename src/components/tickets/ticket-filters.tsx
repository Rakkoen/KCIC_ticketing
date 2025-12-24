'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TicketFiltersProps {
    onFiltersChange: (filters: TicketFilters) => void
}

export interface TicketFilters {
    status: string[]
    priority: string[]
    assignee: string[]
    dateRange: {
        from: string
        to: string
    } | null
}

interface User {
    id: string
    full_name: string | null
    email: string
    role: string
}

export function TicketFilters({ onFiltersChange }: TicketFiltersProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const [filters, setFilters] = useState<TicketFilters>({
        status: [],
        priority: [],
        assignee: [],
        dateRange: null
    })
    const supabase = createClient()

    const statusOptions = ['new', 'in_progress', 'resolved', 'closed']
    const priorityOptions = ['low', 'medium', 'high', 'critical']

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, email, role')
            .in('role', ['admin', 'manager', 'worker'])
            .order('full_name')

        if (error) {
            console.error('Error fetching users:', error)
        } else {
            setUsers(data || [])
        }
    }

    const handleStatusToggle = (status: string) => {
        const newStatus = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status]

        const newFilters = { ...filters, status: newStatus }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const handlePriorityToggle = (priority: string) => {
        const newPriority = filters.priority.includes(priority)
            ? filters.priority.filter(p => p !== priority)
            : [...filters.priority, priority]

        const newFilters = { ...filters, priority: newPriority }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const handleAssigneeToggle = (assigneeId: string) => {
        const newAssignee = filters.assignee.includes(assigneeId)
            ? filters.assignee.filter(a => a !== assigneeId)
            : [...filters.assignee, assigneeId]

        const newFilters = { ...filters, assignee: newAssignee }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
        const newDateRange = {
            from: filters.dateRange?.from || '',
            to: filters.dateRange?.to || '',
            [field]: value
        }
        
        const newFilters = { ...filters, dateRange: newDateRange }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const clearAllFilters = () => {
        const newFilters = {
            status: [],
            priority: [],
            assignee: [],
            dateRange: null
        }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const hasActiveFilters = 
        filters.status.length > 0 || 
        filters.priority.length > 0 || 
        filters.assignee.length > 0 || 
        filters.dateRange !== null

    const getActiveFilterCount = () => {
        let count = 0
        count += filters.status.length
        count += filters.priority.length
        count += filters.assignee.length
        if (filters.dateRange) count += 1
        return count
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs">
                        {getActiveFilterCount()}
                    </Badge>
                )}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-96 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Filter Tickets</h3>
                        <div className="flex space-x-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Status Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Status</h4>
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusToggle(status)}
                                        className={`px-3 py-1 text-xs rounded-full border ${
                                            filters.status.includes(status)
                                                ? 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200'
                                                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Priority</h4>
                            <div className="flex flex-wrap gap-2">
                                {priorityOptions.map((priority) => (
                                    <button
                                        key={priority}
                                        onClick={() => handlePriorityToggle(priority)}
                                        className={`px-3 py-1 text-xs rounded-full border ${
                                            filters.priority.includes(priority)
                                                ? 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200'
                                                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {priority}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignee Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Assignee</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {users.map((user) => (
                                    <label key={user.id} className="flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={filters.assignee.includes(user.id)}
                                            onChange={() => handleAssigneeToggle(user.id)}
                                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800"
                                        />
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {user.full_name || user.email}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Date Range</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="date-from" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                        From
                                    </label>
                                    <input
                                        type="date"
                                        id="date-from"
                                        value={filters.dateRange?.from || ''}
                                        onChange={(e) => handleDateRangeChange('from', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="date-to" className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                        To
                                    </label>
                                    <input
                                        type="date"
                                        id="date-to"
                                        value={filters.dateRange?.to || ''}
                                        onChange={(e) => handleDateRangeChange('to', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}