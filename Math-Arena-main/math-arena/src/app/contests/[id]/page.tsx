import AppShell from '@/components/AppShell'
import ContestRoom from '@/components/ContestRoom'
import ContestTimer from '@/components/ContestTimer'
import JoinContestButton from '@/components/JoinContestButton'
import Panel from '@/components/Panel'
import StatusPill from '@/components/StatusPill'
import { canSubmitToContest } from '@/lib/contest-rules'
import { getContestById } from '@/lib/contests'
import type { Contest } from '@/lib/contests'
import { getAnnouncementsByContest } from '@/lib/mock-data'
import { getProblemsByContest } from '@/lib/problems'
import {
  getStandingsByContest,
  getUserSubmissionsByContest,
} from '@/lib/submissions'
import { createClient } from '@/lib/supabase/server'

export default async function ContestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const contest = await getContestById(supabase, id)

  if (!contest) {
    return (
      <AppShell>
        <Panel title="Competição não encontrada">
          <p className="empty-state">
            Não existe competição com o identificador informado.
          </p>
        </Panel>
      </AppShell>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userId = user?.id ?? null
  let alreadyJoined = false

  if (userId) {
    const { data: participation } = await supabase
      .from('contest_participations')
      .select('id')
      .eq('contest_id', id)
      .eq('user_id', userId)
      .maybeSingle()

    alreadyJoined = Boolean(participation)
  }

  const problems = await getProblemsByContest(supabase, id)
  const [standings, submissions] = await Promise.all([
    getStandingsByContest(supabase, id, problems),
    getUserSubmissionsByContest(supabase, id, userId, problems),
  ])
  const now = new Date()

  return (
    <AppShell
      sidebar={
        <Panel title="Resumo">
          <div className="contest-control-panel">
            <ContestTimer contest={contest} />
            <JoinContestButton
              contestId={id}
              userId={userId}
              alreadyJoined={alreadyJoined}
            />
            <p className="contest-quick-meta">
              {contest.participants} participante(s) - Nível {contest.level}
            </p>
          </div>
        </Panel>
      }
    >
      <section className="panel contest-title-panel">
        <div className="contest-title-row">
          <div>
            <h1>{contest.title}</h1>
            {contest.description ? <p>{contest.description}</p> : null}
          </div>
          <ContestPills contest={contest} />
        </div>
      </section>

      <ContestRoom
        contestId={id}
        problems={problems}
        standings={standings}
        submissions={submissions}
        announcements={getAnnouncementsByContest(id)}
        canSubmit={canSubmitToContest(contest, now)}
      />
    </AppShell>
  )
}

function ContestPills({ contest }: { contest: Contest }) {
  return (
    <div className="contest-pills">
      <StatusPill status={contest.status} />
      {contest.rated ? <StatusPill status="Rated" /> : null}
    </div>
  )
}
