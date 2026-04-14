import { UserPlus, Plus } from 'lucide-react'
import { useAppStore } from '../stores/appStore'

export default function TitleBar() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)

  return (
    <div
      className="h-[52px] flex items-center justify-end px-4 shrink-0 select-none gap-2"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary transition-colors"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <UserPlus size={14} strokeWidth={1.8} />
        <span>Invite</span>
      </button>
      <button
        onClick={() => setActiveModule('notes')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary/60 hover:text-text-primary transition-colors"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Plus size={14} strokeWidth={2} />
        <span>Quick note</span>
      </button>
    </div>
  )
}
