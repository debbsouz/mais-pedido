'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getOrdersContext } from '@/lib/orders-dal'
import { roleHasPermission } from '@/lib/roles'

// ============================================================
// Tipos de retorno (padrao unico do projeto)
// ============================================================

export type OrderActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// Entradas tipadas
// ============================================================

export interface OrderItemInput {
  productId?: string | null
  name: string
  priceCents: number
  quantity: number
}

export interface OrderAddressInput {
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
}

export interface OrderPaymentInput {
  method: string
  cardBrand?: string | null
  needsCardMachine?: boolean
  changeFor?: string
  observation?: string
}

export interface CreateOrderInput {
  customerName: string
  customerPhone?: string
  origin: string
  fulfillment: string
  tableNumber?: string
  pickupName?: string
  observation?: string
  address?: OrderAddressInput
  payment?: OrderPaymentInput
  items: OrderItemInput[]
}

// ============================================================
// Helpers internos
// ============================================================

function toSafeError(error: {
  code?: string
  message?: string
} | null, fallback: string): string {
  if (!error) {
    return fallback
  }

  switch (error.code) {
    case '23505':
      return 'Já existe um pedido com essa identificação.'
    case '23503':
      return 'Referência inválida.'
    case '42501':
      return 'Você não tem permissão para esta operação.'
    default:
      return fallback
  }
}

/**
 * Exige sessao + permissao createOrders.
 */
async function requireOrderCreate() {
  const context = await getOrdersContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'createOrders')
  ) {
    return null
  }

  return context
}

/**
 * Exige sessao + permissao manageOrders.
 */
async function requireOrderManage() {
  const context = await getOrdersContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'manageOrders')
  ) {
    return null
  }

  return context
}

// ============================================================
// Actions
// ============================================================

export async function createOrder(
  input: CreateOrderInput,
): Promise<OrderActionResult<{ id: string }>> {
  const context = await requireOrderCreate()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!input.origin || !input.fulfillment) {
    return { success: false, error: 'Informe a origem e o tipo de atendimento.' }
  }

  if (!input.items || input.items.length === 0) {
    return { success: false, error: 'Adicione pelo menos um item ao pedido.' }
  }

  const supabase = await createClient()

  // Revalida o preco dos itens que referenciam um produto real do
  // catalogo, em vez de confiar no valor enviado pelo navegador.
  // Itens sem productId (personalizados) mantem o preco informado,
  // pois nao existe produto de catalogo para conferir.
  const productIds = Array.from(
    new Set(
      input.items
        .map((item) => item.productId)
        .filter((id): id is string => Boolean(id)),
    ),
  )

  let realPriceByProductId = new Map<string, number>()

  if (productIds.length > 0) {
    const { data: catalogProducts } = await supabase
      .from('products')
      .select('id, price')
      .eq('organization_id', context.organizationId)
      .in('id', productIds)

    realPriceByProductId = new Map(
      (catalogProducts ?? []).map((product) => [
        product.id as string,
        product.price as number,
      ]),
    )
  }

  const verifiedItems = input.items.map((item) => ({
    ...item,
    priceCents:
      item.productId && realPriceByProductId.has(item.productId)
        ? (realPriceByProductId.get(item.productId) as number)
        : item.priceCents,
  }))

  // Calcula total a partir dos itens (ja com preco revalidado)
  const totalCents = verifiedItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  )

  // Insere o pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      organization_id: context.organizationId,
      customer_name: input.customerName.trim(),
      customer_phone: input.customerPhone?.trim() || null,
      origin: input.origin,
      fulfillment: input.fulfillment,
      status: 'new',
      table_number: input.tableNumber?.trim() || null,
      pickup_name: input.pickupName?.trim() || null,
      observation: input.observation?.trim() || null,
      address: input.address ?? null,
      payment: input.payment ?? null,
      total_cents: totalCents,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return {
      success: false,
      error: toSafeError(orderError, 'Não foi possível criar o pedido.'),
    }
  }

  // Insere os itens do pedido (com preco ja revalidado)
  const orderItems = verifiedItems.map((item) => ({
    order_id: order.id,
    product_id: item.productId || null,
    name: item.name,
    price_cents: item.priceCents,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // Se os itens falharam, exclui o pedido criado
    await supabase.from('orders').delete().eq('id', order.id)
    return {
      success: false,
      error: toSafeError(itemsError, 'Não foi possível adicionar os itens ao pedido.'),
    }
  }

  // Desconta estoque dos produtos com controle ativado. Best-effort:
  // não bloqueia a criação do pedido se isso falhar.
  await supabase.rpc('apply_order_stock_deductions', {
    p_order_id: order.id,
  })

  // Cadastra o cliente automaticamente (por telefone) se ainda não
  // existir — best-effort, mesmo motivo do desconto de estoque
  // acima. ON CONFLICT DO NOTHING preserva o que a equipe já tenha
  // editado manualmente (nome, endereço, observação).
  if (input.customerPhone?.trim()) {
    await supabase.from('customers').upsert(
      {
        organization_id: context.organizationId,
        name: input.customerName.trim(),
        phone: input.customerPhone.trim().replace(/\D/g, ''),
      },
      { onConflict: 'organization_id,phone', ignoreDuplicates: true },
    )
  }

  revalidatePath('/pedidos')
  return { success: true, data: { id: order.id } }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<OrderActionResult> {
  const context = await requireOrderManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const validStatuses = [
    'new',
    'accepted',
    'preparing',
    'ready',
    'delivery',
    'completed',
    'cancelled',
  ]

  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Status inválido.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('organization_id', context.organizationId)
    .select(
      'id, customer_phone, total_cents, cashback_earned_cents, cashback_redeemed_cents',
    )

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível atualizar o pedido.'),
    }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Pedido não encontrado.' }
  }

  const order = data[0]

  // Cashback é ganho só quando o pedido é concluído de verdade (não
  // na criação) — evita criar e cancelar pedido só pra acumular
  // saldo. cashback_earned_cents = 0 garante que só credita uma vez,
  // mesmo se o status oscilar entre telas.
  if (
    status === 'completed' &&
    order.customer_phone &&
    order.cashback_earned_cents === 0
  ) {
    await creditCashbackForOrder(
      context.organizationId,
      order.id,
      order.customer_phone,
      order.total_cents,
    )
  }

  // Se um pedido que já tinha usado cashback for cancelado, devolve
  // o saldo — o cliente não pode perder o desconto de um pedido que
  // não aconteceu.
  if (
    status === 'cancelled' &&
    order.customer_phone &&
    order.cashback_redeemed_cents > 0
  ) {
    await refundCashbackForOrder(
      context.organizationId,
      order.customer_phone,
      order.cashback_redeemed_cents,
    )
  }

  revalidatePath('/pedidos')
  return { success: true }
}

