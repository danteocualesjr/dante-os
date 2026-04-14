import { useState, useEffect } from 'react'
import { Key, Save, Eye, EyeOff, Check, Keyboard } from 'lucide-react'

export default function SettingsView() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [showOpenai, setShowOpenai] = useState(false)
  const [showAnthropic, setShowAnthropic] = useState(false)
  const [savedKeys, setSavedKeys] = useState({ openai: '', anthropic: '' })
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    window.api.ai.getKeys().then((keys) => {
      setSavedKeys(keys as { openai: string; anthropic: string })
    })
  }, [])

  const saveKey = async (provider: 'openai' | 'anthropic') => {
    const key = provider === 'openai' ? openaiKey : anthropicKey
    if (!key.trim()) return
    await window.api.ai.setKey(provider, key.trim())
    const keys = (await window.api.ai.getKeys()) as { openai: string; anthropic: string }
    setSavedKeys(keys)
    if (provider === 'openai') setOpenaiKey('')
    else setAnthropicKey('')
    setSaved(provider)
    setTimeout(() => setSaved(null), 2000)
  }

  const removeKey = async (provider: 'openai' | 'anthropic') => {
    await window.api.ai.removeKey(provider)
    const keys = (await window.api.ai.getKeys()) as { openai: string; anthropic: string }
    setSavedKeys(keys)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[640px] mx-auto py-8 px-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Settings</h1>
        <p className="text-[14px] text-text-secondary mb-8">
          Configure your Dante OS preferences and API keys.
        </p>

        {/* API Keys */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Key size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">API Keys</h2>
          </div>
          <p className="text-[13px] text-text-secondary mb-4">
            Add your API keys to use AI chat. Keys are encrypted and stored locally.
          </p>

          <div className="space-y-4">
            {/* OpenAI */}
            <div className="bg-surface-secondary rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-medium text-text-primary">OpenAI</h3>
                  {savedKeys.openai && (
                    <p className="text-[12px] text-success mt-0.5">
                      Configured: {savedKeys.openai}
                    </p>
                  )}
                </div>
                {savedKeys.openai && (
                  <button
                    onClick={() => removeKey('openai')}
                    className="text-[12px] text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showOpenai ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 pr-10 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowOpenai(!showOpenai)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary"
                  >
                    {showOpenai ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={() => saveKey('openai')}
                  disabled={!openaiKey.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
                >
                  {saved === 'openai' ? <Check size={14} /> : <Save size={14} />}
                  {saved === 'openai' ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>

            {/* Anthropic */}
            <div className="bg-surface-secondary rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-medium text-text-primary">Anthropic</h3>
                  {savedKeys.anthropic && (
                    <p className="text-[12px] text-success mt-0.5">
                      Configured: {savedKeys.anthropic}
                    </p>
                  )}
                </div>
                {savedKeys.anthropic && (
                  <button
                    onClick={() => removeKey('anthropic')}
                    className="text-[12px] text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showAnthropic ? 'text' : 'password'}
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 pr-10 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors font-mono"
                  />
                  <button
                    onClick={() => setShowAnthropic(!showAnthropic)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-secondary"
                  >
                    {showAnthropic ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={() => saveKey('anthropic')}
                  disabled={!anthropicKey.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
                >
                  {saved === 'anthropic' ? <Check size={14} /> : <Save size={14} />}
                  {saved === 'anthropic' ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={18} className="text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Keyboard Shortcuts</h2>
          </div>
          <div className="bg-surface-secondary rounded-xl border border-border overflow-hidden">
            {[
              ['Cmd + 1', 'AI Chat'],
              ['Cmd + 2', 'Notes'],
              ['Cmd + 3', 'Tasks'],
              ['Cmd + 4', 'Calendar'],
              ['Cmd + 5', 'Files'],
              ['Cmd + 6', 'Terminal'],
              ['Cmd + 7', 'Bookmarks'],
              ['Cmd + ,', 'Settings'],
              ['Cmd + B', 'Toggle Sidebar']
            ].map(([shortcut, action], i) => (
              <div
                key={shortcut}
                className={`flex items-center justify-between px-4 py-2.5 ${
                  i > 0 ? 'border-t border-border' : ''
                }`}
              >
                <span className="text-[13px] text-text-secondary">{action}</span>
                <kbd className="px-2 py-1 rounded-md bg-surface border border-border text-[12px] font-mono text-text-secondary">
                  {shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <div className="bg-surface-secondary rounded-xl p-4 border border-border text-center">
            <p className="text-[15px] font-semibold text-text-primary">Dante OS</p>
            <p className="text-[13px] text-text-secondary mt-1">Version 1.0.0</p>
            <p className="text-[12px] text-text-tertiary mt-2">Your personal desktop OS, powered by AI.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
