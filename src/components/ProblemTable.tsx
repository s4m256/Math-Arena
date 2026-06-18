import type { Problem } from '@/lib/mock-data'
import StatusPill from './StatusPill'

type ProblemTableProps = {
  problems: Problem[]
  selectedProblemId?: string
  onSelectProblem?: (problemId: string) => void
}

export default function ProblemTable({
  problems,
  selectedProblemId,
  onSelectProblem,
}: ProblemTableProps) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Pontos</th>
          <th>Submissões</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {problems.map((problem) => (
          <tr
            key={problem.id}
            className={problem.id === selectedProblemId ? 'selected-row' : undefined}
          >
            <td>{problem.index}</td>
            <td>
              <button
                className="link-button"
                onClick={() => onSelectProblem?.(problem.id)}
                type="button"
              >
                {formatProblemLabel(problem)}
              </button>
            </td>
            <td>{problem.points}</td>
            <td>{problem.submissions}</td>
            <td>
              {problem.solved ? (
                <StatusPill status="Corrigido" />
              ) : (
                <span className="muted">-</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatProblemLabel(problem: Problem) {
  return problem.title || `Problema ${problem.index}`
}
