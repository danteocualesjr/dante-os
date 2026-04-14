import {
  Home,
  Share2,
  MessageSquare,
  Lock,
  FileText,
  Trash2,
  Copy,
  Search,
  CheckSquare,
  Calendar,
  FolderOpen,
  TerminalSquare,
  Bookmark,
  Settings
} from 'lucide-react'
import { useAppStore, type ModuleId } from '../stores/appStore'

const primaryNav: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'ai-chat', label: 'Chat', icon: MessageSquare },
  { id: 'calendar', label: 'Calendar', icon: Calendar }
]

const spacesNav: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'notes', label: 'My notes', icon: Lock },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }
]

const utilityNav: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'file-manager', label: 'Files', icon: FolderOpen },
  { id: 'terminal', label: 'Terminal', icon: TerminalSquare }
]

export default function Sidebar() {
  const { activeModule, setActiveModule, sidebarCollapsed } = useAppStore()

  if (sidebarCollapsed) {
    return (
      <aside className="shrink-0 w-[56px] bg-sidebar backdrop-blur-xl border-r border-border flex flex-col transition-all duration-200">
        <div className="h-[52px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
        <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto">
          {[...primaryNav, ...spacesNav, ...utilityNav].map(({ id, icon: Icon }) => {
            const isActive = activeModule === id
            return (
              <button
                key={id}
                onClick={() => setActiveModule(id)}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-surface-tertiary text-text-primary'
                    : 'text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>
            )
          })}
        </nav>
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setActiveModule('settings')}
            className="w-full flex items-center justify-center p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary transition-all duration-150"
          >
            <Settings size={18} strokeWidth={1.8} />
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="shrink-0 w-[220px] bg-sidebar backdrop-blur-xl border-r border-border flex flex-col transition-all duration-200">
      <div className="h-[52px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Search */}
      <div className="px-3 mb-1">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg bg-surface-secondary/80 text-text-tertiary text-[13px] hover:bg-surface-tertiary/60 transition-colors"
          onClick={() => {/* TODO: command palette */}}
        >
          <Search size={14} strokeWidth={1.8} />
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-[11px] text-text-tertiary/70 font-medium">⌘K</kbd>
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="px-2 py-2 space-y-0.5">
        {primaryNav.map(({ id, label, icon: Icon }) => {
          const isActive = activeModule === id
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-surface-tertiary/80 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-tertiary/40 hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Spaces section */}
      <div className="mt-3 px-4 mb-1">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
          Spaces
        </span>
      </div>
      <nav className="px-2 py-1 space-y-0.5">
        {spacesNav.map(({ id, label, icon: Icon }) => {
          const isActive = activeModule === id
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-surface-tertiary/80 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-tertiary/40 hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Tools section */}
      <div className="mt-3 px-4 mb-1">
        <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
          Tools
        </span>
      </div>
      <nav className="px-2 py-1 space-y-0.5 flex-1">
        {utilityNav.map(({ id, label, icon: Icon }) => {
          const isActive = activeModule === id
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-surface-tertiary/80 text-text-primary'
                  : 'text-text-secondary hover:bg-surface-tertiary/40 hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-2 border-t border-border space-y-2">
        {/* Utility icon row */}
        <div className="flex items-center gap-0.5 px-1">
          <button
            onClick={() => setActiveModule('notes')}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary/40 transition-colors"
            title="New note"
          >
            <FileText size={15} strokeWidth={1.8} />
          </button>
          <button
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary/40 transition-colors"
            title="Share"
          >
            <Share2 size={15} strokeWidth={1.8} />
          </button>
          <button
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary/40 transition-colors"
            title="Duplicate"
          >
            <Copy size={15} strokeWidth={1.8} />
          </button>
          <button
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-tertiary/40 transition-colors"
            title="Trash"
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        </div>

        {/* Settings row */}
        <button
          onClick={() => setActiveModule('settings')}
          className={`w-full flex items-center gap-2.5 px-3 py-[6px] rounded-lg text-[13px] font-medium transition-all duration-150 ${
            activeModule === 'settings'
              ? 'bg-surface-tertiary/80 text-text-primary'
              : 'text-text-secondary hover:bg-surface-tertiary/40 hover:text-text-primary'
          }`}
        >
          <Settings size={16} strokeWidth={1.8} />
          <span>Settings</span>
        </button>

        {/* App branding */}
        <div className="flex items-center gap-2 px-2 pt-1 pb-1">
          <div className="w-5 h-5 rounded bg-text-primary flex items-center justify-center">
            <span className="text-[11px] font-bold text-surface">D</span>
          </div>
          <span className="text-[12px] font-medium text-text-secondary">Dante OS</span>
        </div>
      </div>
    </aside>
  )
}
