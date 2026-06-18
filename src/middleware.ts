import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// O middleware roda antes de cada página ser carregada.
// Ele renova automaticamente a sessão do usuário logado.
// Sem isso, o usuário seria deslogado a cada visita.
export async function middleware(request: NextRequest) {
  // Começa criando uma resposta normal
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies tanto no request quanto no response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Essa chamada é o que renova a sessão.
  // Nunca remova essa linha!
  await supabase.auth.getUser()

  return supabaseResponse
}

// Define em quais rotas o middleware roda.
// Basicamente: em tudo, exceto arquivos estáticos.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}