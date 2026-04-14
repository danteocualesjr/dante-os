import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'

interface TerminalTab {
  id: string
  title: string
}

export default function Terminal() {
  const [tabs, setTabs] = useState<TerminalTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<{ terminal: unknown; fitAddon: unknown } | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const createTab = useCallback(async () => {
    const id = `term-${Date.now()}`
    const tab: TerminalTab = { id, title: 'Terminal' }
    setTabs((prev) => [...prev, tab])
    setActiveTab(id)
    return id
  }, [])

  useEffect(() => {
    if (tabs.length === 0) {
      createTab()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!activeTab || !terminalRef.current) return

    let cancelled = false

    const init = async () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }

      if (terminalRef.current) {
        terminalRef.current.innerHTML = ''
      }

      try {
        const { Terminal: XTerm } = await import('@xterm/xterm')
        const { FitAddon } = await import('@xterm/addon-fit')

        if (cancelled) return

        const terminal = new XTerm({
          theme: {
            background: '#1c1c1e',
            foreground: '#f5f5f7',
            cursor: '#f5f5f7',
            selectionBackground: 'rgba(0, 122, 255, 0.3)',
            black: '#1c1c1e',
            red: '#ff3b30',
            green: '#34c759',
            yellow: '#ff9500',
            blue: '#007aff',
            magenta: '#af52de',
            cyan: '#5ac8fa',
            white: '#f5f5f7',
            brightBlack: '#636366',
            brightRed: '#ff6961',
            brightGreen: '#4cd964',
            brightYellow: '#ffcc00',
            brightBlue: '#5ac8fa',
            brightMagenta: '#da7cff',
            brightCyan: '#70d7ff',
            brightWhite: '#ffffff'
          },
          fontSize: 14,
          fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", Menlo, Monaco, monospace',
          cursorBlink: true,
          cursorStyle: 'bar',
          allowTransparency: true,
          scrollback: 10000
        })

        const fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)

        if (terminalRef.current && !cancelled) {
          terminal.open(terminalRef.current)
          fitAddon.fit()

          xtermRef.current = { terminal, fitAddon }

          const result = await window.api.terminal.create(activeTab)
          if (!result.success) {
            terminal.writeln(`\r\nFailed to create terminal: ${result.error || 'Unknown error'}`)
            terminal.writeln('node-pty may not be installed. Run: npm rebuild node-pty')
            return
          }

          terminal.onData((data: string) => {
            window.api.terminal.write(activeTab, data)
          })

          const removeData = window.api.terminal.onData(activeTab, (data: string) => {
            terminal.write(data)
          })

          const removeExit = window.api.terminal.onExit(activeTab, () => {
            terminal.writeln('\r\n[Process exited]')
          })

          const observer = new ResizeObserver(() => {
            fitAddon.fit()
            window.api.terminal.resize(activeTab, terminal.cols, terminal.rows)
          })
          observer.observe(terminalRef.current)

          cleanupRef.current = () => {
            removeData()
            removeExit()
            observer.disconnect()
            terminal.dispose()
          }
        }
      } catch (err) {
        console.error('Failed to initialize terminal:', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [activeTab])

  const closeTab = async (id: string) => {
    await window.api.terminal.kill(id)
    setTabs((prev) => prev.filter((t) => t.id !== id))
    if (activeTab === id) {
      const remaining = tabs.filter((t) => t.id !== id)
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1].id : null)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1c1c1e]">
      {/* Tab bar */}
      <div className="flex items-center bg-[#2c2c2e] border-b border-[#3a3a3c] px-2 shrink-0">
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-[13px] border-r border-[#3a3a3c] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1c1c1e] text-white'
                  : 'text-[#a1a1a6] hover:text-white hover:bg-[#3a3a3c]'
              }`}
            >
              <span>{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="p-0.5 rounded hover:bg-[#4a4a4c] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={createTab}
          className="p-1.5 rounded hover:bg-[#3a3a3c] transition-colors ml-1"
        >
          <Plus size={16} className="text-[#a1a1a6]" />
        </button>
      </div>

      {/* Terminal area */}
      <div
        ref={terminalRef}
        className="flex-1 p-2 overflow-hidden"
        style={{ minHeight: 0 }}
      />

      <style>{`
        .xterm { height: 100% !important; }
        .xterm-viewport { overflow-y: auto !important; }
      `}</style>
    </div>
  )
}
