import { ipcMain } from 'electron'
import { getDatabase } from '../db'
import crypto from 'crypto'

function generateId(): string {
  return crypto.randomUUID()
}

const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  conversations: new Set(['title', 'model']),
  notes: new Set(['title', 'content', 'folder', 'tags']),
  tasks: new Set(['title', 'description', 'status', 'priority', 'due_date', 'labels', 'sort_order']),
  bookmarks: new Set(['url', 'title', 'description', 'folder', 'tags', 'favicon']),
  calendar_events: new Set(['title', 'description', 'start_date', 'end_date', 'all_day', 'color', 'task_id'])
}

function sanitizeUpdateFields(
  table: string,
  data: Record<string, unknown>
): { fields: string; values: unknown[] } {
  const allowed = ALLOWED_COLUMNS[table]
  if (!allowed) throw new Error(`Unknown table: ${table}`)
  const keys = Object.keys(data).filter((k) => allowed.has(k))
  if (keys.length === 0) throw new Error('No valid fields to update')
  const fields = keys.map((k) => `${k} = ?`).join(', ')
  const values = keys.map((k) => data[k])
  return { fields, values }
}

export function registerDatabaseHandlers(): void {
  // --- Conversations ---
  ipcMain.handle('db:conversations:list', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC').all()
  })

  ipcMain.handle('db:conversations:create', (_, data: { title?: string; model?: string }) => {
    const db = getDatabase()
    const id = generateId()
    db.prepare('INSERT INTO conversations (id, title, model) VALUES (?, ?, ?)').run(
      id,
      data.title || 'New Chat',
      data.model || 'gpt-4o'
    )
    return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id)
  })

  ipcMain.handle('db:conversations:update', (_, id: string, data: Record<string, unknown>) => {
    const db = getDatabase()
    const { fields, values } = sanitizeUpdateFields('conversations', data)
    db.prepare(`UPDATE conversations SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(
      ...values,
      id
    )
    return db.prepare('SELECT * FROM conversations WHERE id = ?').get(id)
  })

  ipcMain.handle('db:conversations:delete', (_, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM conversations WHERE id = ?').run(id)
  })

  // --- Messages ---
  ipcMain.handle('db:messages:list', (_, conversationId: string) => {
    const db = getDatabase()
    return db
      .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
      .all(conversationId)
  })

  ipcMain.handle(
    'db:messages:create',
    (_, data: { conversation_id: string; role: string; content: string }) => {
      const db = getDatabase()
      const id = generateId()
      db.prepare(
        'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)'
      ).run(id, data.conversation_id, data.role, data.content)
      db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(
        data.conversation_id
      )
      return db.prepare('SELECT * FROM messages WHERE id = ?').get(id)
    }
  )

  // --- Notes ---
  ipcMain.handle('db:notes:list', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()
  })

  ipcMain.handle(
    'db:notes:create',
    (_, data: { title?: string; content?: string; folder?: string; tags?: string }) => {
      const db = getDatabase()
      const id = generateId()
      db.prepare(
        'INSERT INTO notes (id, title, content, folder, tags) VALUES (?, ?, ?, ?, ?)'
      ).run(id, data.title || 'Untitled', data.content || '', data.folder || 'General', data.tags || '[]')
      return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
    }
  )

  ipcMain.handle('db:notes:update', (_, id: string, data: Record<string, unknown>) => {
    const db = getDatabase()
    const { fields, values } = sanitizeUpdateFields('notes', data)
    db.prepare(`UPDATE notes SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(
      ...values,
      id
    )
    return db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  })

  ipcMain.handle('db:notes:delete', (_, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  })

  // --- Tasks ---
  ipcMain.handle('db:tasks:list', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC').all()
  })

  ipcMain.handle(
    'db:tasks:create',
    (
      _,
      data: {
        title: string
        description?: string
        status?: string
        priority?: string
        due_date?: string
        labels?: string
      }
    ) => {
      const db = getDatabase()
      const id = generateId()
      const maxOrder = (
        db.prepare('SELECT MAX(sort_order) as max FROM tasks').get() as { max: number | null }
      )?.max
      db.prepare(
        'INSERT INTO tasks (id, title, description, status, priority, due_date, labels, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        id,
        data.title,
        data.description || '',
        data.status || 'todo',
        data.priority || 'medium',
        data.due_date || null,
        data.labels || '[]',
        (maxOrder ?? -1) + 1
      )
      return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
    }
  )

  ipcMain.handle('db:tasks:update', (_, id: string, data: Record<string, unknown>) => {
    const db = getDatabase()
    const { fields, values } = sanitizeUpdateFields('tasks', data)
    db.prepare(`UPDATE tasks SET ${fields}, updated_at = datetime('now') WHERE id = ?`).run(
      ...values,
      id
    )
    return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  })

  ipcMain.handle('db:tasks:delete', (_, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  })

  // --- Bookmarks ---
  ipcMain.handle('db:bookmarks:list', () => {
    const db = getDatabase()
    return db.prepare('SELECT * FROM bookmarks ORDER BY created_at DESC').all()
  })

  ipcMain.handle(
    'db:bookmarks:create',
    (
      _,
      data: {
        url: string
        title: string
        description?: string
        folder?: string
        tags?: string
        favicon?: string
      }
    ) => {
      const db = getDatabase()
      const id = generateId()
      db.prepare(
        'INSERT INTO bookmarks (id, url, title, description, folder, tags, favicon) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        id,
        data.url,
        data.title,
        data.description || '',
        data.folder || 'General',
        data.tags || '[]',
        data.favicon || null
      )
      return db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id)
    }
  )

  ipcMain.handle('db:bookmarks:update', (_, id: string, data: Record<string, unknown>) => {
    const db = getDatabase()
    const { fields, values } = sanitizeUpdateFields('bookmarks', data)
    db.prepare(`UPDATE bookmarks SET ${fields} WHERE id = ?`).run(...values, id)
    return db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id)
  })

  ipcMain.handle('db:bookmarks:delete', (_, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id)
  })

  // --- Calendar Events ---
  ipcMain.handle('db:events:list', (_, month?: string) => {
    const db = getDatabase()
    if (month) {
      return db
        .prepare(
          "SELECT * FROM calendar_events WHERE strftime('%Y-%m', start_date) = ? ORDER BY start_date ASC"
        )
        .all(month)
    }
    return db.prepare('SELECT * FROM calendar_events ORDER BY start_date ASC').all()
  })

  ipcMain.handle(
    'db:events:create',
    (
      _,
      data: {
        title: string
        description?: string
        start_date: string
        end_date: string
        all_day?: boolean
        color?: string
        task_id?: string
      }
    ) => {
      const db = getDatabase()
      const id = generateId()
      db.prepare(
        'INSERT INTO calendar_events (id, title, description, start_date, end_date, all_day, color, task_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(
        id,
        data.title,
        data.description || '',
        data.start_date,
        data.end_date,
        data.all_day ? 1 : 0,
        data.color || '#3b82f6',
        data.task_id || null
      )
      return db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id)
    }
  )

  ipcMain.handle('db:events:update', (_, id: string, data: Record<string, unknown>) => {
    const db = getDatabase()
    const { fields, values } = sanitizeUpdateFields('calendar_events', data)
    db.prepare(`UPDATE calendar_events SET ${fields} WHERE id = ?`).run(...values, id)
    return db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id)
  })

  ipcMain.handle('db:events:delete', (_, id: string) => {
    const db = getDatabase()
    db.prepare('DELETE FROM calendar_events WHERE id = ?').run(id)
  })
}
