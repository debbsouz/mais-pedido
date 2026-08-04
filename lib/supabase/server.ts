import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso EXCLUSIVO no servidor
 * (Server Components, Server Actions, Route Handlers).
 * Lê e grava os cookies de sessão da requisição atual.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Chamado de um Server Component sem proxy de refresh
            // de sessão. Pode ser ignorado nesta fase de fundação.
          }
        },
      },
    }
  )
}
