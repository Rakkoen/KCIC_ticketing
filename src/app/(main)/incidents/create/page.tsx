'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateIncidentPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'medium',
        impact: 'none',
        urgency: 'medium',
        category: '',
        affected_users: 0,
        estimated_downtime_minutes: 0,
        affected_systems: ['']
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Not authenticated')

            // Clean up the affected_systems array
            const cleanSystems = formData.affected_systems.filter(system => system.trim() !== '')

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const insertData: any = {
                title: formData.title,
                description: formData.description,
                severity: formData.severity,
                impact: formData.impact,
                urgency: formData.urgency,
                category: formData.category || null,
                affected_users: formData.affected_users,
                estimated_downtime_minutes: formData.estimated_downtime_minutes || null,
                affected_systems: cleanSystems.length > 0 ? cleanSystems : null,
                created_by: user.id
            }

            const { error } = await supabase
                .from('incidents')
                .insert(insertData)

            if (error) throw error

            router.push('/incidents')
            router.refresh()
        } catch (error) {
            console.error('Error creating incident:', error)
            alert('Failed to create incident')
        } finally {
            setLoading(false)
        }
    }

    const severityOptions = [
        { value: 'low', label: 'Low', description: 'Minor issue with limited impact' },
        { value: 'medium', label: 'Medium', description: 'Moderate issue affecting some users' },
        { value: 'high', label: 'High', description: 'Significant issue affecting many users' },
        { value: 'critical', label: 'Critical', description: 'Critical issue affecting all users' }
    ]

    const getSeverityColor = (severity: string) => {
        const colors = {
            low: 'secondary',
            medium: 'info',
            high: 'warning',
            critical: 'destructive'
        }
        return colors[severity as keyof typeof colors] || 'default'
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'low':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'medium':
                return <Clock className="h-5 w-5 text-yellow-500" />
            case 'high':
                return <AlertTriangle className="h-5 w-5 text-orange-500" />
            case 'critical':
                return <XCircle className="h-5 w-5 text-red-500" />
            default:
                return <AlertTriangle className="h-5 w-5" />
        }
    }

    const addAffectedSystem = () => {
        setFormData({
            ...formData,
            affected_systems: [...formData.affected_systems, '']
        })
    }

    const updateAffectedSystem = (index: number, value: string) => {
        const newSystems = [...formData.affected_systems]
        newSystems[index] = value
        setFormData({
            ...formData,
            affected_systems: newSystems
        })
    }

    const removeAffectedSystem = (index: number) => {
        const newSystems = formData.affected_systems.filter((_, i) => i !== index)
        setFormData({
            ...formData,
            affected_systems: newSystems
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <div className="flex items-center">
                    <Link href="/incidents" className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="ml-4 text-2xl font-bold text-zinc-900 dark:text-white">Create New Incident</h1>
                </div>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Report a system incident that requires investigation and resolution.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow border border-zinc-200 dark:border-zinc-700">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Basic Information</h3>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Incident Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="Brief summary of the incident"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="Detailed description of the incident and its impact..."
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="e.g., Network, Database, Application"
                        />
                    </div>
                </div>

                {/* Impact Assessment */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Impact Assessment</h3>

                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                            Severity Level *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {severityOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className={`
                                        relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors
                                        ${formData.severity === option.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                                        }
                                    `}
                                >
                                    <input
                                        type="radio"
                                        name="severity"
                                        value={option.value}
                                        checked={formData.severity === option.value}
                                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                        className="sr-only"
                                    />
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            {getSeverityIcon(option.value)}
                                            <span className="ml-2 font-medium text-zinc-900 dark:text-white">
                                                {option.label}
                                            </span>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            <Badge variant={getSeverityColor(option.value) as any} className="ml-2">
                                                {option.value.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                            {option.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="impact" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Impact
                            </label>
                            <select
                                id="impact"
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            >
                                <option value="none">None</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="urgency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Urgency
                            </label>
                            <select
                                id="urgency"
                                value={formData.urgency}
                                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="affected_users" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Affected Users
                            </label>
                            <input
                                type="number"
                                id="affected_users"
                                min="0"
                                value={formData.affected_users}
                                onChange={(e) => setFormData({ ...formData, affected_users: parseInt(e.target.value) || 0 })}
                                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            />
                        </div>

                        <div>
                            <label htmlFor="estimated_downtime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Estimated Downtime (minutes)
                            </label>
                            <input
                                type="number"
                                id="estimated_downtime"
                                min="0"
                                value={formData.estimated_downtime_minutes}
                                onChange={(e) => setFormData({ ...formData, estimated_downtime_minutes: parseInt(e.target.value) || 0 })}
                                className="mt-1 block w-full rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            />
                        </div>
                    </div>
                </div>

                {/* Affected Systems */}
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3">Affected Systems</h3>
                    {formData.affected_systems.map((system, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                                type="text"
                                value={system}
                                onChange={(e) => updateAffectedSystem(index, e.target.value)}
                                className="flex-1 rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                                placeholder="Enter system name"
                            />
                            {formData.affected_systems.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeAffectedSystem(index)}
                                    className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addAffectedSystem}
                        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        <span className="mr-1">+</span> Add System
                    </button>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-white dark:bg-zinc-800 py-2 px-4 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            'Create Incident'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}