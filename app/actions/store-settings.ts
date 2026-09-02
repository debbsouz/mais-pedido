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
  name: string
  cnpj: string | null
  phone: string | null
  isOpen: boolean
  minOrderCents: number
  instagramUrl: string | null
  pixKey: string | null
  pixKeyType: string | null
  acceptedCardBrands: string[]
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
      'slug, name, cnpj, phone, is_open, min_order_cents, instagram_url, pix_key, pix_key_type, accepted_card_brands',
    )
    .eq('id', context.organizationId)
    .single()

  if (!data) {
    return null
  }

  return {
    slug: data.slug,
    name: data.name,
    cnpj: data.cnpj,
    phone: data.phone,
    isOpen: data.is_open,
    minOrderCents: data.min_order_cents,
    instagramUrl: data.instagram_url,
    pixKey: data.pix_key,
    pixKeyType: data.pix_key_type,
    acceptedCardBrands: data.accepted_card_brands ?? [],
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
}

/**
 * Pedido mínimo e Instagram — o WhatsApp não é cadastrado aqui, vem
 * do telefone em Estabelecimento, e o Facebook foi removido (a loja
 * pública já tem um botão de compartilhar próprio).
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

export interface UpdateEstabelecimentoInput {
  name: string
  cnpj: string
  phone: string
}

export async function updateEstabelecimento(
  input: UpdateEstabelecimentoInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!input.name.trim()) {
    return { success: false, error: 'Informe o nome da empresa.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      name: input.name.trim(),
      cnpj: input.cnpj.trim() || null,
      phone: input.phone.trim() || null,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar o estabelecimento.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

export interface UpdatePaymentSettingsInput {
  acceptedCardBrands: string[]
}

/**
 * Bandeiras de cartão aceitas na entrega. A chave Pix NÃO é editada
 * por aqui: o pagamento automático via Pix é configurado direto no
 * Mercado Pago pela Next Code no momento em que cadastra o cliente
 * (FAZER MANUAL NO SUPABASE, colunas pix_key/pix_key_type) — quem
 * confirma o pagamento é o banco, não o dono do restaurante digitando
 * uma chave aqui. Esta tela só exibe o status (ver getStoreSettings).
 */
export async function updatePaymentSettings(
  input: UpdatePaymentSettingsInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      accepted_card_brands: input.acceptedCardBrands,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar as formas de pagamento.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
