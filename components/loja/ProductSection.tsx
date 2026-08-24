import type { StorefrontProduct } from "@/lib/storefront/types";

import { ProductCard } from "./ProductCard";

interface ProductSectionProps {
  category: string;
  products: StorefrontProduct[];
  quantities: Record<string, number>;
  onAdd: (productId: string) => void;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
}

export function ProductSection({
  category,
  products,
  quantities,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductSectionProps) {
  return (
    <section className="storefront__section">
      <h2>{category}</h2>

      <div className="storefront__list">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            onAdd={() => onAdd(product.id)}
            onIncrement={() => onIncrement(product.id)}
            onDecrement={() => onDecrement(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
