'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Clock, Save, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RouteProtection } from '@/components/route-protection'

type SLAPolicy = Database['public']['Tables']['sla_policies']['Row']

export default function SLAPoliciesPage() {
    return (
        <RouteProtection route="/sla-policies">
            <SLAPoliciesPageContent />
        </RouteProtection>
    )
}

function SLAPoliciesPageContent() {
    const [policies, setPolicies] = useState<SLAPolicy[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<SLAPolicy>>({})
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchPolicies()
    }, [])

    const fetchPolicies = async () => {
        const { data, error } = await supabase
            .from('sla_policies')
            .select('*')
            .order('priority')

        if (!error && data) {
            setPolicies(data)
        }
        setLoading(false)
    }

    const handleEdit = (policy: SLAPolicy) => {
        setEditing(policy.id)
        setEditForm(policy)
    }

    const handleSave = async () => {
        if (!editing) return

        const { error } = await supabase
            .from('sla_policies')
            .update({
                name: editForm.name,
                response_time_hours: editForm.response_time_hours,
                resolution_time_hours: editForm.resolution_time_hours,
                is_active: editForm.is_active
            })
            .eq('id', editing)

        if (!error) {
            setEditing(null)
            fetchPolicies()
            router.refresh()
        }
    }

    const handleToggleActive = async (policyId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('sla_policies')
            .update({ is_active: !currentStatus })
            .eq('id', policyId)

        if (!error) {
            fetchPolicies()
        }
    }

    const getPriorityColor = (priority: string) => {
        const colors = {
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }
        return colors[priority as keyof typeof colors] || 'bg-zinc-100 text-zinc-800'
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
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">SLA Policies</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Configure service level agreement response and resolution times
                </p>
            </div>

            {/* SLA Policies Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Policy Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Response Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Resolution Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                        {policies.map((policy) => (
                            <tr key={policy.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(policy.priority)}`}>
                                        {policy.priority.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {editing === policy.id ? (
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-900"
                                        />
                                    ) : (
                                        <span className="text-sm text-zinc-900 dark:text-white">{policy.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editing === policy.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editForm.response_time_hours || 0}
                                                onChange={(e) => setEditForm({ ...editForm, response_time_hours: parseInt(e.target.value) })}
                                                className="w-20 px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-900"
                                            />
                                            <span className="text-sm text-zinc-500">hours</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-zinc-900 dark:text-white">
                                            {policy.response_time_hours} hours
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editing === policy.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editForm.resolution_time_hours || 0}
                                                onChange={(e) => setEditForm({ ...editForm, resolution_time_hours: parseInt(e.target.value) })}
                                                className="w-20 px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-900"
                                            />
                                            <span className="text-sm text-zinc-500">hours</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-zinc-900 dark:text-white">
                                            {policy.resolution_time_hours} hours
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleActive(policy.id, policy.is_active)}
                                        className={`px-3 py-1 rounded text-xs font-medium ${policy.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                                            }`}
                                    >
                                        {policy.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editing === policy.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={handleSave}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Save className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditing(null)}
                                                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(policy)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                            How SLA Policies Work
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                            <li>SLA due dates are automatically calculated when tickets/incidents are created</li>
                            <li>Response time: How quickly the team should acknowledge the issue</li>
                            <li>Resolution time: Total time allowed to resolve the issue</li>
                            <li>SLA breach warnings appear when deadlines approach or are exceeded</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
