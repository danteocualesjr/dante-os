import { ipcMain } from 'electron'
import { homedir } from 'os'

const terminals: Map<string, unknown> = new Map()
let ptyModule: typeof import('node-pty') | null = null

function getPty(): typeof import('node-pty') {
  if (!ptyModule) {
    ptyModule = require('node-pty')
  }
  return ptyModule!
}

export function registerTerminalHandlers(): void {
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

      terminals.set(id, term)

      term.onData((data: string) => {
        event.sender.send(`terminal:data:${id}`, data)
      })

      term.onExit(() => {
        terminals.delete(id)
        event.sender.send(`terminal:exit:${id}`)
      })

      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('terminal:write', (_, id: string, data: string) => {
    const term = terminals.get(id) as { write: (data: string) => void } | undefined
    if (term) {
      term.write(data)
    }
  })

  ipcMain.handle('terminal:resize', (_, id: string, cols: number, rows: number) => {
    const term = terminals.get(id) as { resize: (cols: number, rows: number) => void } | undefined
    if (term) {
      term.resize(cols, rows)
    }
  })

  ipcMain.handle('terminal:kill', (_, id: string) => {
    const term = terminals.get(id) as { kill: () => void } | undefined
    if (term) {
      term.kill()
      terminals.delete(id)
    }
  })
}
