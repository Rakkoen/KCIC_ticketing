'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Palette, Layout, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RouteProtection } from '@/components/route-protection'

export default function SettingsPage() {
    return (
        <RouteProtection route="/settings">
            <SettingsPageContent />
        </RouteProtection>
    )
}

function SettingsPageContent() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [preferences, setPreferences] = useState({
        theme: 'system',
        email_notifications: true,
        desktop_notifications: false,
        notification_frequency: 'realtime',
        default_view: 'grid',
        items_per_page: 20
    })
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchPreferences()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchPreferences = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('user_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!error && data) {
                setPreferences(data as any)
            }
        } catch (error) {
            console.error('Error fetching preferences:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: user.id,
                    ...preferences
                })

            if (!error) {
                router.refresh()
                alert('Settings saved successfully!')
            }
        } catch (error) {
            console.error('Error saving preferences:', error)
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
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Customize your application preferences
                </p>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Appearance</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Theme
                        </label>
                        <select
                            value={preferences.theme}
                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Notifications</h2>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Email Notifications</span>
                        <input
                            type="checkbox"
                            checked={preferences.email_notifications}
                            onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </label>

                    <label className="flex items-center justify-between">
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Desktop Notifications</span>
                        <input
                            type="checkbox"
                            checked={preferences.desktop_notifications}
                            onChange={(e) => setPreferences({ ...preferences, desktop_notifications: e.target.checked })}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Notification Frequency
                        </label>
                        <select
                            value={preferences.notification_frequency}
                            onChange={(e) => setPreferences({ ...preferences, notification_frequency: e.target.value })}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="realtime">Real-time</option>
                            <option value="hourly">Hourly Digest</option>
                            <option value="daily">Daily Digest</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Display */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                    <Layout className="h-5 w-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Display Preferences</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Default View
                        </label>
                        <select
                            value={preferences.default_view}
                            onChange={(e) => setPreferences({ ...preferences, default_view: e.target.value })}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="grid">Grid View</option>
                            <option value="list">List View</option>
                            <option value="kanban">Kanban Board</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Items Per Page
                        </label>
                        <select
                            value={preferences.items_per_page}
                            onChange={(e) => setPreferences({ ...preferences, items_per_page: parseInt(e.target.value) })}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
