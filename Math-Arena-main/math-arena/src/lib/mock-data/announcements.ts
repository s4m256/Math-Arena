import type { Announcement } from './types'

export const announcements: Announcement[] = [
  {
    id: 'a1',
    title: 'Round 1 de Geometria abre inscrições',
    content: 'A competição estará aberta para registro até 15/06 às 18:50.',
    createdAt: '2026-06-08T09:00:00-03:00',
  },
  {
    id: 'a2',
    contestId: 'geometry-round-1',
    title: 'Clarificação do Problema C',
    content: 'No enunciado, as circunferências são tangentes externamente.',
    createdAt: '2026-06-15T20:20:00-03:00',
  },
  {
    id: 'a3',
    contestId: 'mock-selection-2026',
    title: 'Formato da Seletiva Mock',
    content: 'Cada problema será corrigido na escala 0-10. A última submissão conta.',
    createdAt: '2026-06-07T17:30:00-03:00',
  },
]

export function getGlobalAnnouncements() {
  return announcements.filter((announcement) => !announcement.contestId)
}

export function getAnnouncementsByContest(contestId: string) {
  return announcements.filter(
    (announcement) => !announcement.contestId || announcement.contestId === contestId
  )
}
