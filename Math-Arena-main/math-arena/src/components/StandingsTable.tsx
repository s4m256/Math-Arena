import type { Problem, Standing } from '@/lib/mock-data'
import RatingUsername from './RatingUsername'

type StandingsTableProps = {
  standings: Standing[]
  problems: Problem[]
}

export default function StandingsTable({ standings, problems }: StandingsTableProps) {
  return (
    <table className="table standings-table">
      <thead>
        <tr>
          <th>Posição</th>
          <th>Usuário</th>
          <th>Rating</th>
          {problems.map((problem) => (
            <th key={problem.id}>{problem.index}</th>
          ))}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {standings.length === 0 ? (
          <tr>
            <td colSpan={problems.length + 4}>
              Nenhuma submissão corrigida ainda.
            </td>
          </tr>
        ) : (
          standings.map((standing, index) => (
            <tr key={standing.userId}>
              <td>{index + 1}</td>
              <td>
                <RatingUsername
                  username={standing.username ?? standing.userId.slice(0, 8)}
                  rating={standing.rating}
                />
              </td>
              <td>{standing.rating ?? '-'}</td>
              {problems.map((problem) => (
                <td key={problem.id}>
                  {standing.scoresByProblem[problem.index] ?? '-'}
                </td>
              ))}
              <td>
                <strong>{standing.total}</strong>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
