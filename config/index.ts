/**
 * Configurações do +Pedido.
 *
 * Centraliza valores de configuração lidos de variáveis de ambiente.
 * Valores sensíveis sempre vêm de variáveis de ambiente.
 */

// ============================================================
// Supabase
// ============================================================

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
}

// ============================================================
// Aplicação
// ============================================================

export const appConfig = {
  env: process.env.NODE_ENV ?? 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
}

// ============================================================
// Configuração consolidada
// ============================================================

export const config = {
  supabase: supabaseConfig,
  app: appConfig,
} as const
