'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { ArticleCard } from '@/components/kb/article-card'
import { ArticleSearch } from '@/components/kb/article-search'
import { Plus, BookOpen, Grid, List as ListIcon } from 'lucide-react'
import Link from 'next/link'

type Article = Database['public']['Tables']['kb_articles']['Row'] & {
    category?: {
        name: string
        slug: string
    } | null
    author?: {
        full_name: string | null
    } | null
}

type Category = Database['public']['Tables']['kb_categories']['Row']

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState<Article[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch categories
            const { data: categoriesData } = await supabase
                .from('kb_categories')
                .select('*')
                .order('order_index')

            setCategories(categoriesData || [])

            // Fetch articles
            let query = supabase
                .from('kb_articles')
                .select(`
                    *,
                    category:kb_categories(name, slug),
                    author:users(full_name)
                `)
                .eq('status', 'published')
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })

            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory)
            }

            const { data: articlesData } = await query

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setArticles(articlesData as any || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const featuredArticles = articles.filter(a => a.is_featured)
    const regularArticles = articles.filter(a => !a.is_featured)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Knowledge Base</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Browse articles and documentation
                    </p>
                </div>
                <Link
                    href="/knowledge-base/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Article
                </Link>
            </div>

            {/* Search */}
            <ArticleSearch />

            {/* Categories Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === ''
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                >
                    All Categories
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-end">
                <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-700 p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded ${viewMode === 'grid'
                            ? 'bg-zinc-200 dark:bg-zinc-700'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <Grid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded ${viewMode === 'list'
                            ? 'bg-zinc-200 dark:bg-zinc-700'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                    >
                        <ListIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-yellow-500" />
                        Featured Articles
                    </h2>
                    <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                        {featuredArticles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Articles */}
            <div className="space-y-4">
                {featuredArticles.length > 0 && (
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        All Articles
                    </h2>
                )}
                {regularArticles.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                        {regularArticles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                        <BookOpen className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No articles found</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {selectedCategory ? 'Try selecting a different category' : 'Get started by creating your first article'}
                        </p>
                        {!selectedCategory && (
                            <div className="mt-6">
                                <Link
                                    href="/knowledge-base/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    New Article
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
