import type { Announcement } from '@/lib/mock-data'
import Panel from './Panel'

type AnnouncementsPanelProps = {
  announcements: Announcement[]
  title?: string
}

export default function AnnouncementsPanel({
  announcements,
  title = 'Últimos anúncios',
}: AnnouncementsPanelProps) {
  return (
    <Panel title={title}>
      <div className="announcement-list">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <article key={announcement.id} className="announcement-item">
              <div className="announcement-title">{announcement.title}</div>
              <p>{announcement.content}</p>
              <time>{formatDateTime(announcement.createdAt)}</time>
            </article>
          ))
        ) : (
          <p className="empty-state">Nenhum anúncio publicado.</p>
        )}
      </div>
    </Panel>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
