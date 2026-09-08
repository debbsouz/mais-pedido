import 'server-only'

import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { formatPhone, normalizePhone } from '@/lib/format'
import type { UserRole } from '@/lib/roles'

// ============================================================
// Tipos
// ============================================================

export interface CustomerOrderHistoryItem {
  id: string
  displayNumber: string
  date: string
  totalCents: number
  channel: string
  status: string
  items: string
}

export interface CustomerDto {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string
  address: string | null
  addressFields: {
    zipCode: string
    street: string
    number: string
    complement: string
    neighborhood: string
    city: string
  }
  customerSince: Date
  ordersCount: number
  totalSpentCents: number
  lastOrderAt: Date | null
  history: CustomerOrderHistoryItem[]
}

// ============================================================
// Contexto da sessao (server-only) — mesmo padrao do resto do app
// ============================================================

export interface CustomersContext {
  organizationId: string
  role: UserRole
}

export const getCustomersContext = cache(
  async (): Promise<CustomersContext | null> => {
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
// Helpers
// ============================================================

const statusLabels: Record<string, string> = {
  new: 'Novo',
  accepted: 'Aceito',
  preparing: 'Em preparo',
  ready: 'Pronto',
  delivery: 'Em entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

function formatOrderDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildAddressLine(fields: {
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
}): string | null {
  const { street, number, neighborhood, city } = fields

  if (!street && !city) {
    return null
  }

  const line1 = [street, number].filter(Boolean).join(', ')
  const line2 = [neighborhood, city].filter(Boolean).join(' - ')

  return [line1, line2].filter(Boolean).join(' - ')
}

// ============================================================
// Leitura — clientes
// ============================================================

export const getCustomers = cache(
  async (): Promise<CustomerDto[]> => {
    const context = await getCustomersContext()

    if (!context) {
      return []
    }

    const supabase = await createClient()

    const { data: customerRows } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', context.organizationId)
      .order('name', { ascending: true })

    if (!customerRows || customerRows.length === 0) {
      return []
    }

    // Pedidos, total gasto e histórico não ficam guardados em
    // customers — vêm dos pedidos reais, casando pelo telefone
    // (sempre normalizado, só dígitos).
    interface CustomerOrderRow {
      id: string
      number: number
      customer_phone: string | null
      fulfillment: string
      status: string
      total_cents: number
      created_at: string
      order_items: Array<{ name: string; quantity: number }> | null
    }

    const { data: orderRows } = await supabase
      .from('orders')
      .select(
        'id, number, customer_name, customer_phone, fulfillment, status, total_cents, created_at, order_items(name, quantity)',
      )
      .eq('organization_id', context.organizationId)
      .not('customer_phone', 'is', null)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .returns<CustomerOrderRow[]>()

    const ordersByPhone = new Map<string, CustomerOrderRow[]>()

    for (const order of orderRows ?? []) {
      const phone = normalizePhone(
        (order.customer_phone as string) ?? '',
      )

      if (!phone) {
        continue
      }

      const current = ordersByPhone.get(phone) ?? []
      current.push(order)
      ordersByPhone.set(phone, current)
    }

    return customerRows.map((row) => {
      const normalizedPhone = normalizePhone(
        row.phone as string,
      )

      const customerOrders =
        ordersByPhone.get(normalizedPhone) ?? []

      const ordersCount = customerOrders.length

      const totalSpentCents = customerOrders.reduce(
        (total, order) =>
          total + ((order.total_cents as number) ?? 0),
        0,
      )

      const lastOrderAt =
        customerOrders.length > 0
          ? new Date(
              customerOrders[0].created_at as string,
            )
          : null

      const history: CustomerOrderHistoryItem[] =
        customerOrders.slice(0, 10).map((order) => {
          const items = (order.order_items ??
            []) as Array<{
            name: string
            quantity: number
          }>

          return {
            id: order.id as string,
            displayNumber: String(
              order.number as number,
            ).padStart(3, '0'),
            date: formatOrderDate(
              order.created_at as string,
            ),
            totalCents:
              (order.total_cents as number) ?? 0,
            channel: order.fulfillment as string,
            status:
              statusLabels[order.status as string] ??
              (order.status as string),
            items:
              items
                .map(
                  (item) =>
                    `${item.quantity}x ${item.name}`,
                )
                .join(', ') || 'Sem itens',
          }
        })

      const addressFields = {
        zipCode: (row.zip_code as string) ?? '',
        street: (row.street as string) ?? '',
        number: (row.number as string) ?? '',
        complement: (row.complement as string) ?? '',
        neighborhood:
          (row.neighborhood as string) ?? '',
        city: (row.city as string) ?? '',
      }

      const registeredAddress = buildAddressLine({
        street: row.street as string | null,
        number: row.number as string | null,
        neighborhood: row.neighborhood as string | null,
        city: row.city as string | null,
      })

      return {
        id: row.id as string,
        name: row.name as string,
        phone: formatPhone(row.phone as string),
        email: (row.email as string) || null,
        notes: (row.notes as string) ?? '',
        address: registeredAddress,
        addressFields,
        customerSince: new Date(
          row.created_at as string,
        ),
        ordersCount,
        totalSpentCents,
        lastOrderAt,
        history,
      }
    })
  },
)
