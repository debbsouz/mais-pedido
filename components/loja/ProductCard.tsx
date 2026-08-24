import {
  ImageSquare,
  Minus,
  Plus,
} from "@phosphor-icons/react";

import type { StorefrontProduct } from "@/lib/storefront/types";

interface ProductCardProps {
  product: StorefrontProduct;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  const hasPromo =
    typeof product.promoPrice === "number" &&
    product.promoPrice < product.price;

  return (
    <article
      className="product-row"
      data-unavailable={
        product.available ? undefined : "true"
      }
    >
      <div className="product-row__image">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
          />
        ) : (
          <ImageSquare
            size={26}
            weight="light"
          />
        )}
      </div>

      <div className="product-row__info">
        <strong>{product.name}</strong>
        <p>{product.description}</p>

        {product.available ? (
          <span className="product-row__price">
            {hasPromo && (
              <s>{formatPrice(product.price)}</s>
            )}
            {formatPrice(
              hasPromo
                ? (product.promoPrice as number)
                : product.price,
            )}
          </span>
        ) : (
          <span className="product-row__unavailable">
            Indisponível no momento
          </span>
        )}
      </div>

      {product.available &&
        (quantity > 0 ? (
          <div className="product-row__stepper">
            <button
              type="button"
              onClick={onDecrement}
              aria-label={`Remover ${product.name}`}
            >
              <Minus
                size={13}
                weight="bold"
              />
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={onIncrement}
              aria-label={`Adicionar mais um ${product.name}`}
            >
              <Plus
                size={13}
                weight="bold"
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="product-row__add"
            onClick={onAdd}
            aria-label={`Adicionar ${product.name}`}
          >
            <Plus
              size={15}
              weight="bold"
            />
          </button>
        ))}
    </article>
  );
}
