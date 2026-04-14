import { useEffect } from 'react'
import { useAppStore, type ModuleId } from '../stores/appStore'

const MODULE_SHORTCUTS: Record<string, ModuleId> = {
  '1': 'home',
  '2': 'ai-chat',
  '3': 'notes',
  '4': 'tasks',
  '5': 'calendar',
  '6': 'file-manager',
  '7': 'terminal',
  '8': 'bookmarks',
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
