'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Star, X, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'

interface User {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
}

interface AssignTechniciansDialogProps {
    ticketId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    currentAssignees: Array<{ user_id: string; is_primary: boolean }>
    onSuccess?: () => void
}

export function AssignTechniciansDialog({
    ticketId,
    open,
    onOpenChange,
    currentAssignees,
    onSuccess
}: AssignTechniciansDialogProps) {
    const [technicians, setTechnicians] = useState<User[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [primaryId, setPrimaryId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    // Initialize selected technicians from current assignees
    useEffect(() => {
        if (open) {
            const assigneeIds = new Set(currentAssignees.map(a => a.user_id))
            setSelected(assigneeIds)

            const primary = currentAssignees.find(a => a.is_primary)
            setPrimaryId(primary?.user_id || null)
        }
    }, [open, currentAssignees])

    // Fetch available technicians
    useEffect(() => {
        async function fetchTechnicians() {
            if (!open) return

            setLoading(true)
            try {
                const res = await fetch('/api/users?role=technician')
                const data = await res.json()

                if (res.ok) {
                    setTechnicians(data.users || [])
                } else {
                    toast.error('Failed to load technicians')
                }
            } catch (error) {
                console.error('Error fetching technicians:', error)
                toast.error('Error loading technicians')
            } finally {
                setLoading(false)
            }
        }

        fetchTechnicians()
    }, [open])

    const toggleTechnician = (userId: string) => {
        const newSelected = new Set(selected)

        if (newSelected.has(userId)) {
            newSelected.delete(userId)
            // If removing primary, unset it
            if (primaryId === userId) {
                setPrimaryId(null)
            }
        } else {
            newSelected.add(userId)
            // If this is the first selection, make it primary
            if (newSelected.size === 1) {
                setPrimaryId(userId)
            }
        }

        setSelected(newSelected)
    }

    const handleSetPrimary = (userId: string) => {
        if (selected.has(userId)) {
            setPrimaryId(userId)
        }
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            const currentIds = new Set(currentAssignees.map(a => a.user_id))
            const selectedIds = Array.from(selected)

            // Find new assignments (not currently assigned)
            const toAdd = selectedIds.filter(id => !currentIds.has(id))

            // Find removed assignments
            const toRemove = currentAssignees
                .map(a => a.user_id)
                .filter(id => !selected.has(id))

            // Add new technicians
            for (const techId of toAdd) {
                const res = await fetch(`/api/tickets/${ticketId}/assignees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: techId,
                        is_primary: techId === primaryId
                    })
                })

                if (!res.ok) {
                    const error = await res.json()
                    throw new Error(error.error || 'Failed to assign technician')
                }
            }

            // Remove technicians
            for (const techId of toRemove) {
                const res = await fetch(`/api/tickets/${ticketId}/assignees/${techId}`, {
                    method: 'DELETE'
                })

                if (!res.ok) {
                    const error = await res.json()
                    console.error('Error removing technician:', error)
                }
            }

            // Update primary if changed (for existing assignees)
            const currentPrimary = currentAssignees.find(a => a.is_primary)
            if (primaryId && currentPrimary?.user_id !== primaryId && currentIds.has(primaryId)) {
                // Only update if new primary is an existing assignee (not a new one)
                await fetch(`/api/tickets/${ticketId}/assignees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: primaryId,
                        is_primary: true
                    })
                })
            }

            toast.success('Technicians updated successfully')
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving assignments:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update assignments')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UsersIcon className="h-5 w-5" />
                        Assign Technicians
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : technicians.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No technicians available
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground mb-4">
                                Select technicians to assign to this ticket. One must be marked as primary.
                            </div>

                            {technicians.map((tech) => {
                                const isSelected = selected.has(tech.id)
                                const isPrimary = primaryId === tech.id

                                return (
                                    <div
                                        key={tech.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${isSelected
                                            ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/20'
                                            : 'border-zinc-200 dark:border-zinc-700'
                                            }`}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleTechnician(tech.id)}
                                        />

                                        <Avatar className="h-10 w-10">
                                            {tech.avatar_url && (
                                                <AvatarImage src={tech.avatar_url} alt={tech.full_name} />
                                            )}
                                            <AvatarFallback>
                                                {tech.full_name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1">
                                            <p className="font-medium">{tech.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{tech.email}</p>
                                        </div>

                                        {isSelected && (
                                            <Button
                                                type="button"
                                                variant={isPrimary ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handleSetPrimary(tech.id)}
                                                className="gap-1"
                                            >
                                                <Star className={`h-3 w-3 ${isPrimary ? 'fill-current' : ''}`} />
                                                {isPrimary ? 'Primary' : 'Set Primary'}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        {selected.size} technician{selected.size !== 1 ? 's' : ''} selected
                        {primaryId && ` · ${technicians.find(t => t.id === primaryId)?.full_name} is primary`}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || selected.size === 0 || !primaryId}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
