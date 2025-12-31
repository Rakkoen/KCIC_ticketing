'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, MapPin, Wrench, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function CreateTicketPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
    const [status, setStatus] = useState<'open' | 'in_progress' | 'on_escalation' | 'resolved' | 'closed'>('open')
    const [station, setStation] = useState<'Halim' | 'Karawang' | 'Padalarang' | 'Tegalluar' | ''>('')
    const [location, setLocation] = useState('')
    const [equipmentCategory, setEquipmentCategory] = useState('')
    const [comments, setComments] = useState('')
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

            const insertData = {
                title,
                description,
                priority,
                status,
                station,
                location: location || null,
                equipment_category: equipmentCategory || null,
                comments: comments || null,
                escalation_status: status === 'on_escalation' ? 'yes' : 'no',
                created_by: user.id
            }

            console.log('=== DEBUG: INSERT DATA ===')
            console.log('User ID:', user.id)
            console.log('User Email:', user.email)
            console.log('Insert Payload:', JSON.stringify(insertData, null, 2))
            console.log('========================')

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { data, error } = await supabase.from('tickets').insert(insertData).select()

            console.log('=== DEBUG: RESPONSE ===')
            console.log('Data:', data)
            console.log('Error:', error)
            console.log('======================')

            if (error) {
                console.error('Supabase error:', error)
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                alert(`Failed to create ticket: ${error.message || 'Unknown error'}`)
                throw error
            }

            alert('Ticket created successfully!')
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

                    {/* Location */}
                    <div className="mt-4">
                        <label htmlFor="location" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="e.g., Platform 2, Main Hall, Entrance Gate 1"
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Specific physical location within the station</p>
                    </div>

                    {/* Equipment Category */}
                    <div className="mt-4">
                        <label htmlFor="equipment_category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Asset Category (Equipment)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Wrench className="h-4 w-4 text-zinc-400" />
                            </div>
                            <input
                                type="text"
                                id="equipment_category"
                                value={equipmentCategory}
                                onChange={(e) => setEquipmentCategory(e.target.value)}
                                className="block w-full pl-10 rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                                placeholder="e.g., Electrical, Mechanical, IT, HVAC, Safety, etc."
                            />
                        </div>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Type of equipment/asset involved (e.g., Electrical, Mechanical, IT, Civil, Plumbing, HVAC, Safety)</p>
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

                    {/* Comments / Troubleshooting Notes */}
                    <div className="mt-4">
                        <label htmlFor="comments" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Comments / Troubleshooting Notes
                            </div>
                        </label>
                        <textarea
                            id="comments"
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="mt-1 block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="Any additional notes or troubleshooting actions taken..."
                        />
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Optional internal notes about the issue or actions taken</p>
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
