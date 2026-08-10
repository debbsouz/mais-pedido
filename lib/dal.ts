import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'
import type { PlanId } from '@/lib/plans'
import type { AddonId } from '@/lib/addons'

// ============================================================
// Tipos
// ============================================================

export interface CurrentUserData {
  id: string
  name: string
  role: UserRole
}

export interface CurrentSubscriptionData {
  planId: PlanId
  activeAddons: AddonId[]
}

// ============================================================
// DAL — Data Access Layer
// ============================================================

/**
 * Verifica a sessao do Supabase e retorna os dados do usuario.
 * Se nao houver sessao valida, redireciona para /login.
 *
 * Usa React.cache para memoizar durante um unico render pass.
 */
export const getCurrentUser = cache(
  async (): Promise<CurrentUserData | null> => {
    // Supabase ainda nao configurado (sem .env.local) → sem sessao.
    // Evita que o build quebre antes da etapa de configuracao.
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.log('[DAL] env vars ausentes → null')
      return null
    }

    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log('[DAL] getUser →', { userId: user?.id, error: error?.message })

    if (error || !user) {
      return null
    }

    // Busca o perfil do usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()

    console.log('[DAL] profile →', { profile, error: profileError?.message })

    // Busca o vinculo mais recente (organizacao + cargo)
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    console.log('[DAL] membership →', { membership, error: memberError?.message })

    // Usuario autenticado sem vinculo a nenhuma organizacao
    // NAO recebe acesso ao painel (seguranca: sem cargo = sem acesso).
    if (!membership) {
      console.log('[DAL] sem membership → null')
      return null
    }

    console.log('[DAL] OK →', { id: user.id, name: profile?.full_name, role: membership.role })

    return {
      id: user.id,
      name: profile?.full_name || user.email || 'Usuario',
      role: membership.role as UserRole,
    }
  },
)

/**
 * Busca a assinatura atual da organizacao do usuario.
 *
 * Por enquanto retorna defaults — sera implementado
 * quando a tabela de assinaturas existir.
 */
export const getCurrentSubscription = cache(
  async (): Promise<CurrentSubscriptionData> => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return { planId: 'start', activeAddons: [] }
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { planId: 'start', activeAddons: [] }
    }

    // TODO: buscar assinatura real da tabela subscriptions
    // Por enquanto retorna plano premium para manter
    // compatibilidade com o front atual
    return {
      planId: 'premium',
      activeAddons: [],
    }
  },
)

/**
 * Combina getCurrentUser + redirect.
 * Chamado no layout do painel para garantir autenticacao
 * no servidor antes de renderizar qualquer pagina protegida.
 */
export async function requireAuth(): Promise<CurrentUserData> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}
