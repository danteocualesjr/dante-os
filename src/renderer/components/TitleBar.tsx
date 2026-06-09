import { UserPlus, Plus } from 'lucide-react'
import { useAppStore, type ModuleId } from '../stores/appStore'

const MODULE_TITLES: Record<ModuleId, string> = {
  home: 'Home',
  'ai-chat': 'Chat',
  notes: 'Notes',
  tasks: 'Tasks',
  calendar: 'Calendar',
  'file-manager': 'Files',
  terminal: 'Terminal',
  bookmarks: 'Bookmarks',
  settings: 'Settings'
}

export default function TitleBar() {
  const { activeModule, setActiveModule } = useAppStore()

  return (
    <div
      className="h-[52px] flex items-center justify-between px-5 shrink-0 select-none border-b border-border/50 bg-surface/60 backdrop-blur-sm"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 min-w-0" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <h2 className="text-[15px] font-semibold text-text-primary truncate">
          {MODULE_TITLES[activeModule]}
        </h2>
      </div>

      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary transition-colors"
        >
          <UserPlus size={14} strokeWidth={1.8} />
          <span>Invite</span>
        </button>
        <button
          onClick={() => setActiveModule('notes')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-accent text-surface hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={2} />
          <span>Quick note</span>
        </button>
      </div>
    </div>
  )
}
