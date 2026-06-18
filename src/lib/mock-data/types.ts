export type ContestStatus = 'Aberto' | 'Futuro' | 'Encerrado'
export type ContestLevel = '1' | '2' | '3' | 'U'
export type SubmissionStatus = 'Enviado' | 'Corrigido' | 'Pendente' | 'Rejeitado'

export type Contest = {
  id: string
  title: string
  status: ContestStatus
  startTime: string
  duration: string
  problemCount: number
  scoringScale: '0-7' | '0-10'
  level: ContestLevel
  participants: number
  rated: boolean
  description: string
}

export type Problem = {
  id: string
  contestId: string
  index: string
  title: string
  statement: string
  points: number
  submissions: number
  solved?: boolean
}

export type RatedUser = {
  id: string
  username: string
  rating: number
  contests: number
  maxRating: number
  bio: string
  joinedAt: string
  ratingHistory: RatingPoint[]
}

export type RatingPoint = {
  date: string
  rating: number
}

export type Standing = {
  contestId: string
  userId: string
  username?: string
  rating?: number
  scoresByProblem: Record<string, number | null>
  total: number
}

export type Announcement = {
  id: string
  contestId?: string
  title: string
  content: string
  createdAt: string
}

export type Submission = {
  id: string
  contestId: string
  userId: string
  problemIndex: string
  fileName: string
  fileUrl?: string
  submittedAt: string
  status: SubmissionStatus
  score: number | null
}
