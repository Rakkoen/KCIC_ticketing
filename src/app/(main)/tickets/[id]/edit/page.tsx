'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type User = Database['public']['Tables']['users']['Row']

export default function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
    const [status, setStatus] = useState<'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'>('open')
    const [assignedTo, setAssignedTo] = useState('')
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        params.then(p => {
            setId(p.id)
            fetchTicket(p.id)
            fetchUsers()
        })
    }, [])

    const fetchTicket = async (ticketId: string) => {
        try {
            const { data: rawData, error } = await supabase
                .from('tickets')
                .select('*')
                .eq('id', ticketId)
                .single() as any

            const data = rawData as Ticket

            if (error) throw error

            if (data) {
                setTitle(data.title)
                setDescription(data.description)
                setPriority(data.priority)
                setStatus(data.status)
                setAssignedTo(data.assigned_to || '')
            }
        } catch (error) {
            console.error('Error fetching ticket:', error)
            alert('Failed to load ticket')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('role', ['admin', 'manager', 'worker'])
            .order('full_name') as any

        setUsers(data || [])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { error } = await (supabase
                .from('tickets') as any)
                .update({
                    title,
                    description,
                    priority,
                    status,
                    assigned_to: assignedTo || null
                })
                .eq('id', id)

            if (error) throw error

            router.push(`/tickets/${id}`)
            router.refresh()
        } catch (error) {
            console.error('Error updating ticket:', error)
            alert('Failed to update ticket. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/tickets/${id}`}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Edit Ticket</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Update ticket details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="Brief description of the issue"
                        />
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            required
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="Provide detailed information about the ticket"
                        />
                    </div>

                    {/* Priority and Status */}
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Priority *
                            </label>
                            <select
                                id="priority"
                                required
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Status *
                            </label>
                            <select
                                id="status"
                                required
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_escalation">On Escalation</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Assign To */}
                    <div className="mt-4">
                        <label htmlFor="assignTo" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Assign To
                        </label>
                        <select
                            id="assignTo"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="">Unassigned</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name || user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Link
                        href={`/tickets/${id}`}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="-ml-1 mr-2 h-5 w-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
