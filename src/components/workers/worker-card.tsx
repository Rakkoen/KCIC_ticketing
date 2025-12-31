import Link from 'next/link'
import { Database } from '@/types/database.types'
import { AvailabilityBadge } from './availability-badge'
import { Mail, Phone, Ticket, Clock } from 'lucide-react'

type Worker = Database['public']['Tables']['users']['Row'] & {
    tickets_assigned?: number
    tickets_in_progress?: number
}

interface WorkerCardProps {
    worker: Worker
}

export function WorkerCard({ worker }: WorkerCardProps) {
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            case 'manager':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            case 'worker':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            default:
                return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300'
        }
    }

    return (
        <Link href={`/workers/${worker.id}`} className="block">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            {worker.avatar_url ? (
                                <img
                                    src={worker.avatar_url}
                                    alt={worker.full_name || worker.email}
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                                        {(worker.full_name || worker.email).charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1">
                                <AvailabilityBadge status={worker.availability_status} />
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {worker.full_name || 'No name'}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {worker.email}
                            </p>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(worker.role)}`}>
                        {worker.role}
                    </span>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-2 mb-4 text-sm">
                    {worker.phone && (
                        <a
                            href={`tel:${worker.phone}`}
                            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="h-4 w-4" />
                            {worker.phone}
                        </a>
                    )}
                    <a
                        href={`mailto:${worker.email}`}
                        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Mail className="h-4 w-4" />
                        {worker.email}
                    </a>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Ticket className="h-4 w-4 text-zinc-400" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Tickets</span>
                        </div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {worker.tickets_assigned || 0}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-4 w-4 text-zinc-400" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Active</span>
                        </div>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {worker.tickets_in_progress || 0}
                        </p>
                    </div>
                </div>

                {/* Last Active */}
                {worker.last_active_at && (
                    <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                        Last active: {new Date(worker.last_active_at).toLocaleString()}
                    </div>
                )}
            </div>
        </Link>
    )
}
