'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function CreateTicketPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
    const [status, setStatus] = useState<'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'>('open')
    const [station, setStation] = useState<'Halim' | 'Karawang' | 'Padalarang' | 'Tegalluar' | 'Depo Tegal Luar' | ''>('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            if (!station) {
                alert('Please select a station')
                setLoading(false)
                return
            }

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { error } = await supabase.from('tickets').insert({
                title,
                description,
                priority,
                status,
                station,
                created_by: user.id
            })

            if (error) {
                console.error('Supabase error:', error)
                throw error
            }

            router.push('/tickets')
            router.refresh()
        } catch (error) {
            console.error('Error creating ticket:', error)
            alert('Failed to create ticket')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/tickets"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create New Ticket</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Submit a new support ticket</p>
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

                    {/* Station */}
                    <div className="mt-4">
                        <label htmlFor="station" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Station *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                            </div>
                            <select
                                id="station"
                                required
                                value={station}
                                onChange={(e) => setStation(e.target.value as any)}
                                className="block w-full pl-10 rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            >
                                <option value="">Select Station</option>
                                <option value="Halim">Halim</option>
                                <option value="Karawang">Karawang</option>
                                <option value="Padalarang">Padalarang</option>
                                <option value="Tegalluar">Tegalluar</option>
                                <option value="Depo Tegal Luar">Depo Tegal Luar</option>
                            </select>
                        </div>
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
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/tickets"
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="-ml-1 mr-2 h-5 w-5" />
                                Create Ticket
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
