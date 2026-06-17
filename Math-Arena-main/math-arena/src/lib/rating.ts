import type { SupabaseClient } from '@supabase/supabase-js'
import { getContestById } from './contests'

type SubmissionRow = {
  id: string
  problem_id: string
  user_id: string
  submitted_at: string
  status: string
  score: number | null
}

type ProfileRow = {
  id: string
  rating: number | null
  max_rating: number | null
  contests: number | null
}

type RatingUpdateRow = {
  contest_id: string
  user_id: string
}

type RatingPlayer = {
  userId: string
  total: number
  rating: number
  maxRating: number
  contests: number
}

type RatingUpdate = {
  contest_id: string
  user_id: string
  old_rating: number
  new_rating: number
  delta: number
  rank: number
  total_score: number
}

export async function getContestRatingStatus(
  supabase: SupabaseClient,
  contestId: string
) {
  const { data, error } = await supabase
    .from('contest_rating_updates')
    .select('contest_id, user_id')
    .eq('contest_id', contestId)

  if (error || !data) {
    return { applied: false, count: 0 }
  }

  const rows = data as RatingUpdateRow[]
  return { applied: rows.length > 0, count: rows.length }
}

export async function applyRatingForContest(
  supabase: SupabaseClient,
  contestId: string
) {
  const contest = await getContestById(supabase, contestId)

  if (!contest) {
    throw new Error('Competição não encontrada.')
  }

  if (!contest.rated) {
    throw new Error('Esta competição não é rated.')
  }

  if (contest.status !== 'Encerrado') {
    throw new Error('O rating só pode ser aplicado depois que a competição encerra.')
  }

  const status = await getContestRatingStatus(supabase, contestId)
  if (status.applied) {
    throw new Error('O rating desta competição já foi aplicado.')
  }

  const latestRows = await getLatestSubmissionRows(supabase, contestId)
  const pendingRows = latestRows.filter(
    (row) => row.status !== 'Corrigido' || row.score === null
  )

  if (pendingRows.length > 0) {
    throw new Error('Ainda existem submissões pendentes de correção.')
  }

  const totals = getTotalsByUser(latestRows)
  if (totals.size < 2) {
    throw new Error('É preciso ter pelo menos 2 participantes corrigidos.')
  }

  const profiles = await getProfilesById(supabase, [...totals.keys()])
  const players = [...totals.entries()].map(([userId, total]) => {
    const profile = profiles.get(userId)

    if (!profile) {
      throw new Error(`Perfil não encontrado para o usuário ${userId}.`)
    }

    return {
      userId,
      total,
      rating: profile.rating ?? 1000,
      maxRating: profile.max_rating ?? profile.rating ?? 1000,
      contests: profile.contests ?? 0,
    }
  })

  const updates = calculateRatingUpdates(contestId, players)

  const { error: insertError } = await supabase
    .from('contest_rating_updates')
    .insert(updates)

  if (insertError) {
    throw new Error(`Não foi possível registrar os ratings: ${insertError.message}`)
  }

  for (const update of updates) {
    const player = players.find((item) => item.userId === update.user_id)
    if (!player) continue

    const { error } = await supabase
      .from('profiles')
      .update({
        rating: update.new_rating,
        max_rating: Math.max(player.maxRating, update.new_rating),
        contests: player.contests + 1,
      })
      .eq('id', update.user_id)

    if (error) {
      throw new Error(`Não foi possível atualizar o rating: ${error.message}`)
    }
  }

  return updates.length
}

async function getLatestSubmissionRows(
  supabase: SupabaseClient,
  contestId: string
) {
  const { data, error } = await supabase
    .from('contest_submissions')
    .select('id, problem_id, user_id, submitted_at, status, score')
    .eq('contest_id', contestId)
    .order('submitted_at', { ascending: false })

  if (error || !data) {
    throw new Error(`Não foi possível buscar submissões: ${error?.message}`)
  }

  const latestRows = new Map<string, SubmissionRow>()

  for (const row of data as SubmissionRow[]) {
    const key = `${row.user_id}:${row.problem_id}`
    if (!latestRows.has(key)) latestRows.set(key, row)
  }

  return [...latestRows.values()]
}

function getTotalsByUser(rows: SubmissionRow[]) {
  const totals = new Map<string, number>()

  for (const row of rows) {
    totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + (row.score ?? 0))
  }

  return totals
}

async function getProfilesById(supabase: SupabaseClient, userIds: string[]) {
  const profiles = new Map<string, ProfileRow>()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, rating, max_rating, contests')
    .in('id', userIds)

  if (error || !data) {
    throw new Error(`Não foi possível buscar perfis: ${error?.message}`)
  }

  for (const profile of data as ProfileRow[]) {
    profiles.set(profile.id, profile)
  }

  return profiles
}

function calculateRatingUpdates(contestId: string, players: RatingPlayer[]) {
  const rankedPlayers = [...players].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total
    return b.rating - a.rating
  })

  return rankedPlayers.map((player, index): RatingUpdate => {
    const rank = getRank(rankedPlayers, index)
    const delta = calculateDelta(player, players)
    const newRating = Math.max(0, player.rating + delta)

    return {
      contest_id: contestId,
      user_id: player.userId,
      old_rating: player.rating,
      new_rating: newRating,
      delta,
      rank,
      total_score: player.total,
    }
  })
}

function calculateDelta(player: RatingPlayer, players: RatingPlayer[]) {
  const opponents = players.filter((opponent) => opponent.userId !== player.userId)
  const performance = opponents.reduce((sum, opponent) => {
    return sum + getActualScore(player.total, opponent.total) - getExpectedScore(player.rating, opponent.rating)
  }, 0)

  return Math.round((getKFactor(player) * performance) / opponents.length)
}

function getActualScore(total: number, opponentTotal: number) {
  if (total > opponentTotal) return 1
  if (total < opponentTotal) return 0
  return 0.5
}

function getExpectedScore(rating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400))
}

function getKFactor(player: RatingPlayer) {
  if (player.contests < 5) return 48
  if (player.rating >= 2400) return 24
  return 32
}

function getRank(players: RatingPlayer[], index: number) {
  const player = players[index]
  const previousIndex = players.findIndex((item) => item.total === player.total)
  return previousIndex + 1
}
