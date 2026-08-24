import { ArrowClockwise } from "@phosphor-icons/react";

import type { StorefrontRecentOrderItem } from "@/lib/storefront/types";

interface ReorderSectionProps {
  items: StorefrontRecentOrderItem[];
  onReorder: (itemId: string) => void;
}

/**
 * "Peça de novo" — só deve aparecer para clientes que já têm
 * histórico real de pedidos nesta loja. Enquanto não houver login
 * de cliente + histórico vindo do backend, `items` chega vazio e
 * a seção simplesmente não renderiza.
 */
export function ReorderSection({
  items,
  onReorder,
}: ReorderSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="storefront__section storefront__section--reorder">
      <h2>Peça de novo</h2>

      <div className="reorder-list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="reorder-card"
            onClick={() => onReorder(item.id)}
          >
            <span className="reorder-card__name">
              {item.name}
            </span>

            <span className="reorder-card__detail">
              {item.detail}
            </span>

            <span className="reorder-card__action">
              <ArrowClockwise
                size={13}
                weight="bold"
              />
              Adicionar de novo
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
