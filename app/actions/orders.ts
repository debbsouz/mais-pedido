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

  // Calcula total a partir dos itens
  const totalCents = input.items.reduce(
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

  // Insere os itens do pedido
  const orderItems = input.items.map((item) => ({
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

  const validStatuses = ['new', 'preparing', 'ready', 'delivery']

  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Status inválido.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível atualizar o pedido.'),
    }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Pedido não encontrado.' }
  }

  revalidatePath('/pedidos')
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
