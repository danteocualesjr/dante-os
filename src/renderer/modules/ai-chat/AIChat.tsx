import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Send, Trash2, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Conversation {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'openai' },
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'anthropic' }
]

export default function AIChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadConversations = useCallback(async () => {
    const convos = await window.api.conversations.list()
    setConversations(convos as Conversation[])
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeConvo) {
      window.api.messages.list(activeConvo).then((msgs) => setMessages(msgs as Message[]))
    } else {
      setMessages([])
    }
  }, [activeConvo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText])

  const createConversation = async () => {
    const convo = (await window.api.conversations.create({ model })) as Conversation
    setConversations((prev) => [convo, ...prev])
    setActiveConvo(convo.id)
  }

  const deleteConversation = async (id: string) => {
    await window.api.conversations.delete(id)
    if (activeConvo === id) {
      setActiveConvo(null)
      setMessages([])
    }
    loadConversations()
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming) return

    let convoId = activeConvo
    if (!convoId) {
      const convo = (await window.api.conversations.create({ model })) as Conversation
      setConversations((prev) => [convo, ...prev])
      convoId = convo.id
      setActiveConvo(convo.id)
    }

    const userMsg = (await window.api.messages.create({
      conversation_id: convoId,
      role: 'user',
      content: input.trim()
    })) as Message

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)
    setStreamText('')

    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }

    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content
    }))

    let fullResponse = ''
    const removeChunk = window.api.ai.onStreamChunk((chunk: string) => {
      fullResponse += chunk
      setStreamText(fullResponse)
    })

    const removeEnd = window.api.ai.onStreamEnd(async () => {
      removeChunk()
      removeEnd()
      setStreaming(false)
      setStreamText('')

      if (fullResponse) {
        const assistantMsg = (await window.api.messages.create({
          conversation_id: convoId!,
          role: 'assistant',
          content: fullResponse
        })) as Message
        setMessages((prev) => [...prev, assistantMsg])

        if (messages.length === 0) {
          const title = input.trim().slice(0, 50) + (input.trim().length > 50 ? '...' : '')
          await window.api.conversations.update(convoId!, { title })
          loadConversations()
        }
      }
    })

    try {
      await window.api.ai.chat({ model, messages: allMessages })
    } catch (err) {
      removeChunk()
      removeEnd()
      setStreaming(false)
      setStreamText('')
      const errorMsg = (await window.api.messages.create({
        conversation_id: convoId!,
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      })) as Message
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target
    el.style.height = '44px'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
    setInput(el.value)
  }

  return (
    <div className="h-full flex">
      {/* Conversation list */}
      <div className="w-[260px] border-r border-border flex flex-col bg-surface-secondary/50">
        <div className="p-3 border-b border-border">
          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                activeConvo === convo.id
                  ? 'bg-accent/10 text-accent'
                  : 'hover:bg-surface-tertiary/60 text-text-secondary'
              }`}
              onClick={() => setActiveConvo(convo.id)}
            >
              <Bot size={16} className="shrink-0" />
              <span className="flex-1 truncate text-[13px]">{convo.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteConversation(convo.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-center text-text-tertiary text-[13px] py-8">
              No conversations yet
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Model selector */}
        <div className="px-4 py-2 border-b border-border flex items-center gap-3">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-surface-secondary border border-border rounded-lg px-3 py-1.5 text-[13px] text-text-primary outline-none focus:border-accent transition-colors"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
              <Bot size={48} strokeWidth={1.2} className="mb-4 text-text-tertiary/50" />
              <p className="text-lg font-medium text-text-secondary">Start a conversation</p>
              <p className="text-[13px] mt-1">Choose a model and type your message below.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-accent" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white'
                    : 'bg-surface-secondary text-text-primary'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center shrink-0">
                  <User size={16} className="text-text-secondary" />
                </div>
              )}
            </div>
          ))}
          {streaming && streamText && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-accent" />
              </div>
              <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-surface-secondary text-[14px] leading-relaxed">
                <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{streamText}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          {streaming && !streamText && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-accent" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-surface-secondary">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-text-tertiary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-surface-secondary border border-border rounded-2xl px-4 py-2 focus-within:border-accent transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-[14px] text-text-primary placeholder-text-tertiary min-h-[28px] max-h-[200px] py-1"
              style={{ height: '28px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || streaming}
              className="p-2 rounded-lg bg-accent text-white disabled:opacity-40 hover:bg-accent-hover transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
