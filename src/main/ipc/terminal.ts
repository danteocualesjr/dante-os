import { ipcMain, app } from 'electron'
import { homedir } from 'os'

interface TerminalHandle {
  id: string
  pty: { write: (data: string) => void; resize: (cols: number, rows: number) => void; kill: () => void }
}

const terminals: Map<string, TerminalHandle> = new Map()
let ptyModule: typeof import('node-pty') | null = null

function getPty(): typeof import('node-pty') {
  if (!ptyModule) {
    ptyModule = require('node-pty')
  }
  return ptyModule!
}

function killAllTerminals(): void {
  for (const [, handle] of terminals) {
    try {
      handle.pty.kill()
    } catch {
      // ignore
    }
  }
  terminals.clear()
}

export function registerTerminalHandlers(): void {
  app.on('before-quit', killAllTerminals)
  app.on('window-all-closed', killAllTerminals)

  ipcMain.handle('terminal:create', (event, id: string) => {
    try {
      const pty = getPty()
      const shell = process.platform === 'darwin' ? '/bin/zsh' : '/bin/bash'
      const term = pty.spawn(shell, [], {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd: homedir(),
        env: process.env as Record<string, string>
      })

      const handle: TerminalHandle = { id, pty: term }
      terminals.set(id, handle)

      const sender = event.sender

      term.onData((data: string) => {
        if (!sender.isDestroyed()) {
          sender.send(`terminal:data:${id}`, data)
        }
      })

      term.onExit(() => {
        terminals.delete(id)
        if (!sender.isDestroyed()) {
          sender.send(`terminal:exit:${id}`)
        }
      })

      // If the renderer goes away (window closed, reload), make sure the PTY
      // is torn down so we don't leave zombie shells running in the background.
      const onSenderDestroyed = (): void => {
        const existing = terminals.get(id)
        if (existing) {
          try {
            existing.pty.kill()
          } catch {
            // ignore
          }
          terminals.delete(id)
        }
      }
      sender.once('destroyed', onSenderDestroyed)

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('terminal:write', (_, id: string, data: string) => {
    const handle = terminals.get(id)
    if (handle) {
      try {
        handle.pty.write(data)
      } catch {
        // ignore write errors on dead ptys
      }
    }
  })

  ipcMain.handle('terminal:resize', (_, id: string, cols: number, rows: number) => {
    const handle = terminals.get(id)
    if (handle && Number.isFinite(cols) && Number.isFinite(rows) && cols > 0 && rows > 0) {
      try {
        handle.pty.resize(cols, rows)
      } catch {
        // ignore resize errors on dead ptys
      }
    }
  })

  ipcMain.handle('terminal:kill', (_, id: string) => {
    const handle = terminals.get(id)
    if (handle) {
      try {
        handle.pty.kill()
      } catch {
        // ignore
      }
      terminals.delete(id)
    }
  })
}
