'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    users: {
        full_name: string
        email: string
    }
}

interface TicketCommentsProps {
    ticketId: string
}

export function TicketComments({ ticketId }: TicketCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()
    }, [ticketId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('ticket_comments')
            .select('*, users(full_name, email)')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })

        if (!error && data) {
            setComments(data as any)
        }
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setSubmitting(false)
            return
        }

        const { error } = await supabase
            .from('ticket_comments')
            .insert({
                ticket_id: ticketId,
                user_id: user.id,
                content: newComment.trim()
            } as { ticket_id: string; user_id: string; content: string })

        if (!error) {
            setNewComment('')
            await fetchComments()
        }
        setSubmitting(false)
    }

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Troubleshooting Comments
            </h3>

            {/* Comments List */}
            <div className="space-y-4 mb-6">
                {loading ? (
                    <div className="text-center py-4 text-zinc-500">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                        No comments yet. Add a comment to document troubleshooting steps.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {comment.users?.full_name || 'Unknown User'}
                                </span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment about troubleshooting steps..."
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg 
                             bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                             resize-none"
                    rows={3}
                    disabled={submitting}
                />
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={!newComment.trim() || submitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
