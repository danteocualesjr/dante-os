import { ipcMain, safeStorage, app } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

function getKeysPath(): string {
  return join(app.getPath('userData'), 'api-keys.enc')
}

function loadKeys(): Record<string, string> {
  const keysPath = getKeysPath()
  if (!existsSync(keysPath)) return {}
  try {
    const encrypted = readFileSync(keysPath)
    const decrypted = safeStorage.decryptString(encrypted)
    return JSON.parse(decrypted)
  } catch {
    return {}
  }
}

function saveKeys(keys: Record<string, string>): void {
  const keysPath = getKeysPath()
  const encrypted = safeStorage.encryptString(JSON.stringify(keys))
  writeFileSync(keysPath, encrypted)
}

export function registerAIHandlers(): void {
  ipcMain.handle('ai:getKeys', () => {
    const keys = loadKeys()
    return {
      openai: keys.openai ? '••••' + keys.openai.slice(-4) : '',
      anthropic: keys.anthropic ? '••••' + keys.anthropic.slice(-4) : ''
    }
  })

  ipcMain.handle('ai:setKey', (_, provider: string, key: string) => {
    const keys = loadKeys()
    keys[provider] = key
    saveKeys(keys)
  })

  ipcMain.handle('ai:removeKey', (_, provider: string) => {
    const keys = loadKeys()
    delete keys[provider]
    saveKeys(keys)
  })

  ipcMain.handle(
    'ai:chat',
    async (event, data: { model: string; messages: Array<{ role: string; content: string }> }) => {
      const keys = loadKeys()
      const isAnthropic = data.model.startsWith('claude')
      const apiKey = isAnthropic ? keys.anthropic : keys.openai

      if (!apiKey) {
        throw new Error(
          `No API key configured for ${isAnthropic ? 'Anthropic' : 'OpenAI'}. Add one in Settings.`
        )
      }

      if (isAnthropic) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: data.model,
            max_tokens: 4096,
            messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
            stream: true
          })
        })

        if (!response.ok) {
          const err = await response.text()
          throw new Error(`Anthropic API error: ${err}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6)
              if (jsonStr === '[DONE]') continue
              try {
                const parsed = JSON.parse(jsonStr)
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  event.sender.send('ai:stream-chunk', parsed.delta.text)
                }
              } catch {
                // skip malformed
              }
            }
          }
        }
        event.sender.send('ai:stream-end')
      } else {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: data.model,
            messages: data.messages,
            stream: true
          })
        })

        if (!response.ok) {
          const err = await response.text()
          throw new Error(`OpenAI API error: ${err}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6)
              if (jsonStr === '[DONE]') continue
              try {
                const parsed = JSON.parse(jsonStr)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  event.sender.send('ai:stream-chunk', content)
                }
              } catch {
                // skip malformed
              }
            }
          }
        }
        event.sender.send('ai:stream-end')
      }
    }
  )
}
