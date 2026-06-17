import type { SupabaseClient } from '@supabase/supabase-js'
import type { Problem, Standing, Submission, SubmissionStatus } from './mock-data'

export const submissionBucket = 'contest-submissions'

type SubmissionRow = {
  id: string
  contest_id: string
  problem_id: string
  user_id: string
  file_path: string
  file_name: string
  submitted_at: string
  status: SubmissionStatus
  score: number | null
}

type ProfileRow = {
  id: string
  username: string | null
  rating?: number | null
}

export type AdminSubmission = {
  id: string
  contestId: string
  problemId: string
  problemIndex: string
  problemPoints: number
  userId: string
  username: string
  fileName: string
  fileUrl: string
  submittedAt: string
  status: SubmissionStatus
  score: number | null
}

export async function getUserSubmissionsByContest(
  supabase: SupabaseClient,
  contestId: string,
  userId: string | null,
  problems: Problem[]
) {
  if (!userId) return []

  const rows = await getSubmissionRows(supabase, contestId, userId)
  const latestRows = getLatestRows(rows)

  const submissions: Submission[] = []

  for (const row of latestRows) {
    const { data } = await supabase.storage
      .from(submissionBucket)
      .createSignedUrl(row.file_path, 60 * 60)

    submissions.push(mapSubmission(row, problems, data?.signedUrl))
  }

  return submissions
}

export async function getStandingsByContest(
  supabase: SupabaseClient,
  contestId: string,
  problems: Problem[]
) {
  const rows = await getSubmissionRows(supabase, contestId)
  const latestRows = getLatestRows(rows)
  const userIds = [...new Set(latestRows.map((row) => row.user_id))]
  const profiles = await getProfilesById(supabase, userIds)
  const standings = new Map<string, Standing>()

  for (const row of latestRows) {
    const problem = problems.find((item) => item.id === row.problem_id)
    if (!problem || row.score === null) continue

    const profile = profiles.get(row.user_id)
    const standing =
      standings.get(row.user_id) ??
      createStanding(contestId, row.user_id, profile, problems)

    standing.scoresByProblem[problem.index] = row.score
    standing.total += row.score
    standings.set(row.user_id, standing)
  }

  return [...standings.values()].sort((a, b) => b.total - a.total)
}

export async function getAdminSubmissionsByContest(
  supabase: SupabaseClient,
  contestId: string,
  problems: Problem[]
) {
  if (!contestId) return []

  const rows = getLatestRows(await getSubmissionRows(supabase, contestId))
  const userIds = [...new Set(rows.map((row) => row.user_id))]
  const profiles = await getProfilesById(supabase, userIds)
  const result: AdminSubmission[] = []

  for (const row of rows) {
    const problem = problems.find((item) => item.id === row.problem_id)
    if (!problem) continue

    const { data } = await supabase.storage
      .from(submissionBucket)
      .createSignedUrl(row.file_path, 60 * 60)

    result.push({
      id: row.id,
      contestId: row.contest_id,
      problemId: row.problem_id,
      problemIndex: problem.index,
      problemPoints: problem.points,
      userId: row.user_id,
      username: getProfileName(profiles.get(row.user_id), row.user_id),
      fileName: row.file_name,
      fileUrl: data?.signedUrl ?? '#',
      submittedAt: row.submitted_at,
      status: row.status,
      score: row.score,
    })
  }

  return result.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

async function getSubmissionRows(
  supabase: SupabaseClient,
  contestId: string,
  userId?: string
) {
  let query = supabase
    .from('contest_submissions')
    .select(
      'id, contest_id, problem_id, user_id, file_path, file_name, submitted_at, status, score'
    )
    .eq('contest_id', contestId)
    .order('submitted_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.warn('Erro ao buscar submissões:', error)
    return []
  }

  return data as SubmissionRow[]
}

async function getProfilesById(supabase: SupabaseClient, userIds: string[]) {
  const profiles = new Map<string, ProfileRow>()
  if (userIds.length === 0) return profiles

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, rating')
    .in('id', userIds)

  if (error || !data) return profiles

  for (const profile of data as ProfileRow[]) {
    profiles.set(profile.id, profile)
  }

  return profiles
}

function getLatestRows(rows: SubmissionRow[]) {
  const latestRows = new Map<string, SubmissionRow>()

  for (const row of rows) {
    const key = `${row.user_id}:${row.problem_id}`
    if (!latestRows.has(key)) latestRows.set(key, row)
  }

  return [...latestRows.values()]
}

function mapSubmission(
  row: SubmissionRow,
  problems: Problem[],
  fileUrl?: string
): Submission {
  const problem = problems.find((item) => item.id === row.problem_id)

  return {
    id: row.id,
    contestId: row.contest_id,
    userId: row.user_id,
    problemIndex: problem?.index ?? '-',
    fileName: row.file_name,
    fileUrl,
    submittedAt: row.submitted_at,
    status: row.status,
    score: row.score,
  }
}

function createStanding(
  contestId: string,
  userId: string,
  profile: ProfileRow | undefined,
  problems: Problem[]
): Standing {
  return {
    contestId,
    userId,
    username: getProfileName(profile, userId),
    rating: profile?.rating ?? undefined,
    scoresByProblem: Object.fromEntries(problems.map((problem) => [problem.index, null])),
    total: 0,
  }
}

function getProfileName(profile: ProfileRow | undefined, fallback: string) {
  return profile?.username || fallback.slice(0, 8)
}
