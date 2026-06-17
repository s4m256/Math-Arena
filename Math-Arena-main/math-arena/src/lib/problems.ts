import type { SupabaseClient } from '@supabase/supabase-js'
import type { Problem } from './mock-data'

type ProblemRow = {
  id: string
  contest_id: string
  problem_index: number
  statement: string
  points: number
}

export async function getProblemsByContest(supabase: SupabaseClient, contestId: string) {
  const { data, error } = await supabase
    .from('contest_problems')
    .select('id, contest_id, problem_index, statement, points')
    .eq('contest_id', contestId)
    .order('problem_index', { ascending: true })

  if (error) {
    console.warn('Erro ao buscar problemas:', error)
    return []
  }

  return data.map(mapProblem)
}

function mapProblem(row: ProblemRow): Problem {
  const index = String(row.problem_index)

  return {
    id: row.id,
    contestId: row.contest_id,
    index,
    title: '',
    statement: row.statement,
    points: row.points,
    submissions: 0,
  }
}
