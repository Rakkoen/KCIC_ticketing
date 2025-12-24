'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminSetupPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const createTestAccounts = async () => {
        setLoading(true)
        setMessage(null)
        setIsSuccess(false)

        try {
            const response = await fetch('/api/create-test-users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const data = await response.json()

            if (data.success) {
                setIsSuccess(true)
                setMessage('Test accounts created successfully! You can now use these accounts to login:\n\n' +
                         'Admin: admin@kcic.com / admin123\n' +
                         'Manager: manager@kcic.com / manager123\n' +
                         'Worker: worker@kcic.com / worker123\n' +
                         'Employee: employee@kcic.com / employee123\n\n' +
                         'Results:\n' + data.results.map((r: any) => `${r.email}: ${r.status} (${r.role || r.message || ''})`).join('\n'))
            } else {
                setIsSuccess(false)
                setMessage(data.message || 'Failed to create test accounts')
            }

        } catch (error) {
            setIsSuccess(false)
            setMessage(error instanceof Error ? error.message : 'Failed to create test accounts')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-zinc-900 dark:text-white">
                        KCIC System Setup
                    </h2>
                    <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Create test accounts for all user roles
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                            Test Accounts to be Created:
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Admin:</span>
                                <span className="text-zinc-600 dark:text-zinc-400">admin@kcic.com / admin123</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Manager:</span>
                                <span className="text-zinc-600 dark:text-zinc-400">manager@kcic.com / manager123</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Worker:</span>
                                <span className="text-zinc-600 dark:text-zinc-400">worker@kcic.com / worker123</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Employee:</span>
                                <span className="text-zinc-600 dark:text-zinc-400">employee@kcic.com / employee123</span>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`rounded-md p-4 ${isSuccess ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {isSuccess ? (
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm whitespace-pre-line ${isSuccess ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            onClick={createTestAccounts}
                            disabled={loading}
                            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Create Test Accounts'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => router.push('/login')}
                            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}