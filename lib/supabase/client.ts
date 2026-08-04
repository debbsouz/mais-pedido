import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso EXCLUSIVO no navegador
 * (Client Components, formulários, eventos do usuário).
 * Usa a URL e a chave anon (pública) do .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
