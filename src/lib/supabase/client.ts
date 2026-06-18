import { createBrowserClient } from '@supabase/ssr'

// Cria um cliente Supabase para rodar no NAVEGADOR.
// Usado em páginas com "use client" (ex: LoginPage).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}