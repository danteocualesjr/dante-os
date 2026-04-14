import { useEffect } from 'react'
import { useAppStore, type ModuleId } from '../stores/appStore'

const MODULE_SHORTCUTS: Record<string, ModuleId> = {
  '1': 'ai-chat',
  '2': 'notes',
  '3': 'tasks',
  '4': 'calendar',
  '5': 'file-manager',
  '6': 'terminal',
  '7': 'bookmarks',
  ',': 'settings'
}

export function useKeyboardShortcuts() {
  const setActiveModule = useAppStore((s) => s.setActiveModule)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const moduleId = MODULE_SHORTCUTS[e.key]
        if (moduleId) {
          e.preventDefault()
          setActiveModule(moduleId)
        }

        if (e.key === 'b') {
          e.preventDefault()
          toggleSidebar()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActiveModule, toggleSidebar])
}
