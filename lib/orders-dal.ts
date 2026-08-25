import 'server-only'

import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import type { UserRole } from '@/lib/roles'

import { formatOrderNumber } from '@/lib/format'
import type {
  Order,
  OrderItemDetail,
  OrderAddress,
  OrderPaymentDetails,
} from '@/components/pedidos/OrderCard'

// ============================================================
// Tipos
// ============================================================

export interface OrderItemDto {
  id: string
  orderId: string
  productId: string | null
  name: string
  priceCents: number
  quantity: number
}

export interface OrderDto {
  id: string
  number: number
  organizationId: string
  customerName: string
  customerPhone: string | null
  origin: string
  fulfillment: string
  status: string
  tableNumber: string | null
  pickupName: string | null
  observation: string | null
  address: Record<string, string> | null
  payment: Record<string, unknown> | null
  totalCents: number
  createdAt: Date
  updatedAt: Date
  items: OrderItemDto[]
}

export interface OrdersContext {
  organizationId: string
  role: UserRole
}

// ============================================================
// Contexto da sessao (server-only)
// ============================================================

/**
 * Retorna a organizacao + cargo do usuario autenticado.
 * Reutiliza o mesmo padrao de getCatalogContext.
 */
export const getOrdersContext = cache(
  async (): Promise<OrdersContext | null> => {
    const user = await getCurrentUser()

    if (!user) {
      return null
    }

    const supabase = await createClient()

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!membership) {
      return null
    }

    return {
      organizationId: membership.organization_id,
      role: user.role,
    }
  },
)

// ============================================================
// Leitura — pedidos
// ============================================================

export const getOrders = cache(
  async (): Promise<OrderDto[]> => {
    const context = await getOrdersContext()

    if (!context) {
      return []
    }

    const supabase = await createClient()

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('organization_id', context.organizationId)
      .order('created_at', { ascending: false })

    if (!ordersData || ordersData.length === 0) {
      return []
    }

    return ordersData.map((order) => ({
      id: order.id,
      number: order.number as number,
      organizationId: order.organization_id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      origin: order.origin,
      fulfillment: order.fulfillment,
      status: order.status,
      tableNumber: order.table_number,
      pickupName: order.pickup_name,
      observation: order.observation,
      address: order.address as Record<string, string> | null,
      payment: order.payment as Record<string, unknown> | null,
      totalCents: order.total_cents,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      items: (order.order_items ?? []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        orderId: item.order_id as string,
        productId: item.product_id as string | null,
        name: item.name as string,
        priceCents: item.price_cents as number,
        quantity: item.quantity as number,
      })),
    }))
  },
)

// ============================================================
// Mappers — DTO → Frontend
// ============================================================

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/**
 * Calcula o tempo relativo de um pedido (ex: "há 7 min", "pronto há 3 min").
 */
function getRelativeTime(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) {
    return 'agora'
  }

  if (diffMin < 60) {
    return `há ${diffMin} min`
  }

  const diffHours = Math.floor(diffMin / 60)

  if (diffHours < 24) {
    return `há ${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `há ${diffDays}d`
}

/**
 * Converte um OrderDto do banco no formato do frontend (Order).
 *
 * Conversoes explicitas:
 * - totalCents (centavos) → total (string formatada "R$ X,XX")
 * - createdAt → time (string relativa "há X min")
 * - items → itemDetails (OrderItemDetail[]) + items (resumo string)
 * - address/payment (JSONB) → OrderAddress/OrderPaymentDetails
 */
export function toFrontendOrder(dto: OrderDto): Order {
  const itemDetails: OrderItemDetail[] = dto.items.map((item) => ({
    productId: item.productId ?? `item-${item.id}`,
    name: item.name,
    price: item.priceCents / 100,
    quantity: item.quantity,
  }))

  const itemsSummary = itemDetails
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(', ')

  return {
    id: dto.id,
    number: dto.number,
    customer: dto.customerName || 'Cliente',
    origin: dto.origin as Order['origin'],
    fulfillment: dto.fulfillment as Order['fulfillment'],
    time: getRelativeTime(dto.createdAt),
    total: currencyFormatter.format(dto.totalCents / 100),
    items: itemsSummary || 'Sem itens',
    status: dto.status as Order['status'],
    createdAt: dto.createdAt.getTime(),
    tableNumber: dto.tableNumber ?? undefined,
    pickupName: dto.pickupName ?? undefined,
    phone: dto.customerPhone ?? undefined,
    observation: dto.observation ?? undefined,
    address: (dto.address as unknown as OrderAddress) ?? undefined,
    payment: (dto.payment as unknown as OrderPaymentDetails) ?? undefined,
    itemDetails,
  }
}

/**
 * Converte uma lista de OrderDto para o formato do frontend.
 */
export function toFrontendOrders(dtos: OrderDto[]): Order[] {
  return dtos.map(toFrontendOrder)
}
