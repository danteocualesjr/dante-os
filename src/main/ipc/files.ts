import { ipcMain, shell } from 'electron'
import { readdir, stat, readFile } from 'fs/promises'
import { join, extname, basename } from 'path'
import { homedir } from 'os'

// Cap previews at 10 MB so opening a very large text or image file in the
// File Manager can't blow up the renderer by loading hundreds of MB into
// memory or, for images, blocking on a massive base64 encode.
const MAX_PREVIEW_BYTES = 10 * 1024 * 1024

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: string
  extension: string
}

export function registerFileHandlers(): void {
  ipcMain.handle('files:list', async (_, dirPath?: string) => {
    const targetPath = dirPath || homedir()
    const entries = await readdir(targetPath, { withFileTypes: true })
    const files: FileEntry[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      try {
        const fullPath = join(targetPath, entry.name)
        const stats = await stat(fullPath)
        files.push({
          name: entry.name,
          path: fullPath,
          isDirectory: entry.isDirectory(),
          size: stats.size,
          modified: stats.mtime.toISOString(),
          extension: entry.isDirectory() ? '' : extname(entry.name).slice(1)
        })
      } catch {
        // Skip files we can't access
      }
    }

    files.sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return { path: targetPath, files }
  })

  ipcMain.handle('files:read', async (_, filePath: string) => {
    const ext = extname(filePath).slice(1).toLowerCase()
    const textExtensions = [
      'txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'css', 'html',
      'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'sh', 'bash',
      'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'swift'
    ]
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico']

    const isText = textExtensions.includes(ext)
    const isImage = imageExtensions.includes(ext)

    if (!isText && !isImage) {
      return { type: 'unknown' as const, content: null, name: basename(filePath) }
    }

    try {
      const stats = await stat(filePath)
      if (stats.size > MAX_PREVIEW_BYTES) {
        return {
          type: 'text' as const,
          content: `File too large to preview (${(stats.size / (1024 * 1024)).toFixed(1)} MB).`,
          name: basename(filePath)
        }
      }
    } catch {
      return { type: 'unknown' as const, content: null, name: basename(filePath) }
    }

    if (isText) {
      const content = await readFile(filePath, 'utf-8')
      return { type: 'text' as const, content, name: basename(filePath) }
    }

    const buffer = await readFile(filePath)
    const base64 = buffer.toString('base64')
    const mime =
      ext === 'svg'
        ? 'image/svg+xml'
        : ext === 'ico'
        ? 'image/x-icon'
        : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    return {
      type: 'image' as const,
      content: `data:${mime};base64,${base64}`,
      name: basename(filePath)
    }
  })

  ipcMain.handle('files:open', async (_, filePath: string) => {
    await shell.openPath(filePath)
  })

  ipcMain.handle('files:openInFinder', async (_, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('files:getHome', () => {
    return homedir()
  })
}
