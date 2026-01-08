/**
 * User Management Page
 * Comprehensive user management with CRUD operations, search, and filtering
 * Access: Employee and Manager roles only
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { RouteProtection } from '@/components/route-protection'
import {
    Users as UsersIcon,
    Search,
    Plus,
    Edit,
    Trash2,
    X,
    Loader2,
    UserPlus,
    Mail,
    Phone as PhoneIcon,
    Calendar
} from 'lucide-react'

type User = Database['public']['Tables']['users']['Row']
type UserRole = 'admin' | 'manager' | 'technician' | 'employee'
type AvailabilityStatus = 'available' | 'busy' | 'offline'

interface UserFormData {
    email: string
    password: string
    full_name: string
    role: UserRole
    availability_status: AvailabilityStatus
}

export default function UsersPage() {
    return (
        <RouteProtection route="/users">
            <UsersPageContent />
        </RouteProtection>
    )
}

function UsersPageContent() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [deletingUser, setDeletingUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        full_name: '',
        role: 'employee',
        availability_status: 'available'
    })
    const [formErrors, setFormErrors] = useState<Partial<UserFormData>>({})
    const [submitting, setSubmitting] = useState(false)

    const supabase = createClient()

    // Fetch users
    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            const matchesStatus = statusFilter === 'all' || user.availability_status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, searchQuery, roleFilter, statusFilter])

    // Statistics
    const stats = useMemo(() => {
        return {
            total: users.length,
            available: users.filter(u => u.availability_status === 'available').length,
            busy: users.filter(u => u.availability_status === 'busy').length,
            offline: users.filter(u => u.availability_status === 'offline').length,
            byRole: {
                admin: users.filter(u => u.role === 'admin').length,
                manager: users.filter(u => u.role === 'manager').length,
                technician: users.filter(u => u.role === 'technician').length,
                employee: users.filter(u => u.role === 'employee').length,
            }
        }
    }, [users])

    // Form validation
    const validateForm = useCallback(() => {
        const errors: Partial<UserFormData> = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formData.email) {
            errors.email = 'Email is required'
        } else if (!emailRegex.test(formData.email)) {
            errors.email = 'Invalid email format'
        }

        if (!editingUser && (!formData.password || formData.password.length < 6)) {
            errors.password = 'Password must be at least 6 characters'
        }

        if (!formData.full_name || formData.full_name.length < 2) {
            errors.full_name = 'Full name must be at least 2 characters'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }, [formData, editingUser])

    // Create user using Supabase Auth (like signup)
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            // Step 1: Sign up user with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        role: formData.role,
                        availability_status: formData.availability_status
                    }
                }
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setFormErrors({ email: 'Email already exists' })
                    return
                }
                console.error('Signup error:', authError)
                alert(`Failed to create user: ${authError.message}`)
                return
            }

            // Step 2: Update users table with role and status (if trigger doesn't handle it)
            if (authData.user) {
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        role: formData.role,
                        availability_status: formData.availability_status,
                        full_name: formData.full_name
                    })
                    .eq('id', authData.user.id)

                if (updateError) {
                    console.error('Error updating user profile:', updateError)
                }
            }

            await fetchUsers()
            setShowCreateModal(false)
            resetForm()
            alert('User created successfully! They can now login with their email and password.')
        } catch (error) {
            console.error('Error creating user:', error)
            alert('Failed to create user')
        } finally {
            setSubmitting(false)
        }
    }

    // Update user
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm() || !editingUser) return

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    role: formData.role,
                    availability_status: formData.availability_status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editingUser.id)

            if (error) {
                console.error('Update user error:', error)
                alert(`Failed to update user: ${error.message}`)
                return
            }

            await fetchUsers()
            setEditingUser(null)
            resetForm()
        } catch (error) {
            console.error('Error updating user:', error)
            alert('Failed to update user')
        } finally {
            setSubmitting(false)
        }
    }

    // Delete user
    const handleDeleteUser = async () => {
        if (!deletingUser) return

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', deletingUser.id)

            if (error) throw error

            await fetchUsers()
            setDeletingUser(null)
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user')
        }
    }

    // Quick status change
    const handleStatusChange = async (userId: string, newStatus: AvailabilityStatus) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ availability_status: newStatus, updated_at: new Date().toISOString() })
                .eq('id', userId)

            if (error) throw error

            await fetchUsers()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update status')
        }
    }

    // Helpers
    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            full_name: '',
            role: 'employee',
            availability_status: 'available'
        })
        setFormErrors({})
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setFormData({
            email: user.email,
            password: '', // Not used in edit mode
            full_name: user.full_name || '',
            role: user.role as UserRole,
            availability_status: user.availability_status as AvailabilityStatus
        })
    }

    const getRoleBadgeClass = (role: string) => {
        const classes = {
            admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            technician: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            employee: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }
        return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800'
    }

    const getStatusBadgeClass = (status: string) => {
        const classes = {
            available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            offline: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
        }
        return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage system users and their roles
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm()
                        setShowCreateModal(true)
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Users</p>
                            <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.total}</p>
                        </div>
                        <UsersIcon className="h-10 w-10 text-indigo-600" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Available</p>
                            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-green-600"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Busy</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.busy}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Offline</p>
                            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{stats.offline}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-gray-600"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="employee">Employee</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                        <thead className="bg-zinc-50 dark:bg-zinc-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                        No users found matching your criteria
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                        {/* User */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                        {getInitials(user.full_name || user.email)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {user.full_name || 'No name'}
                                                    </div>
                                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={user.availability_status}
                                                onChange={(e) => handleStatusChange(user.id, e.target.value as AvailabilityStatus)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadgeClass(user.availability_status)}`}
                                            >
                                                <option value="available">Available</option>
                                                <option value="busy">Busy</option>
                                                <option value="offline">Offline</option>
                                            </select>
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                            >
                                                <Edit className="h-4 w-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingUser(user)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="h-4 w-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false)
                                    setEditingUser(null)
                                    resetForm()
                                }}
                                className="text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!!editingUser}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white disabled:opacity-50"
                                />
                                {formErrors.email && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                                )}
                            </div>

                            {/* Password - Only show for new users */}
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                        placeholder="Minimum 6 characters"
                                    />
                                    {formErrors.password && (
                                        <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
                                    )}
                                </div>
                            )}

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                />
                                {formErrors.full_name && (
                                    <p className="text-sm text-red-600 mt-1">{formErrors.full_name}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Role *
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="technician">Technician</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Availability Status
                                </label>
                                <select
                                    value={formData.availability_status}
                                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as AvailabilityStatus })}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setEditingUser(null)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 flex items-center"
                                >
                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
                            Are you sure you want to delete <strong>{deletingUser.full_name || deletingUser.email}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
