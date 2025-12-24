'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
    id: string
    content: string
    is_internal: boolean
    created_at: string
    user?: {
        full_name: string | null
        email: string
        role: string
    }
}

interface CommentFeedProps {
    ticketId: string
}

export function CommentFeed({ ticketId }: CommentFeedProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()

        // Subscribe to new comments
        const channel = supabase
            .channel(`ticket-comments-${ticketId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ticket_comments',
                    filter: `ticket_id=eq.${ticketId}`
                },
                () => {
                    fetchComments()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [ticketId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('ticket_comments')
            .select(`
                *,
                user:users(full_name, email, role)
            `)
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
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('ticket_comments')
                .insert({
                    ticket_id: ticketId,
                    user_id: user.id,
                    content: newComment,
                    is_internal: isInternal
                })

            if (!error) {
                setNewComment('')
                setIsInternal(false)
                fetchComments()
            }
        } catch (error) {
            console.error('Error posting comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-zinc-500" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-zinc-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                        No comments yet. Be the first to comment!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className={`p-4 rounded-lg border ${comment.is_internal
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {comment.user?.full_name || comment.user?.email || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        {comment.is_internal && (
                                            <span className="ml-2 px-2 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400">
                                                Internal
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                />
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Internal note (not visible to customers)
                    </label>
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Post Comment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
