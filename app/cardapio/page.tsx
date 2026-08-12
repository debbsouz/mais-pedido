import {
  MenuManagement,
  type ManagedProduct,
} from "@/components/cardapio/MenuManagement";

import {
  getCatalogCategories,
  getCatalogProducts,
  type CatalogProductDto,
} from "@/lib/catalog-dal";

import type { ProductCategory } from "@/lib/catalog";

/**
 * Converte um produto do backend (DTO) no formato consumido pelo
 * frontend (ManagedProduct).
 *
 * Conversoes explicitas:
 * - priceCents (centavos, inteiro) → price (decimal R$)
 *   A conversao de centavos acontece SOMENTE aqui, na camada de UI.
 * - categoryId + categoryName → category (string usada pelo frontend)
 * - imageUrl → image
 * - isAvailable → available
 */
function toManagedProduct(
  product: CatalogProductDto,
): ManagedProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.categoryName ?? "",
    price: product.priceCents / 100,
    image: product.imageUrl,
    available: product.isAvailable,
  };
}

/**
 * ETAPA 3 — Leitura real do cardapio.
 *
 * Server Component: busca categorias e produtos diretamente do
 * Supabase (via catalog-dal) e passa como props iniciais para o
 * MenuManagement (Client Component).
 *
 * Se o banco estiver vazio, os arrays vem vazios — nao ha fallback
 * para os mocks de lib/catalog.ts.
 */
export default async function CardapioPage() {
  const [categoryDtos, productDtos] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);

  const categories: ProductCategory[] = categoryDtos.map(
    (category) => category.name,
  );

  /**
   * Mapa nome → UUID para resolver o categoryId no momento da criacao
   * de produtos. Construido aqui (Server Component) e passado ao
   * MenuManagement, que combina com categorias criadas localmente.
   */
  const categoryMap: Record<string, string> = Object.fromEntries(
    categoryDtos.map((category) => [category.name, category.id]),
  );

  const products = productDtos.map(toManagedProduct);

  return (
    <MenuManagement
      categories={categories}
      categoryMap={categoryMap}
      products={products}
    />
  );
}
