import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Eye, Calendar, User, BookOpen, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'

export default async function ArticleViewPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: article, error } = await supabase
        .from('kb_articles')
        .select(`
            *,
            category:kb_categories(name, slug),
            author:users(full_name, email)
        `)
        .eq('slug', slug)
        .single()

    if (error || !article) {
        notFound()
    }

    // Increment view count
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await supabase.rpc('increment_article_views', { article_id: article.id })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const articleData = article as any

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Link
                href="/knowledge-base"
                className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge Base
            </Link>

            {/* Article Header */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                    {articleData.is_featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Featured
                        </span>
                    )}
                    <Badge variant="success">{articleData.status}</Badge>
                </div>

                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
                    {articleData.title}
                </h1>

                {articleData.excerpt && (
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
                        {articleData.excerpt}
                    </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    {articleData.category && (
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {articleData.category.name}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {articleData.view_count + 1} views
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(articleData.created_at).toLocaleDateString()}
                    </span>
                    {articleData.author && (
                        <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {articleData.author.full_name || articleData.author.email}
                        </span>
                    )}
                </div>

                {/* Tags */}
                {articleData.tags && articleData.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                        <Tag className="h-4 w-4 text-zinc-400" />
                        {articleData.tags.map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Article Content */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 border border-zinc-200 dark:border-zinc-700">
                <div
                    className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: articleData.content }}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6">
                <Link
                    href="/knowledge-base"
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                    ← Back to all articles
                </Link>
                <Link
                    href={`/knowledge-base/edit/${articleData.id}`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                    Edit article →
                </Link>
            </div>
        </div>
    )
}
