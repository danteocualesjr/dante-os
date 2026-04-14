import { registerDatabaseHandlers } from './database'
import { registerFileHandlers } from './files'
import { registerAIHandlers } from './ai'
import { registerTerminalHandlers } from './terminal'

export function registerAllIpcHandlers(): void {
  registerDatabaseHandlers()
  registerFileHandlers()
  registerAIHandlers()
  registerTerminalHandlers()
}
