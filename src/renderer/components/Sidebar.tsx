import {
  MessageSquare,
  StickyNote,
  CheckSquare,
  Calendar,
  FolderOpen,
  TerminalSquare,
  Bookmark,
  Settings
} from 'lucide-react'
import { useAppStore, type ModuleId } from '../stores/appStore'

const modules: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'file-manager', label: 'Files', icon: FolderOpen },
  { id: 'terminal', label: 'Terminal', icon: TerminalSquare },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
]

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed } = useAppStore()

  return (
    <aside
      className={`shrink-0 bg-sidebar backdrop-blur-xl border-r border-border flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'w-[64px]' : 'w-[220px]'
      }`}
    >
      <div className="h-[52px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {modules.map(({ id, label, icon: Icon }) => {
          const isActive = activeModule === id
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary'
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => setActiveModule('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
            activeModule === 'settings'
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary'
          }`}
        >
          <Settings size={18} strokeWidth={1.8} />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  )
}
