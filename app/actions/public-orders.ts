'use server'

import { createClient } from '@/lib/supabase/server'

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

export interface CreatePublicOrderInput {
  organizationId: string
  customerName: string
  customerPhone?: string
  fulfillment: PublicOrderFulfillment
  tableNumber?: string
  addressText?: string
  paymentMethod?: PublicOrderPaymentMethod
  items: PublicOrderItemInput[]
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

  const supabase = await createClient()

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

  const totalCents = verifiedItems.reduce(
    (total, item) => total + item.priceCents * item.quantity,
    0,
  )

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
      input.fulfillment === 'delivery' && input.addressText?.trim()
        ? {
            zipCode: '',
            street: input.addressText.trim(),
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
          }
        : null,
    payment: input.paymentMethod
      ? { method: paymentMethodByStorefrontValue[input.paymentMethod] }
      : null,
    total_cents: totalCents,
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

  return { success: true, data: { id: orderId } }
}
