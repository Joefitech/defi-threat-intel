'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { supabase } from '@/lib/supabase'

export default function RichEditor({ onChange }: { onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: '<p>Start writing your DeFi threat intelligence research here...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[350px] p-4 bg-slate-900 border border-slate-800 rounded-md focus:outline-none text-slate-100',
      },
    },
  })

  // Handles uploading JPEG/PNG diagrams to Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `diagrams/${fileName}`

    const { error } = await supabase.storage
      .from('threat-assets')
      .upload(filePath, file)

    if (error) {
      alert('Error uploading image: ' + error.message)
      return
    }

    const { data } = supabase.storage
      .from('threat-assets')
      .getPublicUrl(filePath)

    editor.chain().focus().setImage({ src: data.publicUrl }).run()
  }

  if (!editor) return null

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-950 rounded border border-slate-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-xs rounded font-bold transition-colors ${editor.isActive('bold') ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-xs rounded italic transition-colors ${editor.isActive('italic') ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 text-xs rounded underline transition-colors ${editor.isActive('underline') ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          H2 Header
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 text-xs rounded font-mono transition-colors ${editor.isActive('codeBlock') ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
        >
          Code Block
        </button>

        <label className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 cursor-pointer text-white font-semibold transition-colors">
          + Insert Diagram (JPEG/PNG)
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Text Area */}
      <EditorContent editor={editor} />
    </div>
  )
}