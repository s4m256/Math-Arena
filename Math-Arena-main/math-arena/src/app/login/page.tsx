'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error('Erro ao fazer login:', error)
        setError(getAuthErrorMessage(error.message))
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Erro inesperado ao fazer login:', error)
      setError('Não foi possível conectar ao Supabase. Confira o .env.local.')
    }

    setLoading(false)
  }

  async function handleSignup() {
    setLoading(true)
    setError('')

    if (!username.trim()) {
      setError('Digite um nome de usuário.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signupError) {
      console.error('Erro ao criar conta:', signupError)
      setError(getAuthErrorMessage(signupError.message))
      setLoading(false)
      return
    }

    if (!data.session) {
      setError(
        'Conta criada. Confirme seu email antes de fazer login ou desative a confirmação por email no Supabase.'
      )
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username: username.trim() })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        setError(
          'Não foi possível criar o perfil. Confira as políticas RLS da tabela profiles.'
        )
        setLoading(false)
        return
      }
    }

    router.push('/')
    router.refresh()
    setLoading(false)
  }

  return (
    <main className="wrapper page-shell login-page">
      <section className="panel login-card">
        <div className="panel-header">
          <Link href="/" className="logo">
            MathArena
          </Link>
        </div>
        <div className="panel-body">
          <div className="tab-bar">
            <button
              className={!isSignup ? 'tab active' : 'tab'}
              onClick={() => setIsSignup(false)}
              type="button"
            >
              Login
            </button>
            <button
              className={isSignup ? 'tab active' : 'tab'}
              onClick={() => setIsSignup(true)}
              type="button"
            >
              Cadastro
            </button>
          </div>

          <div className="compact-form login-form">
            {isSignup ? (
              <label>
                Nome de usuário
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
            ) : null}

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    if (isSignup) {
                      handleSignup()
                    } else {
                      handleLogin()
                    }
                  }
                }}
              />
            </label>

            {error ? <p className="form-message danger">{error}</p> : null}

            <button
              className="button"
              onClick={isSignup ? handleSignup : handleLogin}
              disabled={loading}
              type="button"
            >
              {loading ? 'Carregando...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Email ainda não confirmado. Confirme pelo link enviado ou desative a confirmação por email no Supabase.'
  }

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Email ou senha incorretos, ou esse usuário ainda não foi cadastrado.'
  }

  if (normalizedMessage.includes('signup disabled')) {
    return 'Cadastro desativado no Supabase. Ative Email em Authentication > Providers.'
  }

  if (normalizedMessage.includes('password')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }

  return message
}
