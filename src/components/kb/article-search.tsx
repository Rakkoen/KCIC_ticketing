'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Search, X } from 'lucide-react'
import Link from 'next/link'

type Article = Database['public']['Tables']['kb_articles']['Row']

export function ArticleSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Article[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const searchArticles = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setLoading(true)
            try {
                const { data, error } = await supabase
                    .from('kb_articles')
                    .select('*')
                    .eq('status', 'published')
                    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
                    .limit(5)

                if (error) throw error
                setResults(data || [])
                setShowResults(true)
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(searchArticles, 300)
        return () => clearTimeout(debounce)
    }, [query])

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search knowledge base..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    className="w-full pl-10 pr-10 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('')
                            setResults([])
                            setShowResults(false)
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && query.length >= 2 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-zinc-500">
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/knowledge-base/${article.slug}`}
                                    className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                                    onClick={() => {
                                        setShowResults(false)
                                        setQuery('')
                                    }}
                                >
                                    <div className="font-medium text-zinc-900 dark:text-white">
                                        {article.title}
                                    </div>
                                    {article.excerpt && (
                                        <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                            {article.excerpt}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-zinc-500">
                            No articles found
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {showResults && query.length >= 2 && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowResults(false)}
                />
            )}
        </div>
    )
}
