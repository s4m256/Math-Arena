import AppShell from '@/components/AppShell'
import Panel from '@/components/Panel'
import RatingUsername from '@/components/RatingUsername'
import { getRankingProfileByUsername } from '@/lib/ranking'
import { createClient } from '@/lib/supabase/server'

type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username: rawUsername } = await params
  const username = decodeURIComponent(rawUsername)
  const supabase = await createClient()
  const profile =
    (await getRankingProfileByUsername(supabase, username)) ??
    (await getCurrentUserProfileFallback(supabase, username)) ??
    createEmptyProfile(username)

  return (
    <AppShell>
      <Panel title="Perfil">
        <h1>
          <RatingUsername username={profile.username} rating={profile.rating} />
        </h1>
        {profile.bio ? <p>{profile.bio}</p> : null}
      </Panel>

      <Panel title="Informações">
        <dl className="profile-stats">
          <div>
            <dt>Rating atual</dt>
            <dd>{profile.rating ?? '-'}</dd>
          </div>
          <div>
            <dt>Maior rating</dt>
            <dd>{profile.maxRating ?? '-'}</dd>
          </div>
          <div>
            <dt>Competições</dt>
            <dd>{profile.contests}</dd>
          </div>
          <div>
            <dt>Entrou em</dt>
            <dd>{profile.joinedAt ? formatDate(profile.joinedAt) : '-'}</dd>
          </div>
        </dl>
      </Panel>

      <Panel title="Rating ao longo do tempo">
        <p>O histórico de rating ainda não está disponível.</p>
      </Panel>
    </AppShell>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value))
}

async function getCurrentUserProfileFallback(
  supabase: Awaited<ReturnType<typeof createClient>>,
  handle: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || (handle !== user.id && handle !== user.email)) return null

  return {
    id: user.id,
    username: user.email ?? user.id,
    rating: null,
    maxRating: null,
    contests: 0,
    bio: '',
    joinedAt: user.created_at ?? null,
  }
}

function createEmptyProfile(handle: string) {
  return {
    id: handle,
    username: handle,
    rating: null,
    maxRating: null,
    contests: 0,
    bio: '',
    joinedAt: null,
  }
}
