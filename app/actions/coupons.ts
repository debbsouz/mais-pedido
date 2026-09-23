'use server'

import { revalidatePath } from 'next/cache'

import { getOrdersContext } from '@/lib/orders-dal'
import { getCurrentSubscription } from '@/lib/dal'
import { hasFeature } from '@/lib/access'
import { roleHasPermission } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export type CouponActionResult =
  | { success: true }
  | { success: false; error: string }

export type DiscountType = 'percentage' | 'fixed'

export interface Coupon {
  id: string
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderCents: number
  isActive: boolean
}

export async function getCoupons(): Promise<Coupon[]> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return []
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('coupons')
    .select(
      'id, code, discount_type, discount_value, min_order_cents, is_active',
    )
    .eq('organization_id', context.organizationId)
    .order('created_at', { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id as string,
    code: row.code as string,
    discountType: row.discount_type as DiscountType,
    discountValue: row.discount_value as number,
    minOrderCents: row.min_order_cents as number,
    isActive: row.is_active as boolean,
  }))
}

export interface CreateCouponInput {
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderCents: number
}

function validateCouponInput(
  input: CreateCouponInput,
): string | null {
  if (!input.code.trim()) {
    return 'Informe o código do cupom.'
  }

  if (!Number.isInteger(input.discountValue) || input.discountValue <= 0) {
    return 'Valor do desconto inválido.'
  }

  if (
    input.discountType === 'percentage' &&
    input.discountValue > 100
  ) {
    return 'Desconto em porcentagem não pode passar de 100%.'
  }

  if (
    !Number.isInteger(input.minOrderCents) ||
    input.minOrderCents < 0
  ) {
    return 'Pedido mínimo inválido.'
  }

  return null
}

export async function createCoupon(
  input: CreateCouponInput,
): Promise<CouponActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const subscription = await getCurrentSubscription()

  if (!hasFeature(subscription.planId, 'coupons')) {
    return {
      success: false,
      error: 'Seu plano atual não inclui cupons de desconto.',
    }
  }

  const validationError = validateCouponInput(input)

  if (validationError) {
    return { success: false, error: validationError }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('coupons').insert({
    organization_id: context.organizationId,
    code: input.code.trim().toUpperCase(),
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_cents: input.minOrderCents,
  })

  if (error) {
    return {
      success: false,
      error: error.code === '23505'
        ? 'Já existe um cupom com esse código.'
        : 'Não foi possível criar o cupom.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

export async function toggleCouponActive(
  couponId: string,
  isActive: boolean,
): Promise<CouponActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', couponId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error || !data || data.length === 0) {
    return {
      success: false,
      error: 'Não foi possível atualizar o cupom.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}

export async function deleteCoupon(
  couponId: string,
): Promise<CouponActionResult> {
  const context = await getOrdersContext()

  if (!context || !roleHasPermission(context.role, 'viewSettings')) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', couponId)
    .eq('organization_id', context.organizationId)

  if (error) {
    return {
      success: false,
      error: 'Não foi possível remover o cupom.',
    }
  }

  revalidatePath('/configuracoes')

  return { success: true }
}
