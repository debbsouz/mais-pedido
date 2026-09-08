'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import {
  getCustomers,
  getCustomersContext,
  type CustomerDto,
} from '@/lib/customers-dal'
import { roleHasPermission } from '@/lib/roles'
import { normalizePhone } from '@/lib/format'

// Re-exportado pra componentes client poderem importar o tipo sem
// tocar em lib/customers-dal.ts diretamente (que tem `server-only`).
export type {
  CustomerDto,
  CustomerOrderHistoryItem,
} from '@/lib/customers-dal'

// ============================================================
// Tipos de retorno (padrao unico do projeto)
// ============================================================

export type CustomerActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

export interface CustomerInput {
  id?: string
  name: string
  phone: string
  email?: string
  zipCode?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  notes?: string
}

// ============================================================
// Helpers internos
// ============================================================

async function requireCustomerView() {
  const context = await getCustomersContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'viewCustomers')
  ) {
    return null
  }

  return context
}

async function requireCustomerManage() {
  const context = await getCustomersContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'manageCustomers')
  ) {
    return null
  }

  return context
}

// ============================================================
// Actions
// ============================================================

/**
 * Refetch client-side depois de criar/editar/remover — mesmo
 * padrao de getTeamMembers/getRestaurantTables.
 */
export async function getCustomersList(): Promise<CustomerDto[]> {
  const context = await requireCustomerView()

  if (!context) {
    return []
  }

  return getCustomers()
}

export async function createCustomer(
  input: CustomerInput,
): Promise<CustomerActionResult<{ id: string }>> {
  const context = await requireCustomerManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const name = input.name.trim()
  const phone = normalizePhone(input.phone)

  if (!name || !phone) {
    return {
      success: false,
      error: 'Informe nome e telefone.',
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .insert({
      organization_id: context.organizationId,
      name,
      phone,
      email: input.email?.trim() || null,
      zip_code: input.zipCode?.trim() || null,
      street: input.street?.trim() || null,
      number: input.number?.trim() || null,
      complement: input.complement?.trim() || null,
      neighborhood: input.neighborhood?.trim() || null,
      city: input.city?.trim() || null,
      notes: input.notes?.trim() || '',
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Já existe um cliente com esse telefone.',
      }
    }

    return {
      success: false,
      error: 'Não foi possível cadastrar o cliente.',
    }
  }

  revalidatePath('/clientes')
  return { success: true, data: { id: data.id as string } }
}

export async function updateCustomer(
  input: CustomerInput,
): Promise<CustomerActionResult> {
  const context = await requireCustomerManage()

  if (!context || !input.id) {
    return { success: false, error: 'Não autorizado.' }
  }

  const name = input.name.trim()
  const phone = normalizePhone(input.phone)

  if (!name || !phone) {
    return {
      success: false,
      error: 'Informe nome e telefone.',
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .update({
      name,
      phone,
      email: input.email?.trim() || null,
      zip_code: input.zipCode?.trim() || null,
      street: input.street?.trim() || null,
      number: input.number?.trim() || null,
      complement: input.complement?.trim() || null,
      neighborhood: input.neighborhood?.trim() || null,
      city: input.city?.trim() || null,
      notes: input.notes?.trim() || '',
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error) {
    if (error.code === '23505') {
      return {
        success: false,
        error: 'Já existe um cliente com esse telefone.',
      }
    }

    return {
      success: false,
      error: 'Não foi possível salvar as alterações.',
    }
  }

  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'Cliente não encontrado.',
    }
  }

  revalidatePath('/clientes')
  return { success: true }
}

export async function deleteCustomer(
  customerId: string,
): Promise<CustomerActionResult> {
  const context = await requireCustomerManage()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('organization_id', context.organizationId)

  if (error) {
    return {
      success: false,
      error: 'Não foi possível remover o cliente.',
    }
  }

  revalidatePath('/clientes')
  return { success: true }
}
