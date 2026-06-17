import Link from 'next/link'
import Image from 'next/image'
import { isAdminUser } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  let username: string | null = null
  let profileHref: string | null = null
  let isAdmin = false

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      isAdmin = await isAdminUser(supabase, user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()

      username = profile?.username ?? user.email ?? null
      profileHref = `/profile/${encodeURIComponent(profile?.username ?? user.id)}`
    }
  } catch (error) {
    console.warn('Erro ao carregar sessão:', error)
  }

  return (
    <header className="site-header">
      <div className="wrapper header-row">
        <Link href="/" className="logo" aria-label="MathArena">
          <Image
            src="/logo.png"
            alt=""
            className="logo-image"
            width={34}
            height={34}
            priority
          />
          <span>MathArena</span>
        </Link>
        <div className="user-box">
          {username ? (
            <>
              <span className="muted">Logado como</span>
              <Link href={profileHref ?? '/ranking'}>
                <strong>{username}</strong>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="button">
              Entrar
            </Link>
          )}
        </div>
      </div>
      <nav className="top-menu">
        <div className="wrapper menu-row">
          <Link href="/">Início</Link>
          <Link href="/contests">Competições</Link>
          <Link href="/calendar">Calendário</Link>
          <Link href="/ranking">Ranking</Link>
          <Link href="/help">Ajuda</Link>
          {isAdmin ? <Link href="/admin">Admin</Link> : null}
        </div>
      </nav>
    </header>
  )
}
