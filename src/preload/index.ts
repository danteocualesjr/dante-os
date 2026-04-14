import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // --- Conversations ---
  conversations: {
    list: () => ipcRenderer.invoke('db:conversations:list'),
    create: (data: { title?: string; model?: string }) =>
      ipcRenderer.invoke('db:conversations:create', data),
    update: (id: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:conversations:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:conversations:delete', id)
  },

  // --- Messages ---
  messages: {
    list: (conversationId: string) => ipcRenderer.invoke('db:messages:list', conversationId),
    create: (data: { conversation_id: string; role: string; content: string }) =>
      ipcRenderer.invoke('db:messages:create', data)
  },

  // --- Notes ---
  notes: {
    list: () => ipcRenderer.invoke('db:notes:list'),
    create: (data: { title?: string; content?: string; folder?: string; tags?: string }) =>
      ipcRenderer.invoke('db:notes:create', data),
    update: (id: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:notes:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:notes:delete', id)
  },

  // --- Tasks ---
  tasks: {
    list: () => ipcRenderer.invoke('db:tasks:list'),
    create: (data: {
      title: string
      description?: string
      status?: string
      priority?: string
      due_date?: string
      labels?: string
    }) => ipcRenderer.invoke('db:tasks:create', data),
    update: (id: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:tasks:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:tasks:delete', id)
  },

  // --- Bookmarks ---
  bookmarks: {
    list: () => ipcRenderer.invoke('db:bookmarks:list'),
    create: (data: {
      url: string
      title: string
      description?: string
      folder?: string
      tags?: string
      favicon?: string
    }) => ipcRenderer.invoke('db:bookmarks:create', data),
    update: (id: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:bookmarks:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:bookmarks:delete', id)
  },

  // --- Calendar Events ---
  events: {
    list: (month?: string) => ipcRenderer.invoke('db:events:list', month),
    create: (data: {
      title: string
      description?: string
      start_date: string
      end_date: string
      all_day?: boolean
      color?: string
      task_id?: string
    }) => ipcRenderer.invoke('db:events:create', data),
    update: (id: string, data: Record<string, unknown>) =>
      ipcRenderer.invoke('db:events:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('db:events:delete', id)
  },

  // --- Files ---
  files: {
    list: (dirPath?: string) => ipcRenderer.invoke('files:list', dirPath),
    read: (filePath: string) => ipcRenderer.invoke('files:read', filePath),
    open: (filePath: string) => ipcRenderer.invoke('files:open', filePath),
    openInFinder: (filePath: string) => ipcRenderer.invoke('files:openInFinder', filePath),
    getHome: () => ipcRenderer.invoke('files:getHome')
  },

  // --- AI ---
  ai: {
    getKeys: () => ipcRenderer.invoke('ai:getKeys'),
    setKey: (provider: string, key: string) => ipcRenderer.invoke('ai:setKey', provider, key),
    removeKey: (provider: string) => ipcRenderer.invoke('ai:removeKey', provider),
    chat: (data: { model: string; messages: Array<{ role: string; content: string }> }) =>
      ipcRenderer.invoke('ai:chat', data),
    onStreamChunk: (callback: (chunk: string) => void) => {
      const handler = (_: unknown, chunk: string) => callback(chunk)
      ipcRenderer.on('ai:stream-chunk', handler)
      return () => ipcRenderer.removeListener('ai:stream-chunk', handler)
    },
    onStreamEnd: (callback: () => void) => {
      const handler = () => callback()
      ipcRenderer.on('ai:stream-end', handler)
      return () => ipcRenderer.removeListener('ai:stream-end', handler)
    }
  },

  // --- Terminal ---
  terminal: {
    create: (id: string) => ipcRenderer.invoke('terminal:create', id),
    write: (id: string, data: string) => ipcRenderer.invoke('terminal:write', id, data),
    resize: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke('terminal:resize', id, cols, rows),
    kill: (id: string) => ipcRenderer.invoke('terminal:kill', id),
    onData: (id: string, callback: (data: string) => void) => {
      const handler = (_: unknown, data: string) => callback(data)
      ipcRenderer.on(`terminal:data:${id}`, handler)
      return () => ipcRenderer.removeListener(`terminal:data:${id}`, handler)
    },
    onExit: (id: string, callback: () => void) => {
      const handler = () => callback()
      ipcRenderer.on(`terminal:exit:${id}`, handler)
      return () => ipcRenderer.removeListener(`terminal:exit:${id}`, handler)
    }
  }
}

export type DanteAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
