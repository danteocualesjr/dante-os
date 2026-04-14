import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Circle,
  Clock,
  CheckCircle2,
  Flag,
  Calendar as CalendarIcon,
  X
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  labels: string
  sort_order: number
  created_at: string
  updated_at: string
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', icon: Circle, color: 'text-text-tertiary' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-warning' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-success' }
} as const

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-text-tertiary' },
  medium: { label: 'Medium', color: 'text-warning' },
  high: { label: 'High', color: 'text-danger' }
} as const

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const loadTasks = useCallback(async () => {
    const data = (await window.api.tasks.list()) as Task[]
    setTasks(data)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = async () => {
    if (!newTitle.trim()) return
    await window.api.tasks.create({
      title: newTitle.trim(),
      priority: newPriority,
      due_date: newDueDate || undefined
    })
    setNewTitle('')
    setNewPriority('medium')
    setNewDueDate('')
    setShowCreate(false)
    loadTasks()
  }

  const updateStatus = async (id: string, status: string) => {
    await window.api.tasks.update(id, { status })
    loadTasks()
  }

  const deleteTask = async (id: string) => {
    await window.api.tasks.delete(id)
    if (editingTask?.id === id) setEditingTask(null)
    loadTasks()
  }

  const statuses = ['todo', 'in_progress', 'done'] as const

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Tasks</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {showCreate && (
        <div className="px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="flex items-center gap-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createTask()}
              placeholder="Task title..."
              className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
              autoFocus
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="px-3 py-2 bg-surface border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={createTask}
              className="px-4 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 p-6 h-full">
          {statuses.map((status) => {
            const config = STATUS_CONFIG[status]
            const StatusIcon = config.icon
            const columnTasks = tasks.filter((t) => t.status === status)

            return (
              <div key={status} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <StatusIcon size={16} className={config.color} />
                  <span className="text-[13px] font-semibold text-text-primary">
                    {config.label}
                  </span>
                  <span className="text-[12px] text-text-tertiary bg-surface-tertiary px-1.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setEditingTask(task)}
                      className="group bg-surface border border-border rounded-xl p-3 cursor-pointer hover:border-accent/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-[13px] font-medium text-text-primary leading-snug">
                          {task.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTask(task.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-danger transition-all shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-[12px] text-text-secondary mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`flex items-center gap-1 text-[11px] ${PRIORITY_CONFIG[task.priority].color}`}
                        >
                          <Flag size={10} />
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                            <CalendarIcon size={10} />
                            {new Date(task.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      {status !== 'done' && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-border-light">
                          {statuses
                            .filter((s) => s !== status)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateStatus(task.id, s)
                                }}
                                className="text-[11px] px-2 py-0.5 rounded bg-surface-secondary text-text-secondary hover:bg-surface-tertiary transition-colors"
                              >
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task detail modal */}
      {editingTask && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setEditingTask(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl border border-border shadow-xl w-[480px] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 hover:bg-surface-tertiary rounded-lg transition-colors"
              >
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={editingTask.title}
                onChange={(e) => {
                  const title = e.target.value
                  setEditingTask({ ...editingTask, title })
                  window.api.tasks.update(editingTask.id, { title })
                }}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[14px] outline-none focus:border-accent transition-colors"
              />
              <textarea
                value={editingTask.description}
                onChange={(e) => {
                  const description = e.target.value
                  setEditingTask({ ...editingTask, description })
                  window.api.tasks.update(editingTask.id, { description })
                }}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors resize-none"
              />
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={editingTask.status}
                  onChange={(e) => {
                    const status = e.target.value
                    setEditingTask({ ...editingTask, status: status as Task['status'] })
                    window.api.tasks.update(editingTask.id, { status })
                    loadTasks()
                  }}
                  className="px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
                <select
                  value={editingTask.priority}
                  onChange={(e) => {
                    const priority = e.target.value
                    setEditingTask({ ...editingTask, priority: priority as Task['priority'] })
                    window.api.tasks.update(editingTask.id, { priority })
                    loadTasks()
                  }}
                  className="px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={editingTask.due_date || ''}
                  onChange={(e) => {
                    const due_date = e.target.value || null
                    setEditingTask({ ...editingTask, due_date })
                    window.api.tasks.update(editingTask.id, { due_date })
                    loadTasks()
                  }}
                  className="px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  deleteTask(editingTask.id)
                  setEditingTask(null)
                  loadTasks()
                }}
                className="px-3 py-1.5 text-[13px] text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
