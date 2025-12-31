'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Upload, FileText, AlertCircle, Image as ImageIcon } from 'lucide-react'
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
    attachment_type: 'work_evidence' | 'vendor_request'
    created_at: string
}

export function TicketProgressBar({ currentStatus, ticketId, isReporter = false }: TicketProgressBarProps) {
    // Separate state for each upload type
    const [workEvidenceFiles, setWorkEvidenceFiles] = useState<Attachment[]>([])
    const [vendorRequestFiles, setVendorRequestFiles] = useState<Attachment[]>([])

    const [uploadingWork, setUploadingWork] = useState(false)
    const [uploadingVendor, setUploadingVendor] = useState(false)

    const [workUploadError, setWorkUploadError] = useState<string | null>(null)
    const [vendorUploadError, setVendorUploadError] = useState<string | null>(null)

    const currentIndex = TICKET_WORKFLOW.findIndex(s => s.id === currentStatus)
    const supabase = createClient()

    useEffect(() => {
        if (ticketId) {
            fetchAttachments()
        }
    }, [ticketId])

    const fetchAttachments = async () => {
        if (!ticketId) return

        // Fetch work evidence photos
        const { data: workData, error: workError } = await supabase
            .from('ticket_attachments')
            .select('*')
            .eq('ticket_id', ticketId)
            .eq('attachment_type', 'work_evidence')
            .order('created_at', { ascending: false })

        if (!workError && workData) {
            setWorkEvidenceFiles(workData)
        }

        // Fetch vendor request documents
        const { data: vendorData, error: vendorError } = await supabase
            .from('ticket_attachments')
            .select('*')
            .eq('ticket_id', ticketId)
            .eq('attachment_type', 'vendor_request')
            .order('created_at', { ascending: false })

        if (!vendorError && vendorData) {
            setVendorRequestFiles(vendorData)
        }
    }

    const handleWorkEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !ticketId) return

        setWorkUploadError(null)

        // Validate file type - Images only
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']

        if (!allowedTypes.includes(file.type.toLowerCase())) {
            setWorkUploadError('Only image files (.jpg, .jpeg, .png, .heic) are allowed')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5242880) {
            setWorkUploadError('File size must be less than 5 MB')
            return
        }

        setUploadingWork(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setWorkUploadError('User not authenticated')
                setUploadingWork(false)
                return
            }

            // Upload to work evidence bucket
            const fileExt = file.name.split('.').pop()
            const fileName = `${ticketId}_work_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('ticket-work-evidence')
                .upload(filePath, file)

            if (uploadError) {
                setWorkUploadError(`Upload failed: ${uploadError.message}`)
                setUploadingWork(false)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ticket-work-evidence')
                .getPublicUrl(filePath)

            // Save to database with attachment_type
            const { error: dbError } = await supabase
                .from('ticket_attachments')
                .insert({
                    ticket_id: ticketId,
                    uploaded_by: user.id,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    attachment_type: 'work_evidence'
                })

            if (dbError) {
                setWorkUploadError(`Database error: ${dbError.message}`)
                setUploadingWork(false)
                return
            }

            // Refresh attachments list
            await fetchAttachments()
            setUploadingWork(false)

            // Reset file input
            e.target.value = ''
        } catch (error) {
            setWorkUploadError('An unexpected error occurred')
            setUploadingWork(false)
        }
    }

    const handleVendorRequestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !ticketId) return

        setVendorUploadError(null)

        // Validate file type - Documents only
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]

        if (!allowedTypes.includes(file.type.toLowerCase())) {
            setVendorUploadError('Only PDF and Word documents are allowed')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5242880) {
            setVendorUploadError('File size must be less than 5 MB')
            return
        }

        setUploadingVendor(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setVendorUploadError('User not authenticated')
                setUploadingVendor(false)
                return
            }

            // Upload to vendor requests bucket
            const fileExt = file.name.split('.').pop()
            const fileName = `${ticketId}_vendor_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('ticket-vendor-requests')
                .upload(filePath, file)

            if (uploadError) {
                setVendorUploadError(`Upload failed: ${uploadError.message}`)
                setUploadingVendor(false)
                return
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ticket-vendor-requests')
                .getPublicUrl(filePath)

            // Save to database with attachment_type
            const { error: dbError } = await supabase
                .from('ticket_attachments')
                .insert({
                    ticket_id: ticketId,
                    uploaded_by: user.id,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    attachment_type: 'vendor_request'
                })

            if (dbError) {
                setVendorUploadError(`Database error: ${dbError.message}`)
                setUploadingVendor(false)
                return
            }

            // Refresh attachments list
            await fetchAttachments()
            setUploadingVendor(false)

            // Reset file input
            e.target.value = ''
        } catch (error) {
            setVendorUploadError('An unexpected error occurred')
            setUploadingVendor(false)
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
                        const isCompleted = index < currentIndex
                        const isCurrent = step.id === currentStatus

                        return (
                            <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / TICKET_WORKFLOW.length}%` }}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${isCurrent
                                        ? 'bg-indigo-600 border-indigo-600'
                                        : isCompleted
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                    ) : (
                                        <Circle className={`h-6 w-6 ${isCurrent ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                    )}
                                </div>
                                <div className="mt-2 text-center">
                                    <p className={`text-xs ${isCurrent
                                        ? step.color + ' font-semibold'
                                        : isCompleted
                                            ? 'text-zinc-900 dark:text-white'
                                            : 'text-zinc-500 dark:text-zinc-400'
                                        }`}>
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

            {/* SECTION 1: Work Evidence Photo Upload - ALWAYS VISIBLE */}
            {ticketId && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Work Evidence Photo Upload
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                        Upload photos to document work progress (Images: .jpg, .png, .heic | Max: 5MB)
                    </p>

                    {workUploadError && (
                        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-red-600 dark:text-red-400">{workUploadError}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.heic,image/jpeg,image/png,image/heic"
                            onChange={handleWorkEvidenceUpload}
                            disabled={uploadingWork}
                            className="hidden"
                            id={`work-evidence-upload-${ticketId}`}
                        />
                        <label htmlFor={`work-evidence-upload-${ticketId}`} className="flex-1">
                            <Button
                                type="button"
                                disabled={uploadingWork}
                                variant="outline"
                                className="w-full cursor-pointer"
                                asChild
                            >
                                <span>
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    {uploadingWork ? 'Uploading...' : 'Choose Image'}
                                </span>
                            </Button>
                        </label>
                    </div>

                    {/* Display Work Evidence Photos */}
                    {workEvidenceFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Uploaded Photos ({workEvidenceFiles.length})
                            </p>
                            <div className="space-y-2">
                                {workEvidenceFiles.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-900">
                                            <img
                                                src={attachment.file_url}
                                                alt={attachment.file_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                {attachment.file_name}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {(attachment.file_size / 1024).toFixed(1)} KB • {new Date(attachment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: Vendor Work Request Upload - ONLY ON ESCALATION */}
            {currentStatus === 'on_escalation' && isReporter && ticketId && (
                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        Vendor Work Request Upload
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                        Upload official work request document for vendor (PDF or Word | Max: 5MB)
                    </p>

                    {vendorUploadError && (
                        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-red-600 dark:text-red-400">{vendorUploadError}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleVendorRequestUpload}
                            disabled={uploadingVendor}
                            className="hidden"
                            id={`vendor-request-upload-${ticketId}`}
                        />
                        <label htmlFor={`vendor-request-upload-${ticketId}`} className="flex-1">
                            <Button
                                type="button"
                                disabled={uploadingVendor}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                                asChild
                            >
                                <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploadingVendor ? 'Uploading...' : 'Choose Document'}
                                </span>
                            </Button>
                        </label>
                    </div>

                    {/* Display Vendor Request Documents */}
                    {vendorRequestFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                Uploaded Documents ({vendorRequestFiles.length})
                            </p>
                            <div className="space-y-2">
                                {vendorRequestFiles.map((attachment) => (
                                    <a
                                        key={attachment.id}
                                        href={attachment.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                                            <FileText className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                {attachment.file_name}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {(attachment.file_size / 1024).toFixed(1)} KB • {new Date(attachment.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
