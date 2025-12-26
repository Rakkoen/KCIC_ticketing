'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Quote,
    Code,
    Undo,
    Redo,
    Link as LinkIcon
} from 'lucide-react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 hover:text-indigo-500 underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
            },
        },
    })

    if (!editor) {
        return null
    }

    const addLink = () => {
        const url = window.prompt('Enter URL')
        if (url) {
            editor.chain().focus().setLink({ href: url }).run()
        }
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    return (
        <div className="border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
            {/* Toolbar */}
            <div className="border-b border-zinc-300 dark:border-zinc-700 p-2 flex flex-wrap gap-1 bg-zinc-50 dark:bg-zinc-800">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('bold') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('italic') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('bulletList') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('orderedList') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('blockquote') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <Quote className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('codeBlock') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <Code className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                <button
                    onClick={addLink}
                    className={`p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${editor.isActive('link') ? 'bg-zinc-300 dark:bg-zinc-600' : ''
                        }`}
                    type="button"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    type="button"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50"
                    type="button"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    )
}
