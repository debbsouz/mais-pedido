import { ImageSquare, Plus, TrendUp } from "@phosphor-icons/react";

import type { StorefrontProduct } from "@/lib/storefront/types";

interface PopularSectionProps {
  productIds: string[];
  products: StorefrontProduct[];
  onAdd: (productId: string) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * "Mais pedidos" — usa popularidade agregada (não é histórico
 * pessoal do cliente), por isso pode aparecer para qualquer
 * visitante, inclusive quem nunca comprou. Some sozinha se a loja
 * não tiver produtos populares configurados.
 */
export function PopularSection({
  productIds,
  products,
  onAdd,
}: PopularSectionProps) {
  const items = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter(
      (product): product is StorefrontProduct =>
        Boolean(product) && product!.available,
    );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="storefront__section storefront__section--popular">
      <h2>
        <TrendUp
          size={16}
          weight="bold"
        />
        Mais pedidos
      </h2>

      <div className="product-tile-list">
        {items.map((product) => (
          <button
            key={product.id}
            type="button"
            className="product-tile"
            onClick={() => onAdd(product.id)}
          >
            <div className="product-tile__image">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                />
              ) : (
                <ImageSquare
                  size={28}
                  weight="light"
                />
              )}

              <span className="product-tile__add">
                <Plus
                  size={14}
                  weight="bold"
                />
              </span>
            </div>

            <strong>{product.name}</strong>
            <span className="product-tile__price">
              {formatPrice(product.price)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
