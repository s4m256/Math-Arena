import type { SupabaseClient } from '@supabase/supabase-js'

type ProfileRow = {
  id: string
  username: string | null
  rating: number | null
  max_rating: number | null
  bio: string | null
  created_at: string | null
}

type ParticipationRow = {
  user_id: string
}

export type RankingProfile = {
  id: string
  username: string
  rating: number | null
  maxRating: number | null
  contests: number
  bio: string
  joinedAt: string | null
}

export async function getRankingProfiles(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, rating, max_rating, bio, created_at')
    .order('rating', { ascending: false, nullsFirst: false })
    .order('username', { ascending: true })

  if (error || !data) {
    console.warn('Erro ao buscar ranking:', error)
    return []
  }

  const rows = data as ProfileRow[]
  const contestsByUser = await getContestCounts(
    supabase,
    rows.map((row) => row.id)
  )

  return rows.map((row) => mapProfile(row, contestsByUser))
}

export async function getRankingProfileByUsername(
  supabase: SupabaseClient,
  handle: string
) {
  const { data: usernameData, error: usernameError } = await supabase
    .from('profiles')
    .select('id, username, rating, max_rating, bio, created_at')
    .eq('username', handle)
    .maybeSingle()

  if (usernameError) {
    console.warn('Erro ao buscar perfil por nome:', usernameError)
  }

  const data =
    usernameData ??
    (await getProfileById(supabase, handle))

  if (!data) {
    return null
  }

  const row = data as ProfileRow
  const contestsByUser = await getContestCounts(supabase, [row.id])

  return mapProfile(row, contestsByUser)
}

async function getProfileById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, rating, max_rating, bio, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.warn('Erro ao buscar perfil por id:', error)
    return null
  }

  return data
}

async function getContestCounts(supabase: SupabaseClient, userIds: string[]) {
  const counts = new Map<string, number>()
  if (userIds.length === 0) return counts

  const { data, error } = await supabase
    .from('contest_participations')
    .select('user_id')
    .in('user_id', userIds)

  if (error || !data) {
    console.warn('Erro ao contar competições do ranking:', error)
    return counts
  }

  for (const row of data as ParticipationRow[]) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
  }

  return counts
}

function mapProfile(
  row: ProfileRow,
  contestsByUser: Map<string, number>
): RankingProfile {
  return {
    id: row.id,
    username: row.username || row.id.slice(0, 8),
    rating: row.rating,
    maxRating: row.max_rating ?? row.rating,
    contests: contestsByUser.get(row.id) ?? 0,
    bio: row.bio ?? '',
    joinedAt: row.created_at,
  }
}
