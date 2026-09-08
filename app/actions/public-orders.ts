'use server'

import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

async function getClientIp(): Promise<string> {
  const headerList = await headers()

  const forwardedFor = headerList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return headerList.get('x-real-ip') ?? 'unknown'
}

// ============================================================
// Pedido criado por visitante da loja pública (sem sessão).
//
// Diferente de app/actions/orders.ts (createOrder), que exige
// sessão de equipe (requireOrderCreate), esta action é chamável
// por qualquer visitante de /loja/[slug]. A segurança fica por
// conta da RLS (migration 20260825_014_loja_publica_leitura_e_pedido.sql):
// só é permitido inserir pedido com origin = 'Site'.
// ============================================================

export type PublicOrderActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

export interface PublicOrderItemInput {
  productId: string
  name: string
  quantity: number
}

export type PublicOrderFulfillment = 'delivery' | 'pickup' | 'dine-in'
export type PublicOrderPaymentMethod = 'pix' | 'card' | 'cash'

export interface PublicOrderAddressInput {
  zipCode?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city?: string
}

export interface CreatePublicOrderInput {
  organizationId: string
  customerName: string
  customerPhone?: string
  fulfillment: PublicOrderFulfillment
  tableNumber?: string
  address?: PublicOrderAddressInput
  paymentMethod?: PublicOrderPaymentMethod
  items: PublicOrderItemInput[]
  couponCode?: string
  /** ISO 8601. Omitido = pedido pra agora. */
  scheduledFor?: string
}

export interface PublicCouponCheckResult {
  valid: boolean
  discountCents: number
  errorMessage: string | null
}

const couponErrorMessages: Record<string, string> = {
  not_found: 'Cupom inválido ou não encontrado.',
  below_minimum: 'Pedido não atinge o mínimo exigido por este cupom.',
}

/**
 * Valida um cupom pra prévia no carrinho (sem criar pedido nenhum).
 * O desconto final é sempre recalculado de novo, no servidor, na
 * hora de criar o pedido de verdade — nunca confia no que voltou
 * aqui pra gravar o total.
 */
export async function checkPublicCoupon(
  organizationId: string,
  code: string,
  subtotalCents: number,
): Promise<PublicCouponCheckResult> {
  if (!organizationId || !code.trim()) {
    return {
      valid: false,
      discountCents: 0,
      errorMessage: 'Informe um cupom.',
    }
  }

  const supabase = await createClient()

  const { data } = await supabase
    .rpc('validate_public_coupon', {
      p_organization_id: organizationId,
      p_code: code.trim(),
      p_subtotal_cents: subtotalCents,
    })
    .single()

  const result = data as {
    valid: boolean
    discount_cents: number
    error_code: string | null
    min_order_cents: number
  } | null

  if (!result || !result.valid) {
    const code = result?.error_code ?? 'not_found'
    const message =
      code === 'below_minimum' && result
        ? `Pedido mínimo de ${(result.min_order_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para usar este cupom.`
        : couponErrorMessages[code] ?? 'Cupom inválido.'

    return { valid: false, discountCents: 0, errorMessage: message }
  }

  return {
    valid: true,
    discountCents: result.discount_cents,
    errorMessage: null,
  }
}

const fulfillmentByStorefrontValue: Record<
  PublicOrderFulfillment,
  string
> = {
  delivery: 'Delivery',
  pickup: 'Retirada',
  'dine-in': 'Mesa',
}

const paymentMethodByStorefrontValue: Record<
  PublicOrderPaymentMethod,
  string
> = {
  pix: 'Pix',
  card: 'Crédito',
  cash: 'Dinheiro',
}

function toSafeError(
  error: { code?: string; message?: string } | null,
  fallback: string,
): string {
  if (!error) {
    return fallback
  }

  switch (error.code) {
    case '23505':
      return 'Já existe um pedido com essa identificação.'
    case '23503':
      return 'Referência inválida.'
    case '42501':
      return 'Não foi possível registrar o pedido.'
    default:
      return fallback
  }
}

