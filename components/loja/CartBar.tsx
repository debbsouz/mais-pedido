import { CaretRight } from "@phosphor-icons/react";

interface CartBarProps {
  count: number;
  total: number;
  onOpen: () => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Atalho rápido para o carrinho, visível só quando há itens.
 * Complementa (não substitui) a aba "Carrinho" da tab bar: a tab
 * bar é a navegação principal, esta barra é o CTA de conversão
 * rápida, como nos apps de delivery de referência.
 */
export function CartBar({ count, total, onOpen }: CartBarProps) {
  if (count === 0) {
    return null;
  }

  return (
    <button
      type="button"
      className="storefront__cart-bar"
      onClick={onOpen}
    >
      <span>
        {count} {count === 1 ? "item" : "itens"} ·{" "}
        {formatPrice(total)}
      </span>

      <span className="storefront__cart-bar-cta">
        Ver carrinho
        <CaretRight
          size={14}
          weight="bold"
        />
      </span>
    </button>
  );
}
