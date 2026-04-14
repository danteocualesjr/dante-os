import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X
} from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  all_day: number
  color: string
  task_id: string | null
  created_at: string
}

const EVENT_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316'
]

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    all_day: true,
    color: '#3b82f6'
  })

  const loadEvents = useCallback(async () => {
    const month = format(currentDate, 'yyyy-MM')
    const data = (await window.api.events.list(month)) as CalendarEvent[]
    setEvents(data)
  }, [currentDate])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const getEventsForDay = (date: Date) =>
    events.filter((e) => {
      const eventDate = new Date(e.start_date)
      return isSameDay(eventDate, date)
    })

  const openCreate = (date?: Date) => {
    const d = date || selectedDate || new Date()
    const dateStr = format(d, 'yyyy-MM-dd')
    setNewEvent({
      title: '',
      description: '',
      start_date: dateStr,
      end_date: dateStr,
      all_day: true,
      color: '#3b82f6'
    })
    setShowCreate(true)
  }

  const createEvent = async () => {
    if (!newEvent.title.trim()) return
    await window.api.events.create({
      title: newEvent.title.trim(),
      description: newEvent.description,
      start_date: newEvent.start_date,
      end_date: newEvent.end_date || newEvent.start_date,
      all_day: newEvent.all_day,
      color: newEvent.color
    })
    setShowCreate(false)
    loadEvents()
  }

  const deleteEvent = async (id: string) => {
    await window.api.events.delete(id)
    loadEvents()
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">
            {format(currentDate, 'MMMM yyyy')}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <ChevronLeft size={18} className="text-text-secondary" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 rounded-lg text-[13px] font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New Event
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-center text-[12px] font-medium text-text-tertiary py-2 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(auto-fill,minmax(0,1fr))] overflow-hidden">
          {days.map((d, i) => {
            const dayEvents = getEventsForDay(d)
            const isCurrentMonth = isSameMonth(d, currentDate)
            const isSelected = selectedDate && isSameDay(d, selectedDate)

            return (
              <div
                key={i}
                onClick={() => setSelectedDate(d)}
                onDoubleClick={() => openCreate(d)}
                className={`border-b border-r border-border p-1.5 cursor-pointer transition-colors min-h-0 overflow-hidden ${
                  isCurrentMonth ? '' : 'opacity-40'
                } ${isSelected ? 'bg-accent/5' : 'hover:bg-surface-secondary/50'}`}
              >
                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] ${
                      isToday(d)
                        ? 'bg-accent text-white font-semibold'
                        : 'text-text-primary font-medium'
                    }`}
                  >
                    {format(d, 'd')}
                  </span>
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="group relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] leading-tight truncate"
                      style={{ backgroundColor: evt.color + '20', color: evt.color }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: evt.color }}
                      />
                      <span className="truncate">{evt.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEvent(evt.id)
                        }}
                        className="absolute right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-all"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-text-tertiary pl-1">
                      +{dayEvents.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create event modal */}
      {showCreate && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface rounded-2xl border border-border shadow-xl w-[420px] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">New Event</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1 hover:bg-surface-tertiary rounded-lg transition-colors"
              >
                <X size={18} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && createEvent()}
                placeholder="Event title..."
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[14px] outline-none focus:border-accent transition-colors"
                autoFocus
              />
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] text-text-secondary mb-1 block">Start</label>
                  <input
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[12px] text-text-secondary mb-1 block">End</label>
                  <input
                    type="date"
                    value={newEvent.end_date}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-secondary border border-border rounded-lg text-[13px] outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] text-text-secondary mb-1.5 block">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewEvent({ ...newEvent, color: c })}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newEvent.color === c ? 'ring-2 ring-offset-2 ring-offset-surface' : ''
                      }`}
                      style={{
                        backgroundColor: c,
                        ['--tw-ring-color' as string]: c
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={createEvent}
                disabled={!newEvent.title.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg text-[13px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
