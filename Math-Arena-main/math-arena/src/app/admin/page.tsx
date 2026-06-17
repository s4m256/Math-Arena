import Link from 'next/link'
import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import { getAdminStatus } from '@/lib/admin'
import { getContests } from '@/lib/contests'
import { getProblemsByContest } from '@/lib/problems'
import { getContestRatingStatus } from '@/lib/rating'
import { getAdminSubmissionsByContest } from '@/lib/submissions'
import { createClient } from '@/lib/supabase/server'
import AdminContestForm from './AdminContestForm'
import { applyContestRating, createAnnouncement, gradeSubmission } from './actions'

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ contest?: string }>
}) {
  const supabase = await createClient()
  const { contest: selectedContestId = '' } = (await searchParams) ?? {}
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const adminStatus = await getAdminStatus(supabase, user?.id ?? null)

  if (!user) {
    return (
      <AppShell>
        <Panel title="Admin">
          <p>
            <Link href="/login">Faça login</Link> para gerenciar o site.
          </p>
        </Panel>
      </AppShell>
    )
  }

  if (!adminStatus.isAdmin) {
    return (
      <AppShell>
        <Panel title="Sem permissão">
          <p>Você está logado, mas este usuário ainda não aparece como admin.</p>
          <ul className="compact-list admin-debug-list">
            <li>Email: {user.email}</li>
            <li>ID do usuário: {user.id}</li>
            <li>Projeto Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
            {adminStatus.error ? <li>Erro na consulta: {adminStatus.error}</li> : null}
          </ul>

          <p>Rode este SQL no mesmo projeto Supabase usado pelo site:</p>
          <pre className="code-block">{`insert into public.admin_users (user_id)
values ('${user.id}')
on conflict (user_id) do nothing;`}</pre>
        </Panel>
      </AppShell>
    )
  }

  const contests = await getContests(supabase)
  const selectedContest = contests.find((contest) => contest.id === selectedContestId)
  const selectedProblems = selectedContest
    ? await getProblemsByContest(supabase, selectedContest.id)
    : []
  const adminSubmissions = selectedContest
    ? await getAdminSubmissionsByContest(supabase, selectedContest.id, selectedProblems)
    : []
  const ratingStatus = selectedContest
    ? await getContestRatingStatus(supabase, selectedContest.id)
    : { applied: false, count: 0 }

  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>Admin</h1>
          <p className="subtitle">Crie competições, anúncios e corrija soluções.</p>
        </div>
      </div>

      <Panel title="Nova competição">
        <AdminContestForm />
      </Panel>

      <Panel title="Novo anúncio">
        <form action={createAnnouncement} className="compact-form admin-form">
          <label>
            Título
            <input name="title" required type="text" />
          </label>

          <label>
            Texto
            <textarea name="content" required rows={4} />
          </label>

          <button className="button" type="submit">
            Publicar anúncio
          </button>
        </form>
      </Panel>

      <Panel title="Correção de submissões">
        <form className="compact-form correction-filter" method="get">
          <label>
            Competição
            <select name="contest" defaultValue={selectedContestId}>
              <option value="">Selecione uma competição</option>
              {contests.map((contest) => (
                <option key={contest.id} value={contest.id}>
                  {contest.title}
                </option>
              ))}
            </select>
          </label>
          <button className="button" type="submit">
            Ver submissões
          </button>
        </form>

        {selectedContest ? (
          <>
            <AdminSubmissionsTable
              contestId={selectedContest.id}
              submissions={adminSubmissions}
            />
            <RatingActions
              contestId={selectedContest.id}
              isRated={selectedContest.rated}
              isApplied={ratingStatus.applied}
              updatedCount={ratingStatus.count}
            />
          </>
        ) : (
          <p className="empty-state">Selecione uma competição para corrigir.</p>
        )}
      </Panel>
    </AppShell>
  )
}

function RatingActions({
  contestId,
  isRated,
  isApplied,
  updatedCount,
}: {
  contestId: string
  isRated: boolean
  isApplied: boolean
  updatedCount: number
}) {
  if (!isRated) {
    return <p className="empty-state">Esta competição não altera rating.</p>
  }

  if (isApplied) {
    return (
      <p className="empty-state">
        Rating aplicado para {updatedCount} participante(s).
      </p>
    )
  }

  return (
    <form action={applyContestRating} className="compact-form">
      <input name="contestId" type="hidden" value={contestId} />
      <button className="button" type="submit">
        Aplicar rating
      </button>
    </form>
  )
}

type AdminSubmission = Awaited<ReturnType<typeof getAdminSubmissionsByContest>>[number]

function AdminSubmissionsTable({
  contestId,
  submissions,
}: {
  contestId: string
  submissions: AdminSubmission[]
}) {
  if (submissions.length === 0) {
    return <p className="empty-state">Nenhuma submissão enviada para esta competição.</p>
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Horário</th>
          <th>Usuário</th>
          <th>Problema</th>
          <th>Arquivo</th>
          <th>Status</th>
          <th>Nota</th>
          <th>Corrigir</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <tr key={submission.id}>
            <td>{formatDateTime(submission.submittedAt)}</td>
            <td>{submission.username}</td>
            <td>Problema {submission.problemIndex}</td>
            <td>
              <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                {submission.fileName}
              </a>
            </td>
            <td>{submission.status}</td>
            <td>{submission.score ?? '-'}</td>
            <td>
              <form action={gradeSubmission} className="grade-form">
                <input name="submissionId" type="hidden" value={submission.id} />
                <input name="contestId" type="hidden" value={contestId} />
                <input name="maxScore" type="hidden" value={submission.problemPoints} />
                <input
                  aria-label="Nota"
                  max={submission.problemPoints}
                  min={0}
                  name="score"
                  required
                  step="0.5"
                  type="number"
                />
                <button className="button button-small" type="submit">
                  Salvar
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}
