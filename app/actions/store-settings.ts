'use server'

import { revalidatePath } from 'next/cache'

import { getOrdersContext } from '@/lib/orders-dal'
import { roleHasPermission } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export type StoreSettingsActionResult =
  | { success: true }
  | { success: false; error: string }

export interface StoreSettings {
  slug: string
  isOpen: boolean
  minOrderCents: number
  instagramUrl: string | null
  facebookUrl: string | null
  whatsappUrl: string | null
}

/**
 * Lê a configuração da própria organização do usuário logado
 * (painel de gestão, não a loja pública).
 */
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const context = await getOrdersContext()

  if (!context) {
    return null
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('organizations')
    .select(
      'slug, is_open, min_order_cents, instagram_url, facebook_url, whatsapp_url',
    )
    .eq('id', context.organizationId)
    .single()

  if (!data) {
    return null
  }

  return {
    slug: data.slug,
    isOpen: data.is_open,
    minOrderCents: data.min_order_cents,
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
    whatsappUrl: data.whatsapp_url,
  }
}

/**
 * Abrir/fechar a loja. Qualquer membro ativo da equipe pode
 * alternar (mesmo comportamento de antes, quando isso só existia
 * no localStorage) — não é uma configuração "profunda", é uma
 * ação operacional do dia a dia.
 */
export async function updateStoreStatus(
  isOpen: boolean,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({ is_open: isOpen })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível atualizar o status da loja.',
    }
  }

  return { success: true }
}

export interface UpdateStoreSettingsInput {
  minOrderCents: number
  instagramUrl: string
  facebookUrl: string
  whatsappUrl: string
}

/**
 * Pedido mínimo e redes sociais — configuração de verdade, só
 * quem tem permissão de Configurações (hoje: proprietário).
 */
export async function updateStoreSettings(
  input: UpdateStoreSettingsInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (input.minOrderCents < 0) {
    return {
      success: false,
      error: 'Pedido mínimo não pode ser negativo.',
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      min_order_cents: input.minOrderCents,
      instagram_url: input.instagramUrl.trim() || null,
      facebook_url: input.facebookUrl.trim() || null,
      whatsapp_url: input.whatsappUrl.trim() || null,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar as configurações.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
