'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Upload, FileText, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const TICKET_WORKFLOW = [
    { id: 'open', label: 'Open', color: 'text-blue-600 dark:text-blue-400' },
    { id: 'in_progress', label: 'In Progress', color: 'text-yellow-600 dark:text-yellow-400' },
    { id: 'on_escalation', label: 'On Escalation', color: 'text-orange-600 dark:text-orange-400' },
    { id: 'resolved', label: 'Resolved', color: 'text-green-600 dark:text-green-400' },
    { id: 'closed', label: 'Closed', color: 'text-zinc-600 dark:text-zinc-400' }
]

interface TicketProgressBarProps {
    currentStatus: string
    ticketId?: string
    isReporter?: boolean
}

interface Attachment {
    id: string
    file_name: string
    file_url: string
    file_size: number
    created_at: string
}

export function TicketProgressBar({ currentStatus, ticketId, isReporter = false }: TicketProgressBarProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const currentIndex = TICKET_WORKFLOW.findIndex(s => s.id === currentStatus)
    const supabase = createClient()

    useEffect(() => {
        if (ticketId && currentStatus === 'on_escalation') {
            fetchAttachments()
        }
    }, [ticketId, currentStatus])

    const fetchAttachments = async () => {
        if (!ticketId) return

        const { data, error } = await supabase
            .from('ticket_attachments')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setAttachments(data)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !ticketId) return

        setUploadError(null)

        // Validate file type
        if (file.type !== 'application/pdf') {
            setUploadError('Only PDF files are allowed')
            return
        }

        // Validate file size (1MB = 1048576 bytes)
        if (file.size > 1048576) {
            setUploadError('File size must be less than 1 MB')
            return
        }

        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setUploadError('User not authenticated')
                setUploading(false)
                return
            }

            // Upload to storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${ticketId}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('ticket-attachments')
                .upload(filePath, file)

            if (uploadError) {
                setUploadError(`Upload failed: ${uploadError.message}`)
                setUploading(false)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ticket-attachments')
                .getPublicUrl(filePath)

            // Save to database
            const { error: dbError } = await supabase
                .from('ticket_attachments')
                .insert({
                    ticket_id: ticketId,
                    uploaded_by: user.id,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_size: file.size
                })

            if (dbError) {
                setUploadError(`Database error: ${dbError.message}`)
                setUploading(false)
                return
            }

            // Refresh attachments list
            await fetchAttachments()
            setUploading(false)
        } catch (error) {
            setUploadError('An unexpected error occurred')
            setUploading(false)
        }
    }

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

            {/* File Upload Section - Only show when On Escalation and user is reporter */}
            {currentStatus === 'on_escalation' && isReporter && ticketId && (
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Supporting Document
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                        Please upload a supporting PDF document (max 1 MB)
                    </p>

                    {uploadError && (
                        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-red-600 dark:text-red-400">{uploadError}</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-3">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                            id={`file-upload-${ticketId}`}
                        />
                        <label htmlFor={`file-upload-${ticketId}`}>
                            <Button
                                type="button"
                                disabled={uploading}
                                className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                                asChild
                            >
                                <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? 'Uploading...' : 'Choose PDF File'}
                                </span>
                            </Button>
                        </label>
                    </div>

                    {/* Show existing attachments */}
                    {attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Uploaded Documents:</p>
                            {attachments.map((attachment) => (
                                <a
                                    key={attachment.id}
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <FileText className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-zinc-900 dark:text-white truncate">
                                            {attachment.file_name}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {(attachment.file_size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
