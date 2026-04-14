import { useState, useEffect, useCallback } from 'react'
import {
  Folder,
  File,
  ChevronRight,
  ArrowUp,
  Home,
  Grid,
  List,
  Eye,
  ExternalLink,
  X,
  Image,
  FileText,
  FileCode,
  FileJson,
  Music,
  Video,
  Archive
} from 'lucide-react'
import { dirname } from '../../lib/utils'

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: string
  extension: string
}

type ViewMode = 'grid' | 'list'

const EXT_ICONS: Record<string, React.ElementType> = {
  png: Image, jpg: Image, jpeg: Image, gif: Image, webp: Image, svg: Image, bmp: Image,
  txt: FileText, md: FileText, doc: FileText, docx: FileText, pdf: FileText,
  js: FileCode, ts: FileCode, tsx: FileCode, jsx: FileCode, py: FileCode, rb: FileCode,
  go: FileCode, rs: FileCode, java: FileCode, c: FileCode, cpp: FileCode, swift: FileCode,
  json: FileJson, yaml: FileJson, yml: FileJson, toml: FileJson,
  mp3: Music, wav: Music, flac: Music, aac: Music,
  mp4: Video, mov: Video, avi: Video, mkv: Video, webm: Video,
  zip: Archive, tar: Archive, gz: Archive, rar: Archive, '7z': Archive
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [preview, setPreview] = useState<{ type: string; content: string; name: string } | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([])

  const loadDirectory = useCallback(async (path?: string) => {
    const result = (await window.api.files.list(path)) as { path: string; files: FileEntry[] }
    setCurrentPath(result.path)
    setFiles(result.files)

    const parts = result.path.split('/').filter(Boolean)
    setBreadcrumbs(parts)
  }, [])

  useEffect(() => {
    loadDirectory()
  }, [loadDirectory])

  const navigateTo = (path: string) => loadDirectory(path)

  const navigateUp = () => {
    const parent = dirname(currentPath)
    if (parent !== currentPath) loadDirectory(parent)
  }

  const goHome = async () => {
    const home = await window.api.files.getHome()
    loadDirectory(home)
  }

  const handleClick = (file: FileEntry) => {
    if (file.isDirectory) {
      navigateTo(file.path)
    } else {
      previewFile(file)
    }
  }

  const previewFile = async (file: FileEntry) => {
    const result = await window.api.files.read(file.path)
    if (result.type !== 'unknown') {
      setPreview(result)
    } else {
      window.api.files.open(file.path)
    }
  }

  const getIcon = (file: FileEntry) => {
    if (file.isDirectory) return Folder
    return EXT_ICONS[file.extension.toLowerCase()] || File
  }

  const breadcrumbPath = (index: number) => '/' + breadcrumbs.slice(0, index + 1).join('/')

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <button
          onClick={navigateUp}
          className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
          title="Go up"
        >
          <ArrowUp size={16} className="text-text-secondary" />
        </button>
        <button
          onClick={goHome}
          className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
          title="Home"
        >
          <Home size={16} className="text-text-secondary" />
        </button>

        <div className="flex-1 flex items-center gap-1 px-3 py-1.5 bg-surface-secondary rounded-lg text-[13px] overflow-x-auto">
          <span
            className="text-text-tertiary hover:text-accent cursor-pointer shrink-0"
            onClick={() => navigateTo('/')}
          >
            /
          </span>
          {breadcrumbs.map((part, i) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              <ChevronRight size={12} className="text-text-tertiary" />
              <span
                className={`cursor-pointer transition-colors ${
                  i === breadcrumbs.length - 1
                    ? 'text-text-primary font-medium'
                    : 'text-text-secondary hover:text-accent'
                }`}
                onClick={() => navigateTo(breadcrumbPath(i))}
              >
                {part}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface-tertiary' : 'hover:bg-surface-secondary'}`}
          >
            <Grid size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-surface-tertiary' : 'hover:bg-surface-secondary'}`}
          >
            <List size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* File listing */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
            {files.map((file) => {
              const Icon = getIcon(file)
              return (
                <div
                  key={file.path}
                  onDoubleClick={() => handleClick(file)}
                  onClick={() => handleClick(file)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-secondary cursor-pointer transition-colors group"
                >
                  <Icon
                    size={40}
                    strokeWidth={1.2}
                    className={file.isDirectory ? 'text-accent' : 'text-text-secondary'}
                  />
                  <span className="text-[12px] text-text-primary text-center leading-tight line-clamp-2 w-full">
                    {file.name}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[12px] text-text-tertiary border-b border-border">
                <th className="text-left py-2 px-3 font-medium">Name</th>
                <th className="text-left py-2 px-3 font-medium w-[100px]">Size</th>
                <th className="text-left py-2 px-3 font-medium w-[160px]">Modified</th>
                <th className="py-2 px-3 w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const Icon = getIcon(file)
                return (
                  <tr
                    key={file.path}
                    onClick={() => handleClick(file)}
                    className="hover:bg-surface-secondary/60 cursor-pointer group transition-colors"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className={file.isDirectory ? 'text-accent' : 'text-text-secondary'}
                        />
                        <span className="text-[13px] text-text-primary">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-text-secondary">
                      {file.isDirectory ? '—' : formatSize(file.size)}
                    </td>
                    <td className="py-2 px-3 text-[12px] text-text-secondary">
                      {new Date(file.modified).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!file.isDirectory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              previewFile(file)
                            }}
                            className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                          >
                            <Eye size={14} className="text-text-secondary" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.api.files.openInFinder(file.path)
                          }}
                          className="p-1 hover:bg-surface-tertiary rounded transition-colors"
                        >
                          <ExternalLink size={14} className="text-text-secondary" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {files.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
            <Folder size={48} strokeWidth={1.2} className="mb-4 text-text-tertiary/50" />
            <p className="text-[13px]">This folder is empty</p>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl border border-border shadow-xl max-w-[800px] max-h-[80vh] w-full flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-[13px] font-medium text-text-primary">{preview.name}</span>
              <button
                onClick={() => setPreview(null)}
                className="p-1 hover:bg-surface-tertiary rounded-lg transition-colors"
              >
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {preview.type === 'image' ? (
                <img src={preview.content} alt={preview.name} className="max-w-full h-auto mx-auto" />
              ) : (
                <pre className="text-[13px] text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
                  {preview.content}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
