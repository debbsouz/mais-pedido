import 'server-only'

import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import type { UserRole } from '@/lib/roles'

import type { RestaurantTable } from '@/components/mesas/TableCard'
import type { NewOrderItem } from '@/components/pedidos/OrderItemsForm'

// ============================================================
// Contexto da sessao (server-only) — mesmo padrao de orders-dal
// ============================================================

export interface TablesContext {
  organizationId: string
  role: UserRole
}

export const getTablesContext = cache(
  async (): Promise<TablesContext | null> => {
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

function getRelativeOpenedAt(openedAt: Date): string {
  const diffMs = Date.now() - openedAt.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) {
    return 'agora'
  }

  if (diffMin < 60) {
    return `há ${diffMin} min`
  }

  const diffHours = Math.floor(diffMin / 60)
  const remainMin = diffMin % 60

  if (diffHours < 24) {
    return remainMin > 0
      ? `há ${diffHours}h ${remainMin}min`
      : `há ${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `há ${diffDays}d`
}

const DEFAULT_TABLE_COUNT = 8

/**
 * Garante que a organizacao tenha ao menos uma mesa cadastrada.
 * Na primeira vez que alguem abre o Mesas numa organizacao nova,
 * cria um layout inicial de 8 mesas livres — depois disso, quem
 * administra a conta decide quantas mesas existem de verdade
 * (adicionar/remover na propria tela de Mesas).
 */
async function ensureTablesSeeded(organizationId: string) {
  const supabase = await createClient()

  const rows = Array.from(
    { length: DEFAULT_TABLE_COUNT },
    (_, index) => ({
      organization_id: organizationId,
      number: index + 1,
      status: 'free',
    }),
  )

  await supabase.from('restaurant_tables').insert(rows)
}

// ============================================================
// Leitura — mesas
// ============================================================

export const getRestaurantTables = cache(
  async (): Promise<RestaurantTable[]> => {
    const context = await getTablesContext()

    if (!context) {
      return []
    }

    const supabase = await createClient()

    let { data: tableRows } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('organization_id', context.organizationId)
      .order('number', { ascending: true })

    if (!tableRows || tableRows.length === 0) {
      await ensureTablesSeeded(context.organizationId)

      const { data: seeded } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('organization_id', context.organizationId)
        .order('number', { ascending: true })

      tableRows = seeded ?? []
    }

    const occupied = tableRows.filter(
      (table) => table.status !== 'free' && table.opened_at,
    )

    // O total e os itens da comanda nao ficam guardados em
    // restaurant_tables — vem dos pedidos reais (Mesa) lancados
    // depois que a mesa foi aberta. Busca tudo de uma vez (nao
    // um SELECT por mesa) e agrupa em JS.
    const commandByNumber = new Map<
      string,
      { items: NewOrderItem[]; total: number }
    >()

    if (occupied.length > 0) {
      const numbers = occupied.map((table) =>
        String(table.number),
      )

      const openedAtByNumber = new Map(
        occupied.map((table) => [
          String(table.number),
          table.opened_at as string,
        ]),
      )

      const earliestOpenedAt = occupied.reduce(
        (min, table) => {
          const openedAt = table.opened_at as string
          return !min || openedAt < min ? openedAt : min
        },
        null as string | null,
      )

      const { data: comandaOrders } = await supabase
        .from('orders')
        .select(
          'table_number, total_cents, created_at, order_items(product_id, name, price_cents, quantity)',
        )
        .eq('organization_id', context.organizationId)
        .eq('fulfillment', 'Mesa')
        .in('table_number', numbers)
        .neq('status', 'cancelled')
        .gte(
          'created_at',
          earliestOpenedAt ?? new Date(0).toISOString(),
        )

      for (const order of comandaOrders ?? []) {
        const tableNumber = order.table_number as
          | string
          | null

        if (!tableNumber) {
          continue
        }

        const openedAt =
          openedAtByNumber.get(tableNumber)

        // Pedido antigo, de antes da mesa ter sido aberta na
        // rodada atual — nao entra na comanda em exibicao.
        if (
          !openedAt ||
          (order.created_at as string) < openedAt
        ) {
          continue
        }

        const current = commandByNumber.get(
          tableNumber,
        ) ?? { items: [], total: 0 }

        current.total +=
          (order.total_cents as number) ?? 0

        for (const item of (order.order_items ??
          []) as Array<{
          product_id: string | null
          name: string
          price_cents: number
          quantity: number
        }>) {
          const key = item.product_id ?? item.name

          const existing = current.items.find(
            (existingItem) =>
              (existingItem.productId ??
                existingItem.name) === key,
          )

          if (existing) {
            existing.quantity += item.quantity
          } else {
            current.items.push({
              productId:
                item.product_id ??
                `item-${item.name}`,
              name: item.name,
              price: item.price_cents / 100,
              quantity: item.quantity,
            })
          }
        }

        commandByNumber.set(tableNumber, current)
      }
    }

    return tableRows.map((row) => {
      const isFree = row.status === 'free'
      const comanda = commandByNumber.get(
        String(row.number),
      )

      return {
        id: row.id as string,
        number: row.number as number,
        status: row.status as RestaurantTable['status'],
        customerName: isFree
          ? undefined
          : (row.customer_name as string) || undefined,
        people: isFree
          ? undefined
          : ((row.people_count as number) ?? undefined),
        total: isFree
          ? undefined
          : (comanda?.total ?? 0) / 100,
        openedAt:
          isFree || !row.opened_at
            ? undefined
            : getRelativeOpenedAt(
                new Date(row.opened_at as string),
              ),
        commandItems: isFree
          ? undefined
          : (comanda?.items ?? []),
      }
    })
  },
)
