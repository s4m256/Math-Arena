import type { SupabaseClient } from '@supabase/supabase-js'
import type { Announcement } from './mock-data'

type AnnouncementRow = {
  id: string
  title: string
  content: string
  created_at: string
}

export async function getGlobalAnnouncements(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .is('contest_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Erro ao buscar anuncios:', error)
    return []
  }

  return data.map(mapAnnouncement)
}

export function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
  }
}
