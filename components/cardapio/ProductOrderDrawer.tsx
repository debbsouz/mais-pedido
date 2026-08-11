"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  X,
} from "@phosphor-icons/react";

import type { CatalogProduct } from "@/lib/catalog";

interface OrderedProduct
  extends CatalogProduct {
  available: boolean;
}

interface ProductOrderDrawerProps {
  open: boolean;
  products: OrderedProduct[];
  onClose: () => void;
  onMoveUp: (
    productId: string,
  ) => void;
  onMoveDown: (
    productId: string,
  ) => void;
}

export function ProductOrderDrawer({
  open,
  products,
  onClose,
  onMoveUp,
  onMoveDown,
}: ProductOrderDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="product-order-drawer">
      <button
        type="button"
        className="product-order-drawer__backdrop"
        onClick={onClose}
        aria-label="Fechar ordenação"
      />

      <aside className="product-order-drawer__panel">
        <header className="product-order-drawer__header">
          <div>
            <span>
              Organização do cardápio
            </span>

            <h2>
              Ordenar produtos
            </h2>

            <p>
              Defina a ordem em que os
              produtos serão exibidos
              no cardápio.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X
              size={20}
              weight="bold"
            />
          </button>
        </header>

        <div className="product-order-drawer__content">
          <div className="product-order-drawer__notice">
            <strong>
              Ordem de exibição
            </strong>

            <span>
              Use as setas para mover
              um produto para cima ou
              para baixo.
            </span>
          </div>

          <div className="product-order-drawer__list">
            {products.map(
              (product, index) => (
                <article
                  key={product.id}
                  className="product-order-item"
                >
                  <div className="product-order-item__position">
                    {index + 1}
                  </div>

                  <div className="product-order-item__image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    ) : (
                      <span>
                        🍽️
                      </span>
                    )}
                  </div>

                  <div className="product-order-item__info">
                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.category}
                    </span>
                  </div>

                  <div className="product-order-item__actions">
                    <button
                      type="button"
                      onClick={() =>
                        onMoveUp(
                          product.id,
                        )
                      }
                      disabled={
                        index === 0
                      }
                      aria-label={`Mover ${product.name} para cima`}
                    >
                      <ArrowUp
                        size={17}
                        weight="bold"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onMoveDown(
                          product.id,
                        )
                      }
                      disabled={
                        index ===
                        products.length -
                          1
                      }
                      aria-label={`Mover ${product.name} para baixo`}
                    >
                      <ArrowDown
                        size={17}
                        weight="bold"
                      />
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>

        <footer className="product-order-drawer__footer">
          <button
            type="button"
            onClick={onClose}
          >
            <Check
              size={18}
              weight="bold"
            />

            Concluir
          </button>
        </footer>
      </aside>
    </div>
  );
}