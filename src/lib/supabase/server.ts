import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cria um cliente Supabase para rodar no SERVIDOR.
// Usado em Server Components.
// É "async" porque precisa esperar os cookies do Next.js.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê todos os cookies da requisição atual
        getAll() {
          return cookieStore.getAll()
        },
        // Salva os cookies de sessão
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components não podem setar cookies diretamente,
            // mas o middleware cuida disso. Pode ignorar esse erro.
          }
        },
      },
    }
  )
}
