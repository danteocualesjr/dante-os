# Dante OS

A personal desktop operating system powered by AI. Built with Electron, React, and TypeScript.

## Features

- **AI Chat** — Converse with GPT-4o, Claude Sonnet, and more. Streaming responses with full conversation history.
- **Notes** — Rich text editor with folders, tags, and search.
- **Tasks** — Kanban-style board with status columns, priorities, and due dates.
- **Calendar** — Month view with color-coded events.
- **File Manager** — Browse your file system with grid/list views and file preview.
- **Terminal** — Full terminal emulator with multiple tabs.
- **Bookmarks** — Save, organize, and search your links.
- **Settings** — Securely manage API keys (encrypted with Electron safeStorage).

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+1` | AI Chat |
| `Cmd+2` | Notes |
| `Cmd+3` | Tasks |
| `Cmd+4` | Calendar |
| `Cmd+5` | Files |
| `Cmd+6` | Terminal |
| `Cmd+7` | Bookmarks |
| `Cmd+,` | Settings |
| `Cmd+B` | Toggle sidebar |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack

- Electron + electron-vite
- React 18 + TypeScript
- Tailwind CSS v4
- Zustand (state management)
- better-sqlite3 (local database)
- Tiptap (rich text editor)
- xterm.js + node-pty (terminal)
- OpenAI + Anthropic APIs (AI chat)
# dante-os
