import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Search,
  ExternalLink,
  FolderOpen,
  Globe,
  X,
  Tag
} from 'lucide-react'

interface Bookmark {
  id: string
  url: string
  title: string
  description: string
  folder: string
  tags: string
  favicon: string | null
  created_at: string
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newBookmark, setNewBookmark] = useState({
    url: '',
    title: '',
    description: '',
    folder: 'General',
    tags: ''
  })

  const loadBookmarks = useCallback(async () => {
    const data = (await window.api.bookmarks.list()) as Bookmark[]
    setBookmarks(data)
  }, [])

  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  const createBookmark = async () => {
    if (!newBookmark.url.trim() || !newBookmark.title.trim()) return

    const faviconUrl = (() => {
      try {
        const u = new URL(newBookmark.url)
        return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`
      } catch {
        return undefined
      }
    })()

    await window.api.bookmarks.create({
      url: newBookmark.url.trim(),
      title: newBookmark.title.trim(),
      description: newBookmark.description,
      folder: newBookmark.folder || 'General',
      tags: JSON.stringify(
        newBookmark.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      ),
      favicon: faviconUrl
    })

    setNewBookmark({ url: '', title: '', description: '', folder: 'General', tags: '' })
    setShowCreate(false)
    loadBookmarks()
  }

  const deleteBookmark = async (id: string) => {
    await window.api.bookmarks.delete(id)
    loadBookmarks()
  }

  const folders = [...new Set(bookmarks.map((b) => b.folder))]
  const filtered = bookmarks.filter((b) => {
    const matchesSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = !selectedFolder || b.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          Add Bookmark
        </button>
      </div>

      {/* Folders */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              !selectedFolder
                ? 'bg-accent text-white'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
            }`}
          >
            All ({bookmarks.length})
          </button>
          {folders.map((f) => {
            const count = bookmarks.filter((b) => b.folder === f).length
            return (
              <button
                key={f}
                onClick={() => setSelectedFolder(f === selectedFolder ? null : f)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                  selectedFolder === f
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                <FolderOpen size={12} />
                {f} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="space-y-3 max-w-[600px]">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newBookmark.url}
                onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                placeholder="URL..."
                className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                autoFocus
              />
              <input
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                placeholder="Title..."
                className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
              />
            </div>
            <input
              value={newBookmark.description}
              onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
              placeholder="Description (optional)..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newBookmark.folder}
                onChange={(e) => setNewBookmark({ ...newBookmark, folder: e.target.value })}
                placeholder="Folder..."
                className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
              />
              <input
                value={newBookmark.tags}
                onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                placeholder="Tags (comma separated)..."
                className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createBookmark}
                disabled={!newBookmark.url.trim() || !newBookmark.title.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {filtered.map((bookmark) => {
            const tags: string[] = (() => {
              try {
                return JSON.parse(bookmark.tags)
              } catch {
                return []
              }
            })()

            return (
              <div
                key={bookmark.id}
                className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  {bookmark.favicon ? (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="w-6 h-6 rounded shrink-0 mt-0.5"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <Globe size={20} className="text-text-tertiary shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] font-medium text-text-primary hover:text-accent transition-colors truncate"
                      >
                        {bookmark.title}
                      </a>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                        >
                          <ExternalLink size={14} className="text-text-secondary" />
                        </a>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="p-1 hover:text-danger transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[12px] text-text-tertiary truncate mt-0.5">{bookmark.url}</p>
                    {bookmark.description && (
                      <p className="text-[12px] text-text-secondary mt-1 line-clamp-2">
                        {bookmark.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                        <FolderOpen size={10} />
                        {bookmark.folder}
                      </span>
                      {tags.length > 0 && (
                        <div className="flex gap-1">
                          {tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-text-secondary"
                            >
                              <Tag size={8} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
            <Globe size={48} strokeWidth={1.2} className="mb-4 text-text-tertiary/50" />
            <p className="text-lg font-medium text-text-secondary">No bookmarks yet</p>
            <p className="text-[13px] mt-1">Click "Add Bookmark" to save your first link.</p>
          </div>
        )}
      </div>
    </div>
  )
}
