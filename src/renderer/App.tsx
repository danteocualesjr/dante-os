import Sidebar from './components/Sidebar'
import TitleBar from './components/TitleBar'
import { useAppStore } from './stores/appStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import AIChat from './modules/ai-chat/AIChat'
import Notes from './modules/notes/Notes'
import Tasks from './modules/tasks/Tasks'
import CalendarView from './modules/calendar/CalendarView'
import FileManager from './modules/file-manager/FileManager'
import Terminal from './modules/terminal/Terminal'
import Bookmarks from './modules/bookmarks/Bookmarks'
import SettingsView from './modules/settings/SettingsView'

const moduleComponents = {
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
  const activeModule = useAppStore((s) => s.activeModule)
  const ActiveComponent = moduleComponents[activeModule]

  return (
    <div className="h-full flex bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <TitleBar />
        <div className="flex-1 overflow-hidden">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
