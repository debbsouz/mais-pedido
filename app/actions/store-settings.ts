'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentSubscription } from '@/lib/dal'
import { getOrdersContext } from '@/lib/orders-dal'
import { hasFeature } from '@/lib/access'
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
  metaPixelId: string | null
  googleAdsId: string | null
  logoUrl: string | null
  bannerUrl: string | null
  cashbackEnabled: boolean
  cashbackPercent: number | null
  cashbackMinOrderCents: number | null
  cashbackMinRedeemCents: number | null
  mercadoPagoConfigured: boolean
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
      'slug, name, cnpj, phone, is_open, min_order_cents, instagram_url, pix_key, pix_key_type, accepted_card_brands, meta_pixel_id, google_ads_id, logo_url, banner_url, cashback_enabled, cashback_percent, cashback_min_order_cents, cashback_min_redeem_cents, mercado_pago_access_token',
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
    metaPixelId: data.meta_pixel_id,
    googleAdsId: data.google_ads_id,
    logoUrl: data.logo_url,
    bannerUrl: data.banner_url,
    cashbackEnabled: data.cashback_enabled,
    cashbackPercent: data.cashback_percent,
    cashbackMinOrderCents: data.cashback_min_order_cents,
    cashbackMinRedeemCents: data.cashback_min_redeem_cents,
    // Nunca devolve a chave em si pro navegador — só se está
    // configurada ou não.
    mercadoPagoConfigured: Boolean(
      data.mercado_pago_access_token,
    ),
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
 * Bandeiras de cartão aceitas na entrega. A chave do Mercado Pago
 * NÃO é editada por aqui: o próprio dono do restaurante pega a
 * "Chave de acesso" dele direto no Mercado Pago (Configurações →
 * seu perfil → Suas integrações → Credenciais) e passa pra Next
 * Code, que cola no cadastro dele (FAZER MANUAL NO SUPABASE, coluna
 * organizations.mercado_pago_access_token — ver
 * docs/ONBOARDING_NOVA_EMPRESA.md). O dinheiro cai direto na conta
 * de cada restaurante, nunca passa pela Next Code. Esta tela só
 * exibe se está configurado ou não (ver getStoreSettings).
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

export interface UpdateAdsSettingsInput {
  metaPixelId: string
  googleAdsId: string
}

/**
 * IDs de rastreamento (Pixel do Meta / tag do Google Ads). O
 * +Pedido não gerencia campanha nenhuma — só injeta esses scripts
 * reais na loja pública quando preenchidos, pra quem já anuncia
 * conseguir medir o que converteu.
 */
export async function updateAdsSettings(
  input: UpdateAdsSettingsInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const metaPixelId = input.metaPixelId.trim()
  const googleAdsId = input.googleAdsId.trim()

  // Validação estrita: esses valores são injetados dentro de um
  // <script> na loja pública (AdsTracking.tsx). Só dígitos e
  // "AW-"/"G-"/"UA-" + alfanumérico/hífen são formatos reais de
  // Pixel/Google Ads — qualquer outra coisa é rejeitada, nunca
  // salva no banco.
  if (metaPixelId && !/^\d+$/.test(metaPixelId)) {
    return {
      success: false,
      error: 'Pixel do Meta deve conter só números.',
    }
  }

  if (googleAdsId && !/^[A-Za-z0-9-]+$/.test(googleAdsId)) {
    return {
      success: false,
      error: 'ID do Google Ads inválido.',
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      meta_pixel_id: metaPixelId || null,
      google_ads_id: googleAdsId || null,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar a integração com anúncios.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

export interface UpdateBrandingInput {
  logoUrl: string | null
  bannerUrl: string | null
}

/**
 * Logo e banner exibidos na loja pública. O upload em si (Supabase
 * Storage, bucket organization-branding) acontece no navegador —
 * aqui só salva a URL pública já gerada. `null` remove a imagem
 * (volta pro estado sem logo/banner).
 */
export async function updateBrandingSettings(
  input: UpdateBrandingInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      logo_url: input.logoUrl,
      banner_url: input.bannerUrl,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar a identidade visual.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

export interface UpdateCashbackSettingsInput {
  enabled: boolean
  percent: number | null
  minOrderCents: number | null
  minRedeemCents: number | null
}

/**
 * Cada organização define sua própria regra de cashback — não existe
 * um percentual único que sirva pra todo mundo. Só liga quem tem o
 * recurso no plano contratado (Essencial+, ver lib/plans.ts).
 */
export async function updateCashbackSettings(
  input: UpdateCashbackSettingsInput,
): Promise<StoreSettingsActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (input.enabled) {
    const subscription = await getCurrentSubscription()

    if (!hasFeature(subscription.planId, 'cashback')) {
      return {
        success: false,
        error: 'Seu plano atual não inclui cashback.',
      }
    }

    if (
      !Number.isInteger(input.percent) ||
      (input.percent as number) < 1 ||
      (input.percent as number) > 100
    ) {
      return {
        success: false,
        error: 'Informe um percentual entre 1 e 100.',
      }
    }
  }

  if (
    input.minOrderCents !== null &&
    (!Number.isInteger(input.minOrderCents) || input.minOrderCents < 0)
  ) {
    return { success: false, error: 'Pedido mínimo inválido.' }
  }

  if (
    input.minRedeemCents !== null &&
    (!Number.isInteger(input.minRedeemCents) || input.minRedeemCents < 0)
  ) {
    return { success: false, error: 'Saldo mínimo inválido.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('organizations')
    .update({
      cashback_enabled: input.enabled,
      cashback_percent: input.enabled ? input.percent : null,
      cashback_min_order_cents: input.minOrderCents,
      cashback_min_redeem_cents: input.minRedeemCents,
    })
    .eq('id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar as configurações de cashback.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
