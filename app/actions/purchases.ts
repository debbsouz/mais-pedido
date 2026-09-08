'use server'

import { revalidatePath } from 'next/cache'

import { getOrdersContext } from '@/lib/orders-dal'
import { roleHasPermission } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export type PurchaseActionResult =
  | { success: true }
  | { success: false; error: string }

export interface Purchase {
  id: string
  supplier: string
  description: string
  costCents: number
  purchaseDate: string
  notes: string
}

/**
 * Últimas compras registradas (90 dias), mais recentes primeiro.
 */
export async function getPurchases(): Promise<Purchase[]> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewFinancial')) {
    return []
  }

  const supabase = await createClient()

  const since = new Date()
  since.setDate(since.getDate() - 90)

  const { data } = await supabase
    .from('purchases')
    .select('id, supplier, description, cost_cents, purchase_date, notes')
    .eq('organization_id', context.organizationId)
    .gte('purchase_date', since.toISOString().slice(0, 10))
    .order('purchase_date', { ascending: false })
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id as string,
    supplier: row.supplier as string,
    description: row.description as string,
    costCents: row.cost_cents as number,
    purchaseDate: row.purchase_date as string,
    notes: (row.notes as string) ?? '',
  }))
}

export interface CreatePurchaseInput {
  supplier: string
  description: string
  costCents: number
  purchaseDate: string
  notes?: string
}

export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<PurchaseActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewFinancial')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supplier = input.supplier.trim()
  const description = input.description.trim()

  if (!supplier || !description) {
    return {
      success: false,
      error: 'Informe o fornecedor e a descrição da compra.',
    }
  }

  if (!Number.isInteger(input.costCents) || input.costCents < 0) {
    return { success: false, error: 'Valor inválido.' }
  }

  if (!input.purchaseDate) {
    return { success: false, error: 'Informe a data da compra.' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('purchases').insert({
    organization_id: context.organizationId,
    supplier,
    description,
    cost_cents: input.costCents,
    purchase_date: input.purchaseDate,
    notes: input.notes?.trim() || '',
    created_by: user?.id ?? null,
  })

  if (error) {
    return {
      success: false,
      error: 'Não foi possível registrar a compra.',
    }
  }

  revalidatePath('/financeiro')

  return { success: true }
}

export async function deletePurchase(
  purchaseId: string,
): Promise<PurchaseActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewFinancial')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchaseId)
    .eq('organization_id', context.organizationId)

  if (error) {
    return {
      success: false,
      error: 'Não foi possível remover a compra.',
    }
  }

  revalidatePath('/financeiro')

  return { success: true }
}
