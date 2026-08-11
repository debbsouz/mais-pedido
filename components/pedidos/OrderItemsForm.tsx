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

type ProductCategory =
  | "Hambúrgueres"
  | "Pizzas"
  | "Bebidas"
  | "Porções"
  | "Sobremesas";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

export interface NewOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderItemsFormProps {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function OrderItemsForm({
  items,
  onChange,
}: OrderItemsFormProps) {
  const [products, setProducts] =
    useState<ProductForOrder[]>([]);

  const [activeCategory, setActiveCategory] =
    useState<ActiveCategory>("Todos");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    void getProductsForOrder().then(
      (data) => setProducts(data),
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
          .includes(normalizedSearch) ||
        product.category
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, products]);

  const subtotal = items.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0,
  );

  function getQuantity(productId: string) {
    return (
      items.find(
        (item) => item.productId === productId,
      )?.quantity ?? 0
    );
  }

  function addProduct(product: Product) {
    const existingItem = items.find(
      (item) => item.productId === product.id,
    );

    if (existingItem) {
      onChange(
        items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
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

  function removeProduct(productId: string) {
    const existingItem = items.find(
      (item) => item.productId === productId,
    );

    if (!existingItem) {
      return;
    }

    if (existingItem.quantity === 1) {
      onChange(
        items.filter(
          (item) => item.productId !== productId,
        ),
      );

      return;
    }

    onChange(
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      ),
    );
  }

  return (
    <div className="order-items-form">
      <div className="order-items-form__heading">
        <span>Montagem do pedido</span>
        <h3>Escolha os produtos</h3>

        <p>
          Pesquise ou navegue pelas categorias para
          adicionar produtos à comanda.
        </p>
      </div>

      <div className="order-items-form__search">
        <MagnifyingGlass size={20} />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
        />
      </div>

      <div className="order-items-form__categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "order-items-category order-items-category--active"
                : "order-items-category"
            }
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      <div className="order-items-form__products">
        {filteredProducts.map((product) => {
          const quantity = getQuantity(product.id);

          return (
            <article
              key={product.id}
              className={
                quantity > 0
                  ? "order-product-card order-product-card--selected"
                  : "order-product-card"
              }
            >
              <div className="order-product-card__image">
                <span>{product.image}</span>

                {quantity > 0 && (
                  <strong>{quantity}</strong>
                )}
              </div>

              <div className="order-product-card__content">
                <span>{product.category}</span>

                <h4>{product.name}</h4>

                <p>{product.description}</p>

                <strong>
                  {formatCurrency(product.price)}
                </strong>
              </div>

              <div className="order-product-card__actions">
                {quantity > 0 && (
                  <button
                    type="button"
                    aria-label={`Remover ${product.name}`}
                    onClick={() =>
                      removeProduct(product.id)
                    }
                  >
                    <Minus size={17} weight="bold" />
                  </button>
                )}

                {quantity > 0 && (
                  <span>{quantity}</span>
                )}

                <button
                  type="button"
                  aria-label={`Adicionar ${product.name}`}
                  onClick={() => addProduct(product)}
                >
                  <Plus size={17} weight="bold" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="order-items-form__empty">
          <MagnifyingGlass size={26} />

          <strong>Nenhum produto encontrado</strong>

          <span>
            Tente pesquisar por outro nome ou categoria.
          </span>
        </div>
      )}

      <section className="order-items-summary">
        <div className="order-items-summary__header">
          <div>
            <ShoppingCart size={20} />

            <div>
              <strong>Comanda</strong>

              <span>
                {items.reduce(
                  (total, item) =>
                    total + item.quantity,
                  0,
                )}{" "}
                itens
              </span>
            </div>
          </div>

          <strong>{formatCurrency(subtotal)}</strong>
        </div>

        {items.length === 0 ? (
          <p className="order-items-summary__empty">
            Nenhum produto adicionado.
          </p>
        ) : (
          <div className="order-items-summary__list">
            {items.map((item) => (
              <div key={item.productId}>
                <span>
                  {item.quantity}x {item.name}
                </span>

                <strong>
                  {formatCurrency(
                    item.price * item.quantity,
                  )}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}