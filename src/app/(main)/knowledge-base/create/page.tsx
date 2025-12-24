'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { RichTextEditor } from '@/components/kb/rich-text-editor'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'

type Category = Database['public']['Tables']['kb_categories']['Row']

export default function CreateArticlePage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [tags, setTags] = useState('')
    const [status, setStatus] = useState<'draft' | 'published'>('draft')
    const [isFeatured, setIsFeatured] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchCategories()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('kb_categories')
            .select('*')
            .order('order_index')

        setCategories(data || [])
    }

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const slug = generateSlug(title)
            const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t)

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { data, error } = await supabase
                .from('kb_articles')
                .insert({
                    title,
                    slug,
                    content,
                    excerpt: excerpt || null,
                    category_id: categoryId || null,
                    tags: tagsArray,
                    author_id: user.id,
                    status,
                    is_featured: isFeatured
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)
                .select()
                .single()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const articleData = data as any
            if (error) throw error

            router.push(`/knowledge-base/${articleData.slug}`)
            router.refresh()
        } catch (error) {
            console.error('Error creating article:', error)
            alert('Failed to create article. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create New Article</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Write a new knowledge base article
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        placeholder="How to..."
                    />
                </div>

                {/* Excerpt */}
                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Excerpt
                    </label>
                    <textarea
                        id="excerpt"
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        placeholder="Brief summary of the article..."
                    />
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="">No category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                            placeholder="tag1, tag2, tag3"
                        />
                        <p className="mt-1 text-xs text-zinc-500">Separate tags with commas</p>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Content *
                    </label>
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your article content here..."
                    />
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                            className="block w-full rounded-md border-zinc-300 dark:border-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-3 py-2 border"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>

                    <div className="flex items-center pt-8">
                        <input
                            type="checkbox"
                            id="featured"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-zinc-700 dark:text-zinc-300">
                            Mark as featured article
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-sm text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !title || !content}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Create Article
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
