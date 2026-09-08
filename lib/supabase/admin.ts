import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com a chave service_role — ignora TODAS as
 * regras de RLS. Uso EXCLUSIVO em Server Actions/rotas de servidor,
 * pra operações que a chave anon não permite (hoje: criar/convidar
 * usuário de autenticação — auth.admin.*).
 *
 * NUNCA importar isso de um Client Component. O `import 'server-only'`
 * acima já faz o build falhar se isso acontecer por engano.
 *
 * Diferente de lib/supabase/server.ts: esse cliente não lê/escreve
 * cookies de sessão — não representa o usuário logado, representa o
 * próprio backend do +Pedido.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY não configurada — veja .env.example.',
    )
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
