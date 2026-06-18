import Link from 'next/link'
import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import { getDurationMinutes } from '@/lib/contest-rules'
import { getContests } from '@/lib/contests'
import { createClient } from '@/lib/supabase/server'

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default async function CalendarPage() {
  const supabase = await createClient()
  const sortedContests = (await getContests(supabase)).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )
  const monthDate = new Date(sortedContests[0]?.startTime ?? '2026-06-01T00:00:00-03:00')
  const days = getMonthDays(monthDate)

  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>Calendário</h1>
          <p className="subtitle">Todas as competições cadastradas.</p>
        </div>
        <a
          className="button"
          href={createIcsHref(sortedContests)}
          download="matharena-calendar.ics"
        >
          Importar calendário
        </a>
      </div>

      <Panel title={formatMonth(monthDate)}>
        {sortedContests.length > 0 ? (
          <div className="calendar-grid">
            {weekDays.map((day) => (
              <div key={day} className="calendar-head">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const dayContests = sortedContests.filter((contest) =>
                isSameDay(new Date(contest.startTime), day)
              )

              return (
                <div key={day.toISOString()} className="calendar-day">
                  <div className="calendar-date">{day.getDate()}</div>
                  {dayContests.map((contest) => (
                    <Link
                      key={contest.id}
                      className="calendar-event"
                      href={`/contests/${contest.id}`}
                    >
                      {contest.title}
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="empty-state">Nenhuma competição cadastrada.</p>
        )}
      </Panel>
    </AppShell>
  )
}

function getMonthDays(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function createIcsHref(events: { title: string; startTime: string; duration: string }[]) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MathArena//Calendar//PT-BR',
    ...events.flatMap((event) => {
      const start = new Date(event.startTime)
      const end = addDuration(start, event.duration)

      return [
        'BEGIN:VEVENT',
        `UID:${slugify(event.title)}-${toIcsDate(start)}@matharena`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${escapeIcs(event.title)}`,
        'DESCRIPTION:Competição MathArena',
        'END:VEVENT',
      ]
    }),
    'END:VCALENDAR',
  ]

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`
}

function addDuration(start: Date, duration: string) {
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + getDurationMinutes(duration))
  return end
}

function toIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function escapeIcs(value: string) {
  return value.replace(/,/g, '\\,').replace(/;/g, '\\;')
}
