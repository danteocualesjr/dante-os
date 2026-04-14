import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Search, FolderOpen, Tag } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface Note {
  id: string
  title: string
  content: string
  folder: string
  tags: string
  created_at: string
  updated_at: string
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' })
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none dark:prose-invert outline-none min-h-[300px] px-6 py-4'
      }
    },
    onUpdate: ({ editor }) => {
      if (activeNote) {
        const content = editor.getHTML()
        window.api.notes.update(activeNote.id, { content })
        setActiveNote((prev) => (prev ? { ...prev, content } : null))
        setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? { ...n, content } : n)))
      }
    }
  })

  const loadNotes = useCallback(async () => {
    const data = (await window.api.notes.list()) as Note[]
    setNotes(data)
  }, [])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  useEffect(() => {
    if (activeNote && editor) {
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '')
      }
    }
  }, [activeNote?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const createNote = async () => {
    const note = (await window.api.notes.create({
      folder: selectedFolder || 'General'
    })) as Note
    setNotes((prev) => [note, ...prev])
    setActiveNote(note)
  }

  const deleteNote = async (id: string) => {
    await window.api.notes.delete(id)
    if (activeNote?.id === id) {
      setActiveNote(null)
      editor?.commands.setContent('')
    }
    loadNotes()
  }

  const updateTitle = async (id: string, title: string) => {
    await window.api.notes.update(id, { title })
    setActiveNote((prev) => (prev?.id === id ? { ...prev, title } : prev))
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)))
  }

  const folders = [...new Set(notes.map((n) => n.folder))]
  const filtered = notes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = !selectedFolder || n.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="h-full flex">
      {/* Notes list */}
      <div className="w-[280px] border-r border-border flex flex-col bg-surface-secondary/50">
        <div className="p-3 space-y-2 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={createNote}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Folders */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                !selectedFolder ? 'bg-accent text-white' : 'bg-surface-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f === selectedFolder ? null : f)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedFolder === f ? 'bg-accent text-white' : 'bg-surface-tertiary text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filtered.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                activeNote?.id === note.id
                  ? 'bg-accent/10'
                  : 'hover:bg-surface-tertiary/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-text-primary truncate">
                  {note.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(note.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <FolderOpen size={10} />
                  {note.folder}
                </span>
                {(() => {
                  try {
                    const parsed = JSON.parse(note.tags)
                    return parsed.length > 0 ? (
                      <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                        <Tag size={10} />
                        {parsed.length}
                      </span>
                    ) : null
                  } catch {
                    return null
                  }
                })()}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-text-tertiary text-[13px] py-8">No notes found</p>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {activeNote ? (
          <>
            <div className="px-6 pt-4 pb-2 border-b border-border">
              <input
                value={activeNote.title}
                onChange={(e) => updateTitle(activeNote.id, e.target.value)}
                className="text-xl font-semibold bg-transparent outline-none w-full text-text-primary placeholder-text-tertiary"
                placeholder="Note title..."
              />
              <div className="flex items-center gap-3 mt-2 text-[12px] text-text-tertiary">
                <span>
                  {new Date(activeNote.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <FolderOpen size={11} />
                  {activeNote.folder}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
            <StickyNote size={48} strokeWidth={1.2} className="mb-4 text-text-tertiary/50" />
            <p className="text-lg font-medium text-text-secondary">Select or create a note</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StickyNote(props: React.SVGProps<SVGSVGElement> & { size: number; strokeWidth: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={props.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="M15 3v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}
