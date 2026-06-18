import type { Standing, Submission } from './types'

export const standings: Standing[] = [
  {
    contestId: 'geometry-round-1',
    userId: 'u1',
    scoresByProblem: { A: 7, B: 6, C: 5, D: 2 },
    total: 20,
  },
  {
    contestId: 'geometry-round-1',
    userId: 'u4',
    scoresByProblem: { A: 7, B: 5, C: 3, D: null },
    total: 15,
  },
  {
    contestId: 'geometry-round-1',
    userId: 'u6',
    scoresByProblem: { A: 6, B: 4, C: null, D: null },
    total: 10,
  },
  {
    contestId: 'mock-selection-2026',
    userId: 'u2',
    scoresByProblem: { A: 10, B: 7 },
    total: 17,
  },
  {
    contestId: 'mock-selection-2026',
    userId: 'u3',
    scoresByProblem: { A: 8, B: 8 },
    total: 16,
  },
]

export const submissions: Submission[] = [
  {
    id: 's1',
    contestId: 'geometry-round-1',
    userId: 'u4',
    problemIndex: 'A',
    fileName: 'geo-a.pdf',
    submittedAt: '2026-06-15T20:11:00-03:00',
    status: 'Corrigido',
    score: 7,
  },
  {
    id: 's2',
    contestId: 'geometry-round-1',
    userId: 'u4',
    problemIndex: 'C',
    fileName: 'geo-c-v2.pdf',
    submittedAt: '2026-06-15T22:02:00-03:00',
    status: 'Pendente',
    score: null,
  },
]

export function getStandingsByContest(contestId: string) {
  return standings
    .filter((standing) => standing.contestId === contestId)
    .sort((a, b) => b.total - a.total)
}

export function getSubmissionsByContest(contestId: string) {
  return submissions.filter((submission) => submission.contestId === contestId)
}
