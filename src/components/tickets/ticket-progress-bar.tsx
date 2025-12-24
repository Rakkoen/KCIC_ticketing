'use client'

import { CheckCircle2, Circle } from 'lucide-react'

const TICKET_WORKFLOW = [
    { id: 'open', label: 'Open', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'in_progress', label: 'In Progress', color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'on_escalation', label: 'On Escalation', color: 'text-orange-600 dark:text-orange-400' },
    { id: 'resolved', label: 'Resolved', color: 'text-green-600 dark:text-green-400' },
    { id: 'closed', label: 'Closed', color: 'text-zinc-600 dark:text-zinc-400' }
]

interface TicketProgressBarProps {
    currentStatus: string
}

export function TicketProgressBar({ currentStatus }: TicketProgressBarProps) {
    const currentIndex = TICKET_WORKFLOW.findIndex(s => s.id === currentStatus)

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                Ticket Progress
            </h3>

            <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-700">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{
                            width: currentIndex >= 0
                                ? `${(currentIndex / (TICKET_WORKFLOW.length - 1)) * 100}%`
                                : '0%'
                        }}
                    />
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                    {TICKET_WORKFLOW.map((step, index) => {
                        const isCompleted = index <= currentIndex
                        const isCurrent = index === currentIndex

                        return (
                            <div key={step.id} className="flex flex-col items-center" style={{ zIndex: 10 }}>
                                {/* Circle */}
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    transition-all duration-300
                                    ${isCompleted
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 text-zinc-400'
                                    }
                                    ${isCurrent ? 'ring-4 ring-indigo-200 dark:ring-indigo-900' : ''}
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <Circle className="h-5 w-5" />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="mt-3 text-center">
                                    <p className={`
                                        text-xs font-medium
                                        ${isCurrent
                                            ? step.color + ' font-semibold'
                                            : isCompleted
                                                ? 'text-zinc-900 dark:text-white'
                                                : 'text-zinc-500 dark:text-zinc-400'
                                        }
                                    `}>
                                        {step.label}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Current Status Info */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-900 dark:text-white">Current Status:</span>{' '}
                    <span className={TICKET_WORKFLOW.find(s => s.id === currentStatus)?.color || ''}>
                        {TICKET_WORKFLOW.find(s => s.id === currentStatus)?.label || 'Unknown'}
                    </span>
                </p>
            </div>
        </div>
    )
}
