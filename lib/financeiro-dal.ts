import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { roleHasPermission } from '@/lib/roles'

import { getOrdersContext } from './orders-dal'

// América/Sao_Paulo é sempre UTC-3 (sem horário de verão desde 2019),
// então um offset fixo é suficiente pra bucketar "hoje"/"esta semana"
// no fuso correto sem depender de Intl.
const BRAZIL_UTC_OFFSET_HOURS = 3

function startOfDayBrazil(daysAgo: number): Date {
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

function brazilDateKey(date: Date): string {
  const shifted = new Date(
    date.getTime() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  )
  return shifted.toISOString().slice(0, 10)
}

export interface PeriodStats {
  totalCents: number
  orderCount: number
  averageTicketCents: number
}

export interface BreakdownEntry {
  label: string
  totalCents: number
  orderCount: number
}

export interface DailyRevenue {
  date: string
  totalCents: number
  orderCount: number
}

export interface FinancialSummary {
  today: PeriodStats
  last7Days: PeriodStats
  last30Days: PeriodStats
  byPaymentMethod: BreakdownEntry[]
  byOrigin: BreakdownEntry[]
  dailyRevenue: DailyRevenue[]
}

function computePeriodStats(
  orders: { totalCents: number }[],
): PeriodStats {
  const totalCents = orders.reduce(
    (sum, order) => sum + order.totalCents,
    0,
  )
  const orderCount = orders.length

  return {
    totalCents,
    orderCount,
    averageTicketCents:
      orderCount > 0
        ? Math.round(totalCents / orderCount)
        : 0,
  }
}

function sortedBreakdown(
  map: Map<string, { totalCents: number; orderCount: number }>,
): BreakdownEntry[] {
  return Array.from(map.entries())
    .map(([label, stats]) => ({ label, ...stats }))
    .sort((a, b) => b.totalCents - a.totalCents)
}

/**
 * Resumo financeiro real, calculado a partir dos pedidos do banco
 * (não conta pedidos cancelados). "Receita" aqui é o valor de tudo
 * que foi vendido, independente do status atual (novo, em preparo,
 * pronto, etc.) — não só pedidos com status "completed", porque em
 * fluxo de balcão/mesa nem sempre alguém marca isso.
 */
export async function getFinancialSummary(): Promise<FinancialSummary | null> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewFinancial')) {
    return null
  }

  const supabase = await createClient()
  const since = startOfDayBrazil(29)

  const { data } = await supabase
    .from('orders')
    .select('origin, payment, total_cents, created_at')
    .eq('organization_id', context.organizationId)
    .neq('status', 'cancelled')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  const orders = (data ?? []).map((row) => ({
    origin: (row.origin as string) || 'Não informado',
    method:
      (row.payment as { method?: string } | null)?.method ??
      'Não informado',
    totalCents: row.total_cents as number,
    createdAt: new Date(row.created_at as string),
  }))

  const todayStart = startOfDayBrazil(0)
  const weekStart = startOfDayBrazil(6)

  const todayOrders = orders.filter(
    (order) => order.createdAt >= todayStart,
  )
  const weekOrders = orders.filter(
    (order) => order.createdAt >= weekStart,
  )

  const byPaymentMethodMap = new Map<
    string,
    { totalCents: number; orderCount: number }
  >()
  const byOriginMap = new Map<
    string,
    { totalCents: number; orderCount: number }
  >()

  for (const order of orders) {
    const paymentEntry = byPaymentMethodMap.get(order.method) ?? {
      totalCents: 0,
      orderCount: 0,
    }
    paymentEntry.totalCents += order.totalCents
    paymentEntry.orderCount += 1
    byPaymentMethodMap.set(order.method, paymentEntry)

    const originEntry = byOriginMap.get(order.origin) ?? {
      totalCents: 0,
      orderCount: 0,
    }
    originEntry.totalCents += order.totalCents
    originEntry.orderCount += 1
    byOriginMap.set(order.origin, originEntry)
  }

  const dailyMap = new Map<
    string,
    { totalCents: number; orderCount: number }
  >()

  for (let daysAgo = 13; daysAgo >= 0; daysAgo -= 1) {
    dailyMap.set(brazilDateKey(startOfDayBrazil(daysAgo)), {
      totalCents: 0,
      orderCount: 0,
    })
  }

  for (const order of orders) {
    const bucket = dailyMap.get(brazilDateKey(order.createdAt))

    if (bucket) {
      bucket.totalCents += order.totalCents
      bucket.orderCount += 1
    }
  }

  const dailyRevenue: DailyRevenue[] = Array.from(
    dailyMap.entries(),
  ).map(([date, stats]) => ({ date, ...stats }))

  return {
    today: computePeriodStats(todayOrders),
    last7Days: computePeriodStats(weekOrders),
    last30Days: computePeriodStats(orders),
    byPaymentMethod: sortedBreakdown(byPaymentMethodMap),
    byOrigin: sortedBreakdown(byOriginMap),
    dailyRevenue,
  }
}
