import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import { useAppStore } from './stores/appStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import Home from './modules/home/Home'
import AIChat from './modules/ai-chat/AIChat'
import Notes from './modules/notes/Notes'
import Tasks from './modules/tasks/Tasks'
import CalendarView from './modules/calendar/CalendarView'
import FileManager from './modules/file-manager/FileManager'
import Terminal from './modules/terminal/Terminal'
import Bookmarks from './modules/bookmarks/Bookmarks'
import SettingsView from './modules/settings/SettingsView'
import { ArrowUp, Sparkles, Zap } from 'lucide-react'

const moduleComponents = {
  home: Home,
  'ai-chat': AIChat,
  notes: Notes,
  tasks: Tasks,
  calendar: CalendarView,
  'file-manager': FileManager,
  terminal: Terminal,
  bookmarks: Bookmarks,
  settings: SettingsView
} as const

export default function App() {
  useKeyboardShortcuts()
  const { activeModule, setActiveModule, setPendingChatPrompt } = useAppStore()
  const ActiveComponent = moduleComponents[activeModule]
  const [commandInput, setCommandInput] = useState('')

  const submitCommand = () => {
    if (!commandInput.trim()) return
    setPendingChatPrompt(commandInput.trim())
    setActiveModule('ai-chat')
    setCommandInput('')
  }

  const handleCommandSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitCommand()
    }
  }

  return (
    <div className="h-full flex bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TitleBar />
        <div className="flex-1 overflow-hidden">
          <ActiveComponent />
        </div>

        {/* Bottom command bar */}
        <div className="px-6 pb-4 pt-2 shrink-0 border-t border-border/60 bg-surface/80 backdrop-blur-sm">
          <div className="max-w-[720px] mx-auto flex items-center gap-2">
            <div className="flex-1 relative flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface card-elevated focus-within:border-text-tertiary transition-colors">
              <Sparkles size={16} strokeWidth={1.8} className="text-text-tertiary shrink-0" />
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleCommandSubmit}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-[14px] text-text-primary placeholder-text-tertiary outline-none"
              />
              <button
                onClick={submitCommand}
                disabled={!commandInput.trim()}
                className="p-1.5 rounded-lg bg-accent text-surface disabled:opacity-30 hover:bg-accent-hover transition-colors shrink-0"
                aria-label="Send to chat"
              >
                <ArrowUp size={14} strokeWidth={2.5} />
              </button>
            </div>
            <button
              onClick={() => setActiveModule('tasks')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-[13px] font-medium text-text-secondary hover:bg-surface-secondary hover:border-text-tertiary/40 transition-colors shrink-0 card-elevated"
            >
              <Zap size={14} strokeWidth={2} className="text-warning" />
              Todos
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
