import { create } from 'zustand'

export type ModuleId =
  | 'home'
  | 'ai-chat'
  | 'notes'
  | 'tasks'
  | 'calendar'
  | 'file-manager'
  | 'terminal'
  | 'bookmarks'
  | 'settings'

interface AppState {
  activeModule: ModuleId
  setActiveModule: (module: ModuleId) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'home',
  setActiveModule: (module) => set({ activeModule: module }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}))
