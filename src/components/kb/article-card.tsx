import Link from 'next/link'
import { Database } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Eye, Calendar, User } from 'lucide-react'

type Article = Database['public']['Tables']['kb_articles']['Row'] & {
    category?: {
        name: string
        slug: string
    } | null
    author?: {
        full_name: string | null
    } | null
}

interface ArticleCardProps {
    article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'success'
            case 'draft':
                return 'secondary'
            case 'archived':
                return 'default'
            default:
                return 'default'
        }
    }

    return (
        <Link
            href={`/knowledge-base/${article.slug}`}
            className="block bg-white dark:bg-zinc-800 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {article.is_featured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Featured
                            </span>
                        )}
                        <Badge variant={getStatusColor(article.status) as any}>
                            {article.status}
                        </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                        {article.title}
                    </h3>
                    {article.excerpt && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            {article.excerpt}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {article.category && (
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {article.category.name}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.view_count} views
                </span>
                <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.created_at).toLocaleDateString()}
                </span>
                {article.author && (
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author.full_name}
                    </span>
                )}
            </div>

            {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        >
                            #{tag}
                        </span>
                    ))}
                    {article.tags.length > 3 && (
                        <span className="text-xs text-zinc-500">+{article.tags.length - 3} more</span>
                    )}
                </div>
            )}
        </Link>
    )
}
