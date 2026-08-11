'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import { getCatalogContext } from '@/lib/catalog-dal'
import { roleHasPermission } from '@/lib/roles'

// ============================================================
// Tipos de retorno (padrao unico)
// ============================================================

export type CatalogActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================================
// Entradas tipadas
// ============================================================

export interface CreateProductInput {
  name: string
  description?: string
  /** Preco em CENTAVOS */
  priceCents: number
  categoryId?: string | null
  imageUrl?: string | null
  isAvailable?: boolean
}

export interface UpdateProductInput {
  name?: string
  description?: string
  /** Preco em CENTAVOS */
  priceCents?: number
  categoryId?: string | null
  imageUrl?: string | null
  isAvailable?: boolean
}

export interface ReorderItem {
  id: string
  sortOrder: number
}

// ============================================================
// Helpers internos
// ============================================================

/**
 * Converte erro do Supabase/Postgres em mensagem segura.
 * Nunca expoe SQL interno ao usuario.
 */
function toSafeError(error: {
  code?: string
  message?: string
} | null, fallback: string): string {
  if (!error) {
    return fallback
  }

  switch (error.code) {
    case '23505':
      // unique_violation
      return 'Já existe um item com esse nome.'
    case '23503':
      // foreign_key_violation
      return 'Este item está em uso e não pode ser excluído.'
    case '42501':
      return 'Você não tem permissão para esta operação.'
    default:
      return fallback
  }
}

/**
 * Exige sessao valida + cargo com permissao manageMenu (owner/manager).
 * Retorna o context ou null.
 */
async function requireCatalogWrite() {
  const context = await getCatalogContext()

  if (
    !context ||
    !roleHasPermission(context.role, 'manageMenu')
  ) {
    return null
  }

  return context
}

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: 'categories' | 'products',
  organizationId: string,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select('sort_order')
    .eq('organization_id', organizationId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const max = data?.[0]?.sort_order ?? -1
  return max + 1
}

/**
 * Valida que categoryId, se informado, pertence a MESMA organizacao.
 */
async function categoryBelongsToOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
  organizationId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('id', categoryId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  return Boolean(data)
}

// ============================================================
// CATEGORIAS
// ============================================================

export async function createCategory(
  name: string,
): Promise<CatalogActionResult<{ id: string }>> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const normalizedName = name.trim()

  if (!normalizedName) {
    return { success: false, error: 'Informe o nome da categoria.' }
  }

  const supabase = await createClient()
  const sortOrder = await nextSortOrder(supabase, 'categories', context.organizationId)

  const { data, error } = await supabase
    .from('categories')
    .insert({
      organization_id: context.organizationId,
      name: normalizedName,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível criar a categoria.'),
    }
  }

  revalidatePath('/cardapio')
  return { success: true, data: { id: data.id } }
}

export async function renameCategory(
  categoryId: string,
  name: string,
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const normalizedName = name.trim()

  if (!normalizedName) {
    return { success: false, error: 'Informe o nome da categoria.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .update({ name: normalizedName })
    .eq('id', categoryId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível renomear a categoria.'),
    }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Categoria não encontrada.' }
  }

  revalidatePath('/cardapio')
  return { success: true }
}

export async function deleteCategory(
  categoryId: string,
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('organization_id', context.organizationId)

  if (error) {
    // FK NO ACTION: categoria ainda tem produtos vinculados
    return {
      success: false,
      error: toSafeError(
        error,
        'Não é possível excluir uma categoria com produtos vinculados.',
      ),
    }
  }

  revalidatePath('/cardapio')
  return { success: true }
}

// ============================================================
// PRODUTOS
// ============================================================

export async function createProduct(
  input: CreateProductInput,
): Promise<CatalogActionResult<{ id: string }>> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const name = input.name?.trim() ?? ''
  const price = input.priceCents

  if (!name) {
    return { success: false, error: 'Informe o nome do produto.' }
  }

  if (!Number.isInteger(price) || price < 0) {
    return { success: false, error: 'Preço inválido.' }
  }

  const supabase = await createClient()
  const categoryId = input.categoryId || null

  if (categoryId) {
    const valid = await categoryBelongsToOrg(
      supabase,
      categoryId,
      context.organizationId,
    )

    if (!valid) {
      return { success: false, error: 'Categoria inválida.' }
    }
  }

  const sortOrder = await nextSortOrder(supabase, 'products', context.organizationId)

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: context.organizationId,
      category_id: categoryId,
      name,
      description: input.description?.trim() ?? '',
      price,
      image_url: input.imageUrl || null,
      is_available: input.isAvailable ?? true,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível criar o produto.'),
    }
  }

  revalidatePath('/cardapio')
  return { success: true, data: { id: data.id } }
}

