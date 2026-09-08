import 'server-only'

import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import type { UserRole } from '@/lib/roles'

// ============================================================
// Tipos
// ============================================================

export interface CatalogCategoryDto {
  id: string
  name: string
  sortOrder: number
}

export interface CatalogProductDto {
  id: string
  name: string
  description: string
  /**
   * Preco em CENTAVOS (inteiro).
   * O banco armazena centavos; a conversao para moeda
   * (R$) acontece somente na camada de UI.
   */
  priceCents: number
  categoryId: string | null
  categoryName: string | null
  imageUrl: string | null
  isAvailable: boolean
  sortOrder: number
  trackStock: boolean
  stockQuantity: number
  lowStockThreshold: number
}

export interface CatalogContext {
  organizationId: string
  role: UserRole
}

// ============================================================
// Contexto da sessao (server-only)
// ============================================================

/**
 * Retorna a organizacao + cargo do usuario autenticado.
 *
 * organization_id SEMPRE vem da sessao (organization_members),
 * nunca de parametro enviado pelo client.
 */
export const getCatalogContext = cache(
  async (): Promise<CatalogContext | null> => {
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
// Leitura — categorias
// ============================================================

export const getCatalogCategories = cache(
  async (): Promise<CatalogCategoryDto[]> => {
    const context = await getCatalogContext()

    if (!context) {
      return []
    }

    const supabase = await createClient()

    const { data } = await supabase
      .from('categories')
      .select('id, name, sort_order')
      .eq('organization_id', context.organizationId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    return (data ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sort_order,
    }))
  },
)

// ============================================================
// Leitura — produtos
// ============================================================

export const getCatalogProducts = cache(
  async (): Promise<CatalogProductDto[]> => {
    const context = await getCatalogContext()

    if (!context) {
      return []
    }

    const supabase = await createClient()

    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('organization_id', context.organizationId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    return (data ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.price,
      categoryId: product.category_id,
      categoryName: product.categories?.name ?? null,
      imageUrl: product.image_url,
      isAvailable: product.is_available,
      sortOrder: product.sort_order,
      trackStock: product.track_stock,
      stockQuantity: product.stock_quantity,
      lowStockThreshold: product.low_stock_threshold,
    }))
  },
)