export async function createPublicOrder(
  input: CreatePublicOrderInput,
): Promise<PublicOrderActionResult<{ id: string }>> {
  if (!input.organizationId) {
    return { success: false, error: 'Loja inválida.' }
  }

  if (!input.customerName.trim()) {
    return { success: false, error: 'Informe seu nome.' }
  }

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Adicione pelo menos um item ao pedido.' }
  }

  let scheduledFor: string | null = null

  if (input.scheduledFor) {
    const parsed = new Date(input.scheduledFor)
    const minLeadTime = Date.now() + 30 * 60 * 1000

    if (Number.isNaN(parsed.getTime()) || parsed.getTime() < minLeadTime) {
      return {
        success: false,
        error: 'Escolha um horário pelo menos 30 minutos à frente.',
      }
    }

    scheduledFor = parsed.toISOString()
  }

  const supabase = await createClient()

  // Limite de pedidos por visitante (evita spam de pedido falso).
  const clientIp = await getClientIp()

  const { data: allowed } = await supabase.rpc(
    'check_and_log_order_attempt',
    { client_ip: clientIp },
  )

  if (!allowed) {
    return {
      success: false,
      error:
        'Muitos pedidos em pouco tempo. Aguarde alguns minutos e tente novamente.',
    }
  }

  // Revalida o preco de cada item contra o catalogo real, em vez
  // de confiar no valor enviado pelo navegador.
  const productIds = Array.from(
    new Set(input.items.map((item) => item.productId).filter(Boolean)),
  )

  const { data: catalogProducts } = await supabase
    .from('products')
    .select('id, price')
    .eq('organization_id', input.organizationId)
    .eq('is_available', true)
    .in('id', productIds)

  const realPriceByProductId = new Map(
    (catalogProducts ?? []).map((product) => [
      product.id as string,
      product.price as number,
    ]),
  )

  if (realPriceByProductId.size !== productIds.length) {
    return {
      success: false,
      error: 'Um ou mais itens não estão mais disponíveis.',
    }
  }

  const verifiedItems = input.items.map((item) => ({
    ...item,
    priceCents: realPriceByProductId.get(item.productId) as number,
  }))

  const subtotalCents = verifiedItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  )

  // Revalida o cupom de novo aqui, com o subtotal calculado no
  // servidor — o desconto mostrado no carrinho é só uma prévia, o
  // que efetivamente é gravado vem desta checagem.
  let discountCents = 0
  let couponCode: string | null = null

  if (input.couponCode?.trim()) {
    const { data: couponResult } = await supabase
      .rpc('validate_public_coupon', {
        p_organization_id: input.organizationId,
        p_code: input.couponCode.trim(),
        p_subtotal_cents: subtotalCents,
      })
      .single()

    const result = couponResult as {
      valid: boolean
      discount_cents: number
    } | null

    if (!result?.valid) {
      return {
        success: false,
        error:
          'O cupom aplicado não é mais válido. Remova-o e tente novamente.',
      }
    }

    discountCents = result.discount_cents
    couponCode = input.couponCode.trim().toUpperCase()
  }

  const totalCents = Math.max(0, subtotalCents - discountCents)

  // Gera o id no servidor em vez de usar .select() após o insert:
  // visitante anônimo não tem permissão de LEITURA em orders (só
  // membro da organização pode ler pedido, com nome/telefone do
  // cliente), e um INSERT ... RETURNING também passa pela RLS de
  // SELECT — por isso o id precisa ser conhecido de antemão.
  const orderId = crypto.randomUUID()

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    organization_id: input.organizationId,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone?.trim() || null,
    origin: 'Site',
    fulfillment: fulfillmentByStorefrontValue[input.fulfillment],
    status: 'new',
    table_number: input.tableNumber?.trim() || null,
    address:
      input.fulfillment === 'delivery' && input.address
        ? {
            zipCode: input.address.zipCode?.trim() ?? '',
            street: input.address.street.trim(),
            number: input.address.number.trim(),
            complement: input.address.complement?.trim() ?? '',
            neighborhood: input.address.neighborhood.trim(),
            city: input.address.city?.trim() ?? '',
          }
        : null,
    payment: input.paymentMethod
      ? { method: paymentMethodByStorefrontValue[input.paymentMethod] }
      : null,
    total_cents: totalCents,
    coupon_code: couponCode,
    discount_cents: discountCents,
    scheduled_for: scheduledFor,
  })

  if (orderError) {
    return {
      success: false,
      error: toSafeError(orderError, 'Não foi possível criar o pedido.'),
    }
  }

  const orderItems = verifiedItems.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    name: item.name,
    price_cents: item.priceCents,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    return {
      success: false,
      error: toSafeError(
        itemsError,
        'Não foi possível adicionar os itens ao pedido.',
      ),
    }
  }

  // Desconta estoque dos produtos com controle ativado. Best-effort:
  // se falhar, o pedido já foi criado com sucesso — não bloqueia o
  // cliente por causa de um ajuste de estoque.
  await supabase.rpc('apply_order_stock_deductions', {
    p_order_id: orderId,
  })

  // Cadastra o cliente automaticamente (por telefone) se ainda não
  // existir — best-effort, igual ao desconto de estoque acima.
  if (input.customerPhone?.trim()) {
    await supabase.rpc('upsert_customer_from_order', {
      p_organization_id: input.organizationId,
      p_name: input.customerName.trim(),
      p_phone: input.customerPhone.trim(),
    })
  }

  return { success: true, data: { id: orderId } }
}

// ============================================================
// Consulta de status por id (aba "Pedidos" da loja pública).
//
// O navegador guarda o id do pedido (UUID, não adivinhável) após
// criar. Esta função nunca devolve nome/telefone/endereço do
// cliente — só o necessário para acompanhar o andamento.
// ============================================================

export interface PublicOrderStatus {
  id: string
  number: number
  status: string
  fulfillment: string
  createdAt: string
  totalCents: number
}

export async function getPublicOrderStatus(
  orderId: string,
): Promise<PublicOrderStatus | null> {
  const supabase = await createClient()

  const { data } = (await supabase
    .rpc('get_public_order_status', { p_order_id: orderId })
    .single()) as { data: Record<string, unknown> | null }

  if (!data) {
    return null
  }

  return {
    id: data.id as string,
    number: data.number as number,
    status: data.status as string,
    fulfillment: data.fulfillment as string,
    createdAt: data.created_at as string,
    totalCents: data.total_cents as number,
  }
}