export async function updateProduct(
  productId: string,
  input: UpdateProductInput,
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (input.priceCents !== undefined) {
    if (!Number.isInteger(input.priceCents) || input.priceCents < 0) {
      return { success: false, error: 'Preço inválido.' }
    }
  }

  const supabase = await createClient()

  const categoryId = input.categoryId === undefined
    ? undefined
    : (input.categoryId || null)

  if (categoryId !== undefined && categoryId !== null) {
    const valid = await categoryBelongsToOrg(
      supabase,
      categoryId,
      context.organizationId,
    )

    if (!valid) {
      return { success: false, error: 'Categoria inválida.' }
    }
  }

  const updates: Record<string, unknown> = {}

  if (input.name !== undefined) {
    const name = input.name.trim()
    if (!name) {
      return { success: false, error: 'Informe o nome do produto.' }
    }
    updates.name = name
  }

  if (input.description !== undefined) {
    updates.description = input.description.trim()
  }

  if (input.priceCents !== undefined) {
    updates.price = input.priceCents
  }

  if (categoryId !== undefined) {
    updates.category_id = categoryId
  }

  if (input.imageUrl !== undefined) {
    updates.image_url = input.imageUrl || null
  }

  if (input.isAvailable !== undefined) {
    updates.is_available = input.isAvailable
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível atualizar o produto.'),
    }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Produto não encontrado.' }
  }

  revalidatePath('/cardapio')
  return { success: true }
}

export async function toggleProductAvailability(
  productId: string,
  isAvailable: boolean,
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .update({ is_available: isAvailable })
    .eq('id', productId)
    .eq('organization_id', context.organizationId)
    .select('id')

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível atualizar o produto.'),
    }
  }

  if (!data || data.length === 0) {
    return { success: false, error: 'Produto não encontrado.' }
  }

  revalidatePath('/cardapio')
  return { success: true }
}

export async function deleteProduct(
  productId: string,
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('organization_id', context.organizationId)

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível excluir o produto.'),
    }
  }

  revalidatePath('/cardapio')
  return { success: true }
}

export async function duplicateProduct(
  productId: string,
): Promise<CatalogActionResult<{ id: string }>> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  const supabase = await createClient()

  const { data: original } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('organization_id', context.organizationId)
    .maybeSingle()

  if (!original) {
    return { success: false, error: 'Produto não encontrado.' }
  }

  const sortOrder = await nextSortOrder(supabase, 'products', context.organizationId)

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: context.organizationId,
      category_id: original.category_id,
      name: `${original.name} - Cópia`,
      description: original.description,
      price: original.price,
      image_url: original.image_url,
      is_available: original.is_available,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (error) {
    return {
      success: false,
      error: toSafeError(error, 'Não foi possível duplicar o produto.'),
    }
  }

  revalidatePath('/cardapio')
  return { success: true, data: { id: data.id } }
}

export async function updateProductsOrder(
  items: ReorderItem[],
): Promise<CatalogActionResult> {
  const context = await requireCatalogWrite()

  if (!context) {
    return { success: false, error: 'Não autorizado.' }
  }

  if (!Array.isArray(items)) {
    return { success: false, error: 'Lista de ordenação inválida.' }
  }

  if (items.length === 0) {
    return { success: true }
  }

  const supabase = await createClient()
  const ids = items.map((item) => item.id)

  // Rejeita IDs que nao pertencam a org atual (ou inexistentes)
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .in('id', ids)
    .eq('organization_id', context.organizationId)

  const foundIds = new Set((existing ?? []).map((row) => row.id))
  const missing = ids.filter((id) => !foundIds.has(id))

  if (missing.length > 0) {
    return { success: false, error: 'Alguns produtos não puderam ser atualizados.' }
  }

  for (const item of items) {
    if (!Number.isInteger(item.sortOrder)) {
      return { success: false, error: 'Ordem de classificação inválida.' }
    }

    const { error } = await supabase
      .from('products')
      .update({ sort_order: item.sortOrder })
      .eq('id', item.id)
      .eq('organization_id', context.organizationId)

    if (error) {
      return {
        success: false,
        error: toSafeError(error, 'Não foi possível reordenar os produtos.'),
      }
    }
  }

  revalidatePath('/cardapio')
  return { success: true }
}