/**
 * Credita o cashback de um pedido concluído, se a organização tiver
 * o recurso ligado e o pedido atingir o mínimo configurado.
 * Best-effort: não bloqueia a conclusão do pedido se isso falhar.
 */
async function creditCashbackForOrder(
  organizationId: string,
  orderId: string,
  customerPhone: string,
  totalCents: number,
) {
  const supabase = await createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('cashback_enabled, cashback_percent, cashback_min_order_cents')
    .eq('id', organizationId)
    .single()

  if (!org?.cashback_enabled || !org.cashback_percent) {
    return
  }

  if (
    org.cashback_min_order_cents &&
    totalCents < org.cashback_min_order_cents
  ) {
    return
  }

  const earnedCents = Math.floor(
    (totalCents * org.cashback_percent) / 100,
  )

  if (earnedCents <= 0) {
    return
  }

  const normalizedPhone = customerPhone.replace(/\D/g, '')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, cashback_balance_cents')
    .eq('organization_id', organizationId)
    .eq('phone', normalizedPhone)
    .maybeSingle()

  if (!customer) {
    return
  }

  await supabase
    .from('customers')
    .update({
      cashback_balance_cents:
        customer.cashback_balance_cents + earnedCents,
    })
    .eq('id', customer.id)

  await supabase
    .from('orders')
    .update({ cashback_earned_cents: earnedCents })
    .eq('id', orderId)
}

/** Devolve cashback resgatado num pedido que acabou sendo cancelado. */
async function refundCashbackForOrder(
  organizationId: string,
  customerPhone: string,
  redeemedCents: number,
) {
  const supabase = await createClient()
  const normalizedPhone = customerPhone.replace(/\D/g, '')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, cashback_balance_cents')
    .eq('organization_id', organizationId)
    .eq('phone', normalizedPhone)
    .maybeSingle()

  if (!customer) {
    return
  }

  await supabase
    .from('customers')
    .update({
      cashback_balance_cents:
        customer.cashback_balance_cents + redeemedCents,
    })
    .eq('id', customer.id)
}

/**
 * Atribui (ou remove, se driverId for null) um entregador da
 * própria equipe a um pedido em entrega.
 */
export async function assignDeliveryDriver(
  orderId: string,
  driverId: string | null,
): Promise<OrderActionResult> {
  const context = await requireOrderManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  if (driverId) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', driverId)
      .eq('organization_id', context.organizationId)
      .eq('role', 'delivery')
      .eq('is_active', true)
      .maybeSingle()

    if (!membership) {
      return {
        success: false,
        error: 'Entregador inválido.',
      }
    }
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ assigned_driver_id: driverId })
    .eq('id', orderId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível atribuir o entregador.',
    }
  }

  revalidatePath('/entregas')
  return { success: true }
}

export async function deleteOrder(
  orderId: string,
): Promise<OrderActionResult> {
  const context = await requireOrderManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('organization_id', context.organizationId)

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível excluir o pedido.'),
    }
  }

  revalidatePath('/pedidos')
  return { success: true }
}
