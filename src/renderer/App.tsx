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
import { Zap } from 'lucide-react'

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
  const { activeModule, setActiveModule } = useAppStore()
  const ActiveComponent = moduleComponents[activeModule]
  const [commandInput, setCommandInput] = useState('')

  const handleCommandSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      setActiveModule('ai-chat')
      setCommandInput('')
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
        <div className="px-6 pb-4 pt-2 shrink-0">
          <div className="max-w-[720px] mx-auto flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleCommandSubmit}
                placeholder="Ask anything"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-[14px] text-text-primary placeholder-text-tertiary outline-none focus:border-text-tertiary transition-colors"
              />
            </div>
            <button
              onClick={() => setActiveModule('tasks')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-[13px] font-medium text-text-secondary hover:bg-surface-secondary transition-colors shrink-0"
            >
              <Zap size={14} strokeWidth={2} className="text-text-tertiary" />
              List recent todos
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
