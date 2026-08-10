"use client";

import {
  ArrowsDownUp,
  DotsThree,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  SquaresFour,
  ToggleLeft,
  ToggleRight,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import {
  catalogCategories,
  catalogProducts,
  type CatalogCategory,
  type CatalogProduct,
} from "@/lib/catalog";

type ManagedProduct = CatalogProduct & {
  available: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function MenuManagement() {
  const [activeCategory, setActiveCategory] =
    useState<CatalogCategory>("Todos");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [products, setProducts] =
    useState<ManagedProduct[]>(
      catalogProducts.map((product) => ({
        ...product,
        available: true,
      })),
    );

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

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

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm, products]);

  function toggleAvailability(
    productId: string,
  ) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              available:
                !product.available,
            }
          : product,
      ),
    );
  }

  function getCategoryCount(
    category: CatalogCategory,
  ) {
    if (category === "Todos") {
      return products.length;
    }

    return products.filter(
      (product) =>
        product.category === category,
    ).length;
  }

  return (
    <section className="menu-admin">
      <header className="menu-admin__header">
        <div>
          <span>Gestão de cardápio</span>

          <h1>Cardápio</h1>

          <p>
            Gerencie produtos, preços,
            categorias e disponibilidade
            do restaurante.
          </p>
        </div>

        <button
          type="button"
          className="menu-admin__new"
        >
          <Plus
            size={18}
            weight="bold"
          />

          Novo produto
        </button>
      </header>

      <div className="menu-admin__toolbar">
        <div className="menu-admin__search">
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
          />
        </div>

        <button
          type="button"
          className="menu-admin__toolbar-button"
        >
          <SquaresFour size={18} />
          Gerenciar categorias
        </button>

        <button
          type="button"
          className="menu-admin__toolbar-button"
        >
          <ArrowsDownUp size={18} />
          Ordenar
        </button>
      </div>

      <div className="menu-admin__categories">
        {catalogCategories.map(
          (category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "menu-admin-category menu-admin-category--active"
                  : "menu-admin-category"
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              <span>{category}</span>

              <strong>
                {getCategoryCount(
                  category,
                )}
              </strong>
            </button>
          ),
        )}
      </div>

      <div className="menu-admin__content">
        <div className="menu-admin__list-header">
          <span>Produto</span>
          <span>Categoria</span>
          <span>Preço</span>
          <span>Status</span>
          <span>Ações</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="menu-admin__list">
            {filteredProducts.map(
              (product) => (
                <article
                  key={product.id}
                  className="menu-admin-product"
                >
                  <div className="menu-admin-product__main">
                    <div className="menu-admin-product__image">
                      {product.image}
                    </div>

                    <div>
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {
                          product.description
                        }
                      </span>
                    </div>
                  </div>

                  <div className="menu-admin-product__category">
                    {product.category}
                  </div>

                  <div className="menu-admin-product__price">
                    {formatCurrency(
                      product.price,
                    )}
                  </div>

                  <button
                    type="button"
                    className={
                      product.available
                        ? "menu-admin-product__status menu-admin-product__status--on"
                        : "menu-admin-product__status menu-admin-product__status--off"
                    }
                    onClick={() =>
                      toggleAvailability(
                        product.id,
                      )
                    }
                  >
                    {product.available ? (
                      <ToggleRight
                        size={22}
                        weight="fill"
                      />
                    ) : (
                      <ToggleLeft
                        size={22}
                      />
                    )}

                    {product.available
                      ? "Disponível"
                      : "Indisponível"}
                  </button>

                  <div className="menu-admin-product__actions">
                    <button
                      type="button"
                      className="menu-admin-product__edit"
                    >
                      <PencilSimple
                        size={17}
                        weight="bold"
                      />

                      Editar
                    </button>

                    <button
                      type="button"
                      className="menu-admin-product__more"
                      aria-label={`Mais opções de ${product.name}`}
                    >
                      <DotsThree
                        size={21}
                        weight="bold"
                      />
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="menu-admin__empty">
            <MagnifyingGlass size={28} />

            <strong>
              Nenhum produto encontrado
            </strong>

            <span>
              Tente pesquisar por outro
              produto ou categoria.
            </span>
          </div>
        )}
      </div>
    </section>
  );
}