import Link from 'next/link'
import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import StatusPill from '@/components/StatusPill'
import { getDurationMinutes } from '@/lib/contest-rules'
import { getContests } from '@/lib/contests'
import type { Contest } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/server'

export default async function ContestsPage() {
  const supabase = await createClient()
  const contests = await getContests(supabase)
  const openContests = contests.filter((contest) => contest.status === 'Aberto')
  const futureContests = contests.filter((contest) => contest.status === 'Futuro')
  const closedContests = contests.filter((contest) => contest.status === 'Encerrado')

  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>Competições</h1>
          <p className="subtitle">Rodadas abertas, futuras e encerradas.</p>
        </div>
      </div>

      <ContestSection title="Competições abertas" contests={openContests} empty="Nenhuma competição aberta." />
      <ContestSection title="Competições futuras" contests={futureContests} empty="Nenhuma competição futura." />
      <ContestSection title="Competições encerradas" contests={closedContests} empty="Nenhuma competição encerrada." />
    </AppShell>
  )
}

function ContestSection({
  title,
  contests,
  empty,
}: {
  title: string
  contests: Contest[]
  empty: string
}) {
  return (
    <Panel title={title}>
      <div className="contest-list">
        {contests.length > 0 ? (
          contests.map((contest) => <ContestBlock key={contest.id} contest={contest} />)
        ) : (
          <p className="empty-state">{empty}</p>
        )}
      </div>
    </Panel>
  )
}

function ContestBlock({ contest }: { contest: Contest }) {
  const start = new Date(contest.startTime)
  const end = addDuration(start, contest.duration)

  return (
    <article className="contest-block">
      <div className="contest-card-header">
        <h2>
          <Link href={`/contests/${contest.id}`}>{contest.title}</Link>{' '}
          {contest.rated ? <span className="muted">(Com rating)</span> : null}
        </h2>
        <StatusPill status={contest.status} />
      </div>

      {contest.description ? <p>{contest.description}</p> : null}

      <div className="contest-lines">
        <div>
          <strong>Início:</strong> {start.toString()}
        </div>
        <div>
          <strong>Fim:</strong> {end.toString()}
        </div>
      </div>

      <div className="contest-stats">
        <div>
          <span className="muted">Participantes</span>
          <strong>{contest.participants}</strong>
        </div>
        <div>
          <span className="muted">Duração</span>
          <strong>{contest.duration}</strong>
        </div>
        <div>
          <span className="muted">Nível</span>
          <strong>{contest.level}</strong>
        </div>
      </div>
    </article>
  )
}

function addDuration(start: Date, duration: string) {
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + getDurationMinutes(duration))
  return end
}
