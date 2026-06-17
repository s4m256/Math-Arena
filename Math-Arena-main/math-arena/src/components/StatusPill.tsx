import type { ContestStatus, SubmissionStatus } from '@/lib/mock-data'

type StatusPillProps = {
  status:
    | ContestStatus
    | SubmissionStatus
    | 'Registrado'
    | 'Não registrado'
    | 'Disponível'
    | 'Rated'
}

const statusClassByName: Record<string, string> = {
  Aberto: 'status-success',
  Futuro: 'status-warning',
  Encerrado: 'status-muted',
  Registrado: 'status-success',
  'Não registrado': 'status-muted',
  Disponível: 'status-success',
  Rated: 'status-success',
  Enviado: 'status-warning',
  Corrigido: 'status-success',
  Pendente: 'status-warning',
  Rejeitado: 'status-danger',
}

export default function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`status-pill ${statusClassByName[status] ?? 'status-muted'}`}>
      {status}
    </span>
  )
}
