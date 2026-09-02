'use server'

import { revalidatePath } from 'next/cache'

import { getOrdersContext } from '@/lib/orders-dal'
import { roleHasPermission } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export type BusinessHoursActionResult =
  | { success: true }
  | { success: false; error: string }

export interface BusinessHourEntry {
  dayOfWeek: number
  isClosed: boolean
  opensAt: string | null
  closesAt: string | null
}

function emptyWeek(): BusinessHourEntry[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: true,
    opensAt: null,
    closesAt: null,
  }))
}

/**
 * Lê o horário de funcionamento da própria organização. Sempre
 * devolve os 7 dias (preenche com "fechado" os dias sem linha no
 * banco), pra a tela não precisar tratar dia faltante.
 */
export async function getBusinessHours(): Promise<BusinessHourEntry[]> {
  const context = await getOrdersContext()

  if (!context) {
    return emptyWeek()
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('business_hours')
    .select('day_of_week, is_closed, opens_at, closes_at')
    .eq('organization_id', context.organizationId)

  const week = emptyWeek()

  for (const row of data ?? []) {
    const entry = week[row.day_of_week as number]

    if (entry) {
      entry.isClosed = row.is_closed as boolean
      entry.opensAt = (row.opens_at as string | null)?.slice(0, 5) ?? null
      entry.closesAt = (row.closes_at as string | null)?.slice(0, 5) ?? null
    }
  }

  return week
}

function isValidTime(value: string | null): value is string {
  return !!value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

export async function updateBusinessHours(
  hours: BusinessHourEntry[],
): Promise<BusinessHoursActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  for (const entry of hours) {
    if (entry.isClosed) {
      continue
    }

    if (!isValidTime(entry.opensAt) || !isValidTime(entry.closesAt)) {
      return {
        success: false,
        error: `Preencha o horário de abertura e fechamento de ${
          entry.dayOfWeek + 1
        }.`,
      }
    }
  }

  const supabase = await createClient()

  const rows = hours.map((entry) => ({
    organization_id: context.organizationId,
    day_of_week: entry.dayOfWeek,
    is_closed: entry.isClosed,
    opens_at: entry.isClosed ? null : entry.opensAt,
    closes_at: entry.isClosed ? null : entry.closesAt,
  }))

  const { data, error } = await supabase
    .from('business_hours')
    .upsert(rows, { onConflict: 'organization_id,day_of_week' })
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível salvar o horário de funcionamento.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
