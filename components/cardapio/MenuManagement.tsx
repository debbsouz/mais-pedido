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
  type CatalogProduct,
  type ProductCategory,
} from "@/lib/catalog";

import {
  ProductFormDrawer,
  type ProductFormData,
} from "./ProductFormDrawer";

import { CategoryManagerDrawer } from "./CategoryManagerDrawer";

import { ProductOrderDrawer } from "./ProductOrderDrawer";

import { ProductActionsMenu } from "./ProductActionsMenu";

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
  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string>("Todos");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    categories,
    setCategories,
  ] = useState<ProductCategory[]>(
    catalogCategories.filter(
      (category) =>
        category !== "Todos",
    ) as ProductCategory[],
  );

  const [
    products,
    setProducts,
  ] = useState<ManagedProduct[]>(
    catalogProducts.map(
      (product) => ({
        ...product,
        available: true,
      }),
    ),
  );

  const [
    isProductDrawerOpen,
    setIsProductDrawerOpen,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<ProductFormData | null>(
    null,
  );

  const [
    isCategoryDrawerOpen,
    setIsCategoryDrawerOpen,
  ] = useState(false);

  const [
    isOrderDrawerOpen,
    setIsOrderDrawerOpen,
  ] = useState(false);

  const [
  selectedActionProduct,
  setSelectedActionProduct,
] = useState<ManagedProduct | null>(
  null,
);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLowerCase();

    return products.filter(
      (product) => {
        const matchesCategory =
          activeCategory === "Todos" ||
          product.category ===
            activeCategory;

        const matchesSearch =
          !normalizedSearch ||
          product.name
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          product.description
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        return (
          matchesCategory &&
          matchesSearch
        );
      },
    );
  }, [
    activeCategory,
    searchTerm,
    products,
  ]);

  function toggleAvailability(
    productId: string,
  ) {
    setProducts(
      (currentProducts) =>
        currentProducts.map(
          (product) =>
            product.id ===
            productId
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
    category: string,
  ) {
    if (category === "Todos") {
      return products.length;
    }

    return products.filter(
      (product) =>
        product.category ===
        category,
    ).length;
  }

  function openNewProduct() {
    setEditingProduct(null);
    setIsProductDrawerOpen(true);
  }

  function openEditProduct(
    product: ManagedProduct,
  ) {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description:
        product.description,
      category:
        product.category,
      price: product.price,
      image: product.image,
      available:
        product.available,
    });

    setIsProductDrawerOpen(true);
  }

  function closeProductDrawer() {
    setEditingProduct(null);
    setIsProductDrawerOpen(false);
  }

  function saveProduct(
    product: ProductFormData,
  ) {
    setProducts(
      (currentProducts) => {
        const exists =
          currentProducts.some(
            (currentProduct) =>
              currentProduct.id ===
              product.id,
          );

        if (exists) {
          return currentProducts.map(
            (currentProduct) =>
              currentProduct.id ===
              product.id
                ? {
                    ...currentProduct,
                    ...product,
                  }
                : currentProduct,
          );
        }

        return [
          product,
          ...currentProducts,
        ];
      },
    );
  }

  function addCategory(
    name: string,
  ) {
    const normalizedName =
      name.trim();

    if (!normalizedName) {
      return;
    }

    const alreadyExists =
      categories.some(
        (category) =>
          category.toLowerCase() ===
          normalizedName.toLowerCase(),
      );

    if (
      alreadyExists ||
      normalizedName.toLowerCase() ===
        "todos"
    ) {
      return;
    }

    setCategories(
      (currentCategories) => [
        ...currentCategories,
        normalizedName,
      ],
    );
  }

  function renameCategory(
    oldName: ProductCategory,
    newName: string,
  ) {
    const normalizedName =
      newName.trim();

    if (!normalizedName) {
      return;
    }

    const alreadyExists =
      categories.some(
        (category) =>
          category !== oldName &&
          category.toLowerCase() ===
            normalizedName.toLowerCase(),
      );

    if (
      alreadyExists ||
      normalizedName.toLowerCase() ===
        "todos"
    ) {
      return;
    }

    setCategories(
      (currentCategories) =>
        currentCategories.map(
          (category) =>
            category === oldName
              ? normalizedName
              : category,
        ),
    );

    setProducts(
      (currentProducts) =>
        currentProducts.map(
          (product) =>
            product.category ===
            oldName
              ? {
                  ...product,
                  category:
                    normalizedName,
                }
              : product,
        ),
    );

    if (
      activeCategory ===
      oldName
    ) {
      setActiveCategory(
        normalizedName,
      );
    }

    if (
      editingProduct?.category ===
      oldName
    ) {
      setEditingProduct(
        (currentProduct) =>
          currentProduct
            ? {
                ...currentProduct,
                category:
                  normalizedName,
              }
            : null,
      );
    }
  }

  function deleteCategory(
    category: ProductCategory,
  ) {
    const productCount =
      getCategoryCount(
        category,
      );

    if (productCount > 0) {
      return;
    }

    setCategories(
      (currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory !==
            category,
        ),
    );

    if (
      activeCategory ===
      category
    ) {
      setActiveCategory(
        "Todos",
      );
    }
  }

  function moveProductUp(
    productId: string,
  ) {
    setProducts(
      (currentProducts) => {
        const currentIndex =
          currentProducts.findIndex(
            (product) =>
              product.id ===
              productId,
          );

        if (
          currentIndex <= 0
        ) {
          return currentProducts;
        }

        const reorderedProducts = [
          ...currentProducts,
        ];

        [
          reorderedProducts[
            currentIndex - 1
          ],
          reorderedProducts[
            currentIndex
          ],
        ] = [
          reorderedProducts[
            currentIndex
          ],
          reorderedProducts[
            currentIndex - 1
          ],
        ];

        return reorderedProducts;
      },
    );
  }

  function moveProductDown(
    productId: string,
  ) {
    setProducts(
      (currentProducts) => {
        const currentIndex =
          currentProducts.findIndex(
            (product) =>
              product.id ===
              productId,
          );

        if (
          currentIndex === -1 ||
          currentIndex >=
            currentProducts.length -
              1
        ) {
          return currentProducts;
        }

        const reorderedProducts = [
          ...currentProducts,
        ];

        [
          reorderedProducts[
            currentIndex
          ],
          reorderedProducts[
            currentIndex + 1
          ],
        ] = [
          reorderedProducts[
            currentIndex + 1
          ],
          reorderedProducts[
            currentIndex
          ],
        ];

        return reorderedProducts;
      },
    );
  }


  function duplicateProduct(
    product: ManagedProduct,
  ) {
    const duplicatedProduct: ManagedProduct = {
      ...product,
      id: `product-${Date.now()}`,
      name: `${product.name} - Cópia`,
    };

    setProducts((currentProducts) => {
      const productIndex =
        currentProducts.findIndex(
          (currentProduct) =>
            currentProduct.id === product.id,
        );

      if (productIndex === -1) {
        return [
          duplicatedProduct,
          ...currentProducts,
        ];
      }

      const updatedProducts = [
        ...currentProducts,
      ];

      updatedProducts.splice(
        productIndex + 1,
        0,
        duplicatedProduct,
      );

      return updatedProducts;
    });

    setSelectedActionProduct(null);
  }

  function deleteProduct(
    productId: string,
  ) {
    const shouldDelete = window.confirm(
      "Tem certeza de que deseja excluir este produto?",
    );

    if (!shouldDelete) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) =>
          product.id !== productId,
      ),
    );

    setSelectedActionProduct(null);
  }

  function toggleProductFromActions(
    productId: string,
  ) {
    toggleAvailability(productId);

    setSelectedActionProduct(
      (currentProduct) =>
        currentProduct
          ? {
              ...currentProduct,
              available:
                !currentProduct.available,
            }
          : null,
    );
  }

  return (
    <section className="menu-admin">
      <header className="menu-admin__header">
        <div>
          <span>
            Gestão de cardápio
          </span>

          <h1>
            Cardápio
          </h1>

          <p>
            Gerencie produtos,
            preços, categorias e
            disponibilidade do
            restaurante.
          </p>
        </div>

        <button
          type="button"
          className="menu-admin__new"
          onClick={
            openNewProduct
          }
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
          <MagnifyingGlass
            size={19}
          />

          <input
            type="search"
            value={
              searchTerm
            }
            onChange={(
              event,
            ) =>
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
          onClick={() =>
            setIsCategoryDrawerOpen(
              true,
            )
          }
        >
          <SquaresFour
            size={18}
          />

          Gerenciar categorias
        </button>

        <button
          type="button"
          className="menu-admin__toolbar-button"
          onClick={() =>
            setIsOrderDrawerOpen(
              true,
            )
          }
        >
          <ArrowsDownUp
            size={18}
          />

          Ordenar
        </button>
      </div>

      <div className="menu-admin__categories">
        <button
          type="button"
          className={
            activeCategory ===
            "Todos"
              ? "menu-admin-category menu-admin-category--active"
              : "menu-admin-category"
          }
          onClick={() =>
            setActiveCategory(
              "Todos",
            )
          }
        >
          <span>
            Todos
          </span>

          <strong>
            {products.length}
          </strong>
        </button>

        {categories.map(
          (category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory ===
                category
                  ? "menu-admin-category menu-admin-category--active"
                  : "menu-admin-category"
              }
              onClick={() =>
                setActiveCategory(
                  category,
                )
              }
            >
              <span>
                {category}
              </span>

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
          <span>
            Produto
          </span>

          <span>
            Categoria
          </span>

          <span>
            Preço
          </span>

          <span>
            Status
          </span>

          <span>
            Ações
          </span>
        </div>

        {filteredProducts.length >
        0 ? (
          <div className="menu-admin__list">
            {filteredProducts.map(
              (product) => (
                <article
                  key={
                    product.id
                  }
                  className="menu-admin-product"
                >
                  <div className="menu-admin-product__main">
                    <div className="menu-admin-product__image">
                      {product.image ? (
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <span
                          className="menu-admin-product__image-placeholder"
                          aria-hidden="true"
                        >
                          🍽️
                        </span>
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <span>
                        {
                          product.description
                        }
                      </span>
                    </div>
                  </div>

                  <div className="menu-admin-product__category">
                    {
                      product.category
                    }
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
                      onClick={() =>
                        openEditProduct(
                          product,
                        )
                      }
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
                      onClick={() =>
                        setSelectedActionProduct(
                          product,
                        )
                      }
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
            <MagnifyingGlass
              size={28}
            />

            <strong>
              Nenhum produto
              encontrado
            </strong>

            <span>
              Tente pesquisar por
              outro produto ou
              categoria.
            </span>
          </div>
        )}
      </div>

      <ProductFormDrawer
        open={
          isProductDrawerOpen
        }
        product={
          editingProduct
        }
        onClose={
          closeProductDrawer
        }
        onSave={
          saveProduct
        }
      />

      <CategoryManagerDrawer
        open={
          isCategoryDrawerOpen
        }
        categories={
          categories
        }
        getProductCount={
          getCategoryCount
        }
        onClose={() =>
          setIsCategoryDrawerOpen(
            false,
          )
        }
        onAdd={
          addCategory
        }
        onRename={
          renameCategory
        }
        onDelete={
          deleteCategory
        }
      />

      <ProductOrderDrawer
        open={
          isOrderDrawerOpen
        }
        products={
          products
        }
        onClose={() =>
          setIsOrderDrawerOpen(
            false,
          )
        }
        onMoveUp={
          moveProductUp
        }
        onMoveDown={
          moveProductDown
        }
      />

      <ProductActionsMenu
        open={
          selectedActionProduct !== null
        }
        productName={
          selectedActionProduct?.name ?? ""
        }
        available={
          selectedActionProduct?.available ??
          false
        }
        onClose={() =>
          setSelectedActionProduct(null)
        }
        onDuplicate={() => {
          if (!selectedActionProduct) {
            return;
          }

          duplicateProduct(
            selectedActionProduct,
          );
        }}
        onToggleAvailability={() => {
          if (!selectedActionProduct) {
            return;
          }

          toggleProductFromActions(
            selectedActionProduct.id,
          );
        }}
        onDelete={() => {
          if (!selectedActionProduct) {
            return;
          }

          deleteProduct(
            selectedActionProduct.id,
          );
        }}
      />
    </section>
  );
}