import { ImageSquare, Plus } from "@phosphor-icons/react";

import type { StorefrontProduct } from "@/lib/storefront/types";

interface HighlightsSectionProps {
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
 * "Destaques" — produtos com preço promocional configurado
 * (promoPrice). Opcional: some sozinha se nenhum produto tiver
 * desconto configurado, já que nem todo estabelecimento vai
 * querer trabalhar com promoções.
 */
export function HighlightsSection({
  products,
  onAdd,
}: HighlightsSectionProps) {
  const items = products.filter(
    (product) =>
      product.available &&
      typeof product.promoPrice === "number" &&
      product.promoPrice < product.price,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="storefront__section storefront__section--highlights">
      <h2>Destaques</h2>

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
              <s>{formatPrice(product.price)}</s>
              {formatPrice(product.promoPrice as number)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
