import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { roleHasPermission } from '@/lib/roles'

import { getOrdersContext } from './orders-dal'

// América/Sao_Paulo é sempre UTC-3 (sem horário de verão desde 2019).
const BRAZIL_UTC_OFFSET_HOURS = 3

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

function brazilNow(): { year: number; month: number } {
  const shifted = new Date(
    Date.now() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  )
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
  }
}

/** Início do mês (00:00 em Brasília) como instante UTC correto. */
function monthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, BRAZIL_UTC_OFFSET_HOURS, 0, 0))
}

function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export interface MonthStats {
  label: string
  revenueCents: number
  orderCount: number
  averageTicketCents: number
  purchasesCents: number
  profitCents: number
}

export interface TopProductStat {
  name: string
  quantity: number
  totalCents: number
}

export interface MonthlyReport {
  currentMonth: MonthStats
  previousMonth: MonthStats
  revenueGrowthPercent: number | null
  topProducts: TopProductStat[]
}

/**
 * Relatório executivo do mês atual comparado com o anterior: receita,
 * pedidos, ticket médio, despesas (registro de compras) e lucro
 * estimado, além dos produtos mais vendidos do mês. Tudo real, sem
 * número de exemplo — sem pedido/compra no período, os valores
 * simplesmente ficam em zero.
 */
export async function getMonthlyReport(): Promise<MonthlyReport | null> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewFinancial')) {
    return null
  }

  const supabase = await createClient()

  const now = brazilNow()
  const previous = addMonths(now.year, now.month, -1)

  const rangeStart = monthStart(previous.year, previous.month)
  const currentStart = monthStart(now.year, now.month)
  const nextStart = monthStart(
    addMonths(now.year, now.month, 1).year,
    addMonths(now.year, now.month, 1).month,
  )

  const [{ data: orderRows }, { data: purchaseRows }] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total_cents, created_at')
      .eq('organization_id', context.organizationId)
      .neq('status', 'cancelled')
      .gte('created_at', rangeStart.toISOString())
      .lt('created_at', nextStart.toISOString()),
    supabase
      .from('purchases')
      .select('cost_cents, purchase_date')
      .eq('organization_id', context.organizationId)
      .gte('purchase_date', rangeStart.toISOString().slice(0, 10))
      .lt('purchase_date', nextStart.toISOString().slice(0, 10)),
  ])

  const orders = (orderRows ?? []).map((row) => ({
    id: row.id as string,
    totalCents: row.total_cents as number,
    createdAt: new Date(row.created_at as string),
  }))

  const currentOrders = orders.filter(
    (order) => order.createdAt >= currentStart,
  )
  const previousOrders = orders.filter(
    (order) => order.createdAt < currentStart,
  )

  const currentPurchasesCents = (purchaseRows ?? [])
    .filter(
      (row) =>
        new Date(`${row.purchase_date as string}T12:00:00Z`) >=
        currentStart,
    )
    .reduce((sum, row) => sum + (row.cost_cents as number), 0)

  const previousPurchasesCents = (purchaseRows ?? [])
    .filter(
      (row) =>
        new Date(`${row.purchase_date as string}T12:00:00Z`) <
        currentStart,
    )
    .reduce((sum, row) => sum + (row.cost_cents as number), 0)

  function buildStats(
    periodOrders: typeof orders,
    purchasesCents: number,
    label: string,
  ): MonthStats {
    const revenueCents = periodOrders.reduce(
      (sum, order) => sum + order.totalCents,
      0,
    )
    const orderCount = periodOrders.length

    return {
      label,
      revenueCents,
      orderCount,
      averageTicketCents:
        orderCount > 0 ? Math.round(revenueCents / orderCount) : 0,
      purchasesCents,
      profitCents: revenueCents - purchasesCents,
    }
  }

  const currentMonth = buildStats(
    currentOrders,
    currentPurchasesCents,
    `${MONTH_NAMES[now.month]} de ${now.year}`,
  )
  const previousMonth = buildStats(
    previousOrders,
    previousPurchasesCents,
    `${MONTH_NAMES[previous.month]} de ${previous.year}`,
  )

  const revenueGrowthPercent =
    previousMonth.revenueCents > 0
      ? ((currentMonth.revenueCents - previousMonth.revenueCents) /
          previousMonth.revenueCents) *
        100
      : null

  const currentOrderIds = currentOrders.map((order) => order.id)

  const { data: itemRows } =
    currentOrderIds.length > 0
      ? await supabase
          .from('order_items')
          .select('name, price_cents, quantity, order_id')
          .in('order_id', currentOrderIds)
      : { data: [] }

  const productMap = new Map<
    string,
    { quantity: number; totalCents: number }
  >()

  for (const item of itemRows ?? []) {
    const quantity = item.quantity as number
    const priceCents = item.price_cents as number
    const entry = productMap.get(item.name as string) ?? {
      quantity: 0,
      totalCents: 0,
    }
    entry.quantity += quantity
    entry.totalCents += priceCents * quantity
    productMap.set(item.name as string, entry)
  }

  const topProducts = Array.from(productMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return {
    currentMonth,
    previousMonth,
    revenueGrowthPercent,
    topProducts,
  }
}
