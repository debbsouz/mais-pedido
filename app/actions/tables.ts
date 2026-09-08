'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getTablesContext } from '@/lib/tables-dal'
import { roleHasPermission } from '@/lib/roles'

// ============================================================
// Tipos de retorno (padrao unico do projeto)
// ============================================================

export type TableActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// Helpers internos
// ============================================================

async function requireTableManage() {
  const context = await getTablesContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'manageTables')
  ) {
    return null
  }

  return context
}

/**
 * Adicionar/remover mesa muda o layout do salão — restrito a
 * quem administra a conta (owner/manager), diferente de abrir,
 * fechar ou liberar uma mesa (qualquer um com manageTables).
 */
async function requireTableLayoutManage() {
  const context = await requireTableManage()

  if (
    !context ||
    (context.role !== 'owner' && context.role !== 'manager')
  ) {
    return null
  }

  return context
}

function revalidateTableSurfaces() {
  revalidatePath('/mesas')
  revalidatePath('/inicio')
  revalidatePath('/garcom')
  revalidatePath('/atendente')
}

// ============================================================
// Actions — ciclo de vida da mesa
// ============================================================

export async function openTable(
  tableId: string,
  customerName: string,
  peopleCount: number,
): Promise<TableActionResult> {
  const context = await requireTableManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    return {
      success: false,
      error: 'Informe uma quantidade de pessoas válida.',
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      status: 'occupied',
      customer_name: customerName.trim() || null,
      people_count: peopleCount,
      opened_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', tableId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível abrir a mesa.',
    }
  }

  revalidateTableSurfaces()
  return { success: true }
}

export async function requestTableClosing(
  tableId: string,
): Promise<TableActionResult> {
  const context = await requireTableManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      status: 'waiting-payment',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tableId)
    .eq('organization_id', context.organizationId)
    .eq('status', 'occupied')
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível solicitar o fechamento.',
    }
  }

  revalidateTableSurfaces()
  return { success: true }
}

export async function cancelTableClosing(
  tableId: string,
): Promise<TableActionResult> {
  const context = await requireTableManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      status: 'occupied',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tableId)
    .eq('organization_id', context.organizationId)
    .eq('status', 'waiting-payment')
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível cancelar o fechamento.',
    }
  }

  revalidateTableSurfaces()
  return { success: true }
}

/**
 * Confirma o pagamento e libera a mesa para um novo atendimento.
 * So permitido a partir de "waiting-payment" — o pagamento e
 * confirmado no fluxo do Atendente/Mesas antes de chamar isso.
 */
export async function releaseTable(
  tableId: string,
): Promise<TableActionResult> {
  const context = await requireTableManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('restaurant_tables')
    .update({
      status: 'free',
      customer_name: null,
      people_count: null,
      opened_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tableId)
    .eq('organization_id', context.organizationId)
    .eq('status', 'waiting-payment')
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível liberar a mesa.',
    }
  }

  revalidateTableSurfaces()
  return { success: true }
}

// ============================================================
// Actions — layout do salão (owner/manager)
// ============================================================

export async function addTable(): Promise<
  TableActionResult<{ id: string; number: number }>
> {
  const context = await requireTableLayoutManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('restaurant_tables')
    .select('number')
    .eq('organization_id', context.organizationId)
    .order('number', { ascending: false })
    .limit(1)

  const nextNumber = (existing?.[0]?.number ?? 0) + 1

  const { data, error } = await supabase
    .from('restaurant_tables')
    .insert({
      organization_id: context.organizationId,
      number: nextNumber,
      status: 'free',
    })
    .select('id, number')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: 'Não foi possível adicionar a mesa.',
    }
  }

  revalidateTableSurfaces()
  return {
    success: true,
    data: { id: data.id as string, number: data.number as number },
  }
}

export async function removeTable(
  tableId: string,
): Promise<TableActionResult> {
  const context = await requireTableLayoutManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('restaurant_tables')
    .delete()
    .eq('id', tableId)
    .eq('organization_id', context.organizationId)
    .eq('status', 'free')
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error:
        'Só é possível remover uma mesa livre. Libere-a antes de remover.',
    }
  }

  revalidateTableSurfaces()
  return { success: true }
}
