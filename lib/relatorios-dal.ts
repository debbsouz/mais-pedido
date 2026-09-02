import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { roleHasPermission } from '@/lib/roles'

import { getOrdersContext } from './orders-dal'

// América/Sao_Paulo é sempre UTC-3 (sem horário de verão desde 2019).
const BRAZIL_UTC_OFFSET_HOURS = 3

function daysAgoStartBrazil(daysAgo: number): Date {
  const now = new Date()
  const shifted = new Date(
    now.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  )
  const year = shifted.getUTCFullYear()
  const month = shifted.getUTCMonth()
  const day = shifted.getUTCDate() - daysAgo

  return new Date(
    Date.UTC(year, month, day, BRAZIL_UTC_OFFSET_HOURS, 0, 0),
  )
}

export interface TopProductEntry {
  name: string
  quantity: number
  totalCents: number
}

export interface StatusBreakdownEntry {
  status: string
  orderCount: number
}

export interface PeakHourEntry {
  hour: number
  orderCount: number
}

export interface ReportsSummary {
  periodOrderCount: number
  topProducts: TopProductEntry[]
  ordersByStatus: StatusBreakdownEntry[]
  peakHours: PeakHourEntry[]
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  preparing: 'Em preparo',
  ready: 'Pronto',
  delivery: 'Em entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
}

/**
 * Relatórios operacionais reais dos últimos 30 dias: o que mais
 * vende, em que status os pedidos estão e em quais horários o
 * movimento é maior. Tudo calculado a partir de orders/order_items
 * — nenhum número de exemplo.
 */
export async function getReportsSummary(): Promise<ReportsSummary | null> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewReports')) {
    return null
  }

  const supabase = await createClient()
  const since = daysAgoStartBrazil(29)

  const { data: orderRows } = await supabase
    .from('orders')
    .select('id, status, created_at')
    .eq('organization_id', context.organizationId)
    .gte('created_at', since.toISOString())

  const allOrders = (orderRows ?? []).map((row) => ({
    id: row.id as string,
    status: row.status as string,
    createdAt: new Date(row.created_at as string),
  }))

  const activeOrders = allOrders.filter(
    (order) => order.status !== 'cancelled',
  )
  const activeOrderIds = activeOrders.map((order) => order.id)

  const { data: itemRows } =
    activeOrderIds.length > 0
      ? await supabase
          .from('order_items')
          .select('name, price_cents, quantity, order_id')
          .in('order_id', activeOrderIds)
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
    .slice(0, 10)

  const hourMap = new Map<number, number>()

  for (const order of activeOrders) {
    const shifted = new Date(
      order.createdAt.getTime() -
        BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
    )
    const hour = shifted.getUTCHours()
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1)
  }

  const peakHours = Array.from(hourMap.entries())
    .map(([hour, orderCount]) => ({ hour, orderCount }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 5)

  const statusMap = new Map<string, number>()

  for (const order of allOrders) {
    statusMap.set(
      order.status,
      (statusMap.get(order.status) ?? 0) + 1,
    )
  }

  const ordersByStatus = Array.from(statusMap.entries())
    .map(([status, orderCount]) => ({
      status: STATUS_LABELS[status] ?? status,
      orderCount,
    }))
    .sort((a, b) => b.orderCount - a.orderCount)

  return {
    periodOrderCount: allOrders.length,
    topProducts,
    ordersByStatus,
    peakHours,
  }
}
