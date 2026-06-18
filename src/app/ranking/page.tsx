import Link from 'next/link'
import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import RatingUsername from '@/components/RatingUsername'
import { getRankingProfiles } from '@/lib/ranking'
import { createClient } from '@/lib/supabase/server'

export default async function RankingPage() {
  const supabase = await createClient()
  const rankedUsers = await getRankingProfiles(supabase)

  return (
    <AppShell>
      <div className="page-title">
        <div>
          <h1>Ranking</h1>
          <p className="subtitle">Ranking global do MathArena.</p>
        </div>
      </div>

      <Panel title="Ranking">
        <table className="table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Usuário</th>
              <th>Rating</th>
              <th>Competições</th>
            </tr>
          </thead>
          <tbody>
            {rankedUsers.length === 0 ? (
              <tr>
                <td colSpan={4}>Nenhum usuário no ranking ainda.</td>
              </tr>
            ) : (
              rankedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    <Link href={`/profile/${encodeURIComponent(user.username)}`}>
                      <RatingUsername username={user.username} rating={user.rating} />
                    </Link>
                  </td>
                  <td>{user.rating ?? '-'}</td>
                  <td>{user.contests}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Panel>
    </AppShell>
  )
}
