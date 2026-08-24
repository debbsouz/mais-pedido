"use client";

import {
  MagnifyingGlass,
  Minus,
  Plus,
  ShoppingCart,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import {
  getProductsForOrder,
  type ProductForOrder,
} from "@/app/actions/catalog";
import type { NewOrderItem } from "@/components/pedidos/OrderItemsForm";
import { formatCurrency } from "@/lib/format";

interface WaiterOrderFormProps {
  items: NewOrderItem[];
  onChange: (items: NewOrderItem[]) => void;
}

const categories = [
  "Todos",
  "Hambúrgueres",
  "Pizzas",
  "Bebidas",
  "Porções",
  "Sobremesas",
] as const;

type ActiveCategory = (typeof categories)[number];

export function WaiterOrderForm({
  items,
  onChange,
}: WaiterOrderFormProps) {
  const [products, setProducts] =
    useState<ProductForOrder[]>([]);

  const [activeCategory, setActiveCategory] =
    useState<ActiveCategory>("Todos");

  const [searchTerm, setSearchTerm] =
    useState("");

  useEffect(() => {
    void getProductsForOrder().then((data) =>
      setProducts(data),
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        product.description
          .toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesCategory && matchesSearch
      );
    });
  }, [activeCategory, searchTerm, products]);

  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  const subtotal = items.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0,
  );

  function getQuantity(
    productId: string,
  ) {
    return (
      items.find(
        (item) =>
          item.productId === productId,
      )?.quantity ?? 0
    );
  }

  function addProduct(
    product: ProductForOrder,
  ) {
    const existingItem = items.find(
      (item) =>
        item.productId === product.id,
    );

    if (existingItem) {
      onChange(
        items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item,
        ),
      );

      return;
    }

    onChange([
      ...items,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      },
    ]);
  }

  function removeProduct(
    productId: string,
  ) {
    const existingItem = items.find(
      (item) =>
        item.productId === productId,
    );

    if (!existingItem) {
      return;
    }

    if (existingItem.quantity === 1) {
      onChange(
        items.filter(
          (item) =>
            item.productId !== productId,
        ),
      );

      return;
    }

    onChange(
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity:
                item.quantity - 1,
            }
          : item,
      ),
    );
  }

  return (
    <div className="waiter-order-form">
      <div className="waiter-order-form__heading">
        <span>Nova rodada</span>

        <h3>Adicionar produtos</h3>

        <p>
          Toque nos produtos para montar
          rapidamente o pedido da mesa.
        </p>
      </div>

      <div className="waiter-order-search">
        <MagnifyingGlass size={19} />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value,
            )
          }
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
        />
      </div>

      <div className="waiter-order-categories">
        {categories.map(
          (category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory ===
                category
                  ? "waiter-order-category waiter-order-category--active"
                  : "waiter-order-category"
              }
              onClick={() =>
                setActiveCategory(
                  category,
                )
              }
            >
              {category}
            </button>
          ),
        )}
      </div>

      <div className="waiter-order-products">
        {filteredProducts.map(
          (product) => {
            const quantity =
              getQuantity(product.id);

            return (
              <article
                key={product.id}
                className={`waiter-product ${
                  quantity > 0
                    ? "waiter-product--selected"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="waiter-product__main"
                  onClick={() =>
                    addProduct(product)
                  }
                >
                  <span className="waiter-product__image">
                    {product.image}
                  </span>

                  <span className="waiter-product__content">
                    <small>
                      {product.category}
                    </small>

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      {product.description}
                    </span>

                    <b>
                      {formatCurrency(
                        product.price,
                      )}
                    </b>
                  </span>
                </button>

                <div className="waiter-product__quantity">
                  {quantity > 0 && (
                    <>
                      <button
                        type="button"
                        aria-label={`Remover ${product.name}`}
                        onClick={() =>
                          removeProduct(
                            product.id,
                          )
                        }
                      >
                        <Minus
                          size={17}
                          weight="bold"
                        />
                      </button>

                      <strong>
                        {quantity}
                      </strong>
                    </>
                  )}

                  <button
                    type="button"
                    aria-label={`Adicionar ${product.name}`}
                    onClick={() =>
                      addProduct(product)
                    }
                  >
                    <Plus
                      size={17}
                      weight="bold"
                    />
                  </button>
                </div>
              </article>
            );
          },
        )}
      </div>

      {filteredProducts.length === 0 && (
        <div className="waiter-order-empty">
          <MagnifyingGlass size={26} />

          <strong>
            Nenhum produto encontrado
          </strong>

          <span>
            Tente pesquisar por outro
            produto.
          </span>
        </div>
      )}

      <div className="waiter-order-summary">
        <div>
          <ShoppingCart
            size={18}
            weight="fill"
          />

          <span>
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "itens"}
          </span>
        </div>

        <strong>
          {formatCurrency(subtotal)}
        </strong>
      </div>
    </div>
  );
}
