import { useState, useEffect, useCallback } from 'react'
import { format, addDays, isToday, isSameDay, startOfDay, parseISO } from 'date-fns'

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

const EVENT_COLORS = ['#4A7FBF', '#4A9F6E', '#7B5EA7', '#C47A2A', '#BF4A4A']

function getEventColor(event: CalendarEvent): string {
  const idx = EVENT_COLORS.indexOf(event.color)
  if (idx >= 0) return event.color
  let hash = 0
  for (let i = 0; i < event.title.length; i++) {
    hash = event.title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return EVENT_COLORS[Math.abs(hash) % EVENT_COLORS.length]
}

function formatEventTime(startStr: string, endStr: string, allDay: number): string {
  if (allDay) return 'All day'
  const start = parseISO(startStr)
  const end = parseISO(endStr)
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  if (isSameDay(start, end)) {
    return `${fmt(start)} – ${fmt(end)}`
  }
  const fmtDate = (d: Date) =>
    `${format(d, 'dd/MM/yyyy')}, ${fmt(d)}`
  return `${fmtDate(start)} – ${fmtDate(end)}`
}

interface DayGroup {
  date: Date
  events: CalendarEvent[]
}

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const loadEvents = useCallback(async () => {
    try {
      const now = new Date()
      const currentMonth = format(now, 'yyyy-MM')
      const nextMonth = format(addDays(now, 30), 'yyyy-MM')
      const currentEvents = (await window.api.events.list(currentMonth)) as CalendarEvent[]
      let allEvents = currentEvents
      if (currentMonth !== nextMonth) {
        const nextEvents = (await window.api.events.list(nextMonth)) as CalendarEvent[]
        allEvents = [...currentEvents, ...nextEvents]
      }
      const uniqueMap = new Map<string, CalendarEvent>()
      allEvents.forEach((e) => uniqueMap.set(e.id, e))
      const today = startOfDay(now)
      const filtered = Array.from(uniqueMap.values())
        .filter((e) => {
          const eventDate = startOfDay(parseISO(e.start_date))
          return eventDate >= today
        })
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      setEvents(filtered)
    } catch {
      setEvents([])
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const dayGroups: DayGroup[] = []
  const daysToShow = 7
  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(new Date(), i)
    const dayEvents = events.filter((e) => isSameDay(parseISO(e.start_date), date))
    dayGroups.push({ date, events: dayEvents })
  }

  const todayEvents = events.filter((e) => isToday(parseISO(e.start_date)))

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[720px] mx-auto px-8 py-8">
        <h1
          className="text-[36px] font-normal tracking-[-0.01em] mb-8"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Coming up
        </h1>

        <div className="border border-border rounded-xl overflow-hidden bg-surface">
          {dayGroups.map((group, groupIdx) => {
            const dayIsToday = isToday(group.date)
            return (
              <div
                key={groupIdx}
                className={`flex gap-6 px-6 py-5 ${
                  groupIdx > 0 ? 'border-t border-border' : ''
                }`}
              >
                <div className="w-[70px] shrink-0 flex flex-col items-start">
                  <span className="text-[32px] font-light leading-none text-text-primary relative">
                    {format(group.date, 'd')}
                    {dayIsToday && (
                      <span className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-danger" />
                    )}
                  </span>
                  <span className="text-[13px] text-text-secondary mt-1">
                    {format(group.date, 'MMMM')}
                  </span>
                  <span className="text-[13px] text-text-secondary">
                    {format(group.date, 'EEE')}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-[50px]">
                  {group.events.length === 0 ? (
                    dayIsToday ? (
                      <span className="text-[14px] text-text-tertiary">
                        No more events today
                      </span>
                    ) : (
                      <span className="text-[14px] text-text-tertiary">No events</span>
                    )
                  ) : (
                    <div className="space-y-3">
                      {group.events.map((event) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <div
                            className="w-[3px] rounded-full mt-0.5 shrink-0"
                            style={{
                              backgroundColor: getEventColor(event),
                              height: '36px'
                            }}
                          />
                          <div>
                            <div className="text-[14px] font-medium text-text-primary leading-snug">
                              {event.title}
                            </div>
                            <div className="text-[13px] text-text-secondary mt-0.5">
                              {formatEventTime(
                                event.start_date,
                                event.end_date,
                                event.all_day
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {todayEvents.length > 0 && (
          <div className="mt-10">
            <h2 className="text-[13px] font-medium text-text-tertiary uppercase tracking-wider mb-4">
              Today
            </h2>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface hover:bg-surface-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-surface-secondary flex items-center justify-center text-text-tertiary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-text-primary truncate">
                      {event.title}
                    </div>
                  </div>
                  <span className="text-[13px] text-text-tertiary shrink-0">
                    {formatEventTime(event.start_date, event.end_date, event.all_day)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="mt-10 text-center py-12">
            <p className="text-text-tertiary text-[14px]">
              No upcoming events. Add events in the Calendar module.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
