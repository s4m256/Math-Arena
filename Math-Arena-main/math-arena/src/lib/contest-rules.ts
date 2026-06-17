import type { Contest } from './mock-data'

export type ContestPhase = 'not_started' | 'running' | 'finished'

export function getContestEndTime(contest: Contest) {
  const endTime = new Date(contest.startTime)
  endTime.setMinutes(endTime.getMinutes() + getDurationMinutes(contest.duration))
  return endTime
}

export function getDurationMinutes(duration: string) {
  const timeMatch = duration.match(/^(\d{1,2}):(\d{2})$/)

  if (timeMatch) {
    return Number(timeMatch[1]) * 60 + Number(timeMatch[2])
  }

  const hoursMatch = duration.match(/(\d+)h/)
  const minutesMatch = duration.match(/h(\d+)|(\d+)min/)
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0
  const minutes = minutesMatch ? Number(minutesMatch[1] ?? minutesMatch[2]) : 0

  return hours * 60 + minutes
}

export function getContestPhase(contest: Contest, now: Date): ContestPhase {
  const startTime = new Date(contest.startTime)
  const endTime = getContestEndTime(contest)

  if (now < startTime) return 'not_started'
  if (now <= endTime) return 'running'
  return 'finished'
}

export function canSubmitToContest(contest: Contest, now: Date) {
  return getContestPhase(contest, now) === 'running'
}

export function getContestPhaseLabel(phase: ContestPhase) {
  if (phase === 'not_started') return 'Futuro'
  if (phase === 'running') return 'Aberto'
  return 'Encerrado'
}

export function getCorrectionStatusLabel(phase: ContestPhase) {
  if (phase === 'finished') return 'Correção interna'
  return 'Aguardando encerramento'
}
