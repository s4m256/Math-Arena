import type { SupabaseClient } from '@supabase/supabase-js'
import { getDurationMinutes } from './contest-rules'
import type { Contest, ContestLevel, ContestStatus } from './mock-data'

export type { Contest, ContestLevel, ContestStatus }

type ContestRow = {
  id: string
  title: string
  start_time: string
  duration: string
  problem_count: number
  scoring_scale: '0-7' | '0-10'
  level: string
  rated: boolean
  description: string
}

export type ContestInput = {
  id: string
  title: string
  startTime: string
  duration: string
  problemCount: number
  scoringScale: '0-7' | '0-10'
  level: ContestLevel
  rated: boolean
  description: string
}

export async function getContests(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('contests')
    .select(
      'id, title, start_time, duration, problem_count, scoring_scale, level, rated, description'
    )
    .order('start_time', { ascending: false })

  if (error) {
    console.warn('Erro ao buscar competicoes:', error)
    return []
  }

  const participantCounts = await getParticipantCounts(supabase)

  return data.map((row) => mapContest(row, participantCounts.get(row.id) ?? 0))
}

export async function getContestById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('contests')
    .select(
      'id, title, start_time, duration, problem_count, scoring_scale, level, rated, description'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.warn('Erro ao buscar competicao:', error)
    return null
  }

  if (!data) return null

  const { count } = await supabase
    .from('contest_participations')
    .select('id', { count: 'exact', head: true })
    .eq('contest_id', id)

  return mapContest(data, count ?? 0)
}

export function contestToRow(contest: ContestInput) {
  return {
    id: contest.id,
    title: contest.title,
    start_time: contest.startTime,
    duration: contest.duration,
    problem_count: contest.problemCount,
    scoring_scale: contest.scoringScale,
    level: contest.level,
    rated: contest.rated,
    description: contest.description,
  }
}

export function normalizeContestId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function getParticipantCounts(supabase: SupabaseClient) {
  const counts = new Map<string, number>()
  const { data, error } = await supabase
    .from('contest_participations')
    .select('contest_id')

  if (error || !data) return counts

  for (const participation of data) {
    const contestId = String(participation.contest_id)
    counts.set(contestId, (counts.get(contestId) ?? 0) + 1)
  }

  return counts
}

function mapContest(row: ContestRow, participants: number): Contest {
  return {
    id: row.id,
    title: row.title,
    status: getContestStatus(row.start_time, row.duration),
    startTime: row.start_time,
    duration: row.duration,
    problemCount: row.problem_count,
    scoringScale: row.scoring_scale,
    level: isContestLevel(row.level) ? row.level : 'U',
    participants,
    rated: row.rated,
    description: row.description,
  }
}

function getContestStatus(startTimeValue: string, duration: string): ContestStatus {
  const now = new Date()
  const startTime = new Date(startTimeValue)
  const endTime = getContestEndTime(startTime, duration)

  if (now < startTime) return 'Futuro'
  if (now <= endTime) return 'Aberto'
  return 'Encerrado'
}

function getContestEndTime(startTime: Date, duration: string) {
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + getDurationMinutes(duration))
  return endTime
}

function isContestLevel(value: string): value is ContestLevel {
  return value === '1' || value === '2' || value === '3' || value === 'U'
}
