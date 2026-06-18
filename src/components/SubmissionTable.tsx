import type { Submission } from '@/lib/mock-data'
import EmptyState from './EmptyState'
import StatusPill from './StatusPill'

type SubmissionTableProps = {
  submissions: Submission[]
}

export default function SubmissionTable({ submissions }: SubmissionTableProps) {
  if (submissions.length === 0) {
    return <EmptyState message="Você ainda não enviou soluções para esta competição." />
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Horário</th>
          <th>Problema</th>
          <th>Arquivo</th>
          <th>Status</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission) => (
          <tr key={submission.id}>
            <td>{formatDateTime(submission.submittedAt)}</td>
            <td>{submission.problemIndex}</td>
            <td>
              {submission.fileUrl ? (
                <a href={submission.fileUrl} target="_blank" rel="noreferrer">
                  {submission.fileName}
                </a>
              ) : (
                submission.fileName
              )}
            </td>
            <td>
              <StatusPill status={submission.status} />
            </td>
            <td>{submission.score ?? '-'}</td>
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
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
