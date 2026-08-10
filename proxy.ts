import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy do +Pedido (Next.js 16 — substitui middleware).
 *
 * Responsabilidade: renovar a sessao do Supabase a cada requisicao.
 * Protecao de rotas e verificacao de permissao ficam no
 * Server Component (layout) e no PanelAccessGuard (client).
 */
export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Renova a sessao (refresh do access token).
  // Se a sessao estiver expirada ou invalida, o cookie sera limpo.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}
