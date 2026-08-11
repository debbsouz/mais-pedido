"use client";

import {
  Check,
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";

import type {
  ProductCategory,
} from "@/lib/catalog";

interface CategoryManagerDrawerProps {
  open: boolean;
  categories: ProductCategory[];
  getProductCount: (
    category: ProductCategory,
  ) => number;
  onClose: () => void;
  onAdd: (name: string) => void;
  onRename: (
    oldName: ProductCategory,
    newName: string,
  ) => void;
  onDelete: (
    category: ProductCategory,
  ) => void;
}

export function CategoryManagerDrawer({
  open,
  categories,
  getProductCount,
  onClose,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerDrawerProps) {
  const [newCategory, setNewCategory] =
    useState("");

  const [
    editingCategory,
    setEditingCategory,
  ] = useState<ProductCategory | null>(
    null,
  );

  const [editingName, setEditingName] =
    useState("");

  function handleAdd() {
    const normalizedName =
      newCategory.trim();

    if (!normalizedName) {
      return;
    }

    onAdd(normalizedName);
    setNewCategory("");
  }

  function startEditing(
    category: ProductCategory,
  ) {
    setEditingCategory(category);
    setEditingName(category);
  }

  function cancelEditing() {
    setEditingCategory(null);
    setEditingName("");
  }

  function saveEditing() {
    if (!editingCategory) {
      return;
    }

    const normalizedName =
      editingName.trim();

    if (!normalizedName) {
      return;
    }

    onRename(
      editingCategory,
      normalizedName,
    );

    cancelEditing();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="category-drawer">
      <button
        type="button"
        className="category-drawer__backdrop"
        onClick={onClose}
        aria-label="Fechar categorias"
      />

      <aside className="category-drawer__panel">
        <header className="category-drawer__header">
          <div>
            <span>
              Organização do cardápio
            </span>

            <h2>
              Gerenciar categorias
            </h2>

            <p>
              Crie e organize as
              categorias usadas nos
              produtos.
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

        <div className="category-drawer__content">
          <div className="category-drawer__new">
            <label>
              Nova categoria

              <div>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter"
                    ) {
                      handleAdd();
                    }
                  }}
                  placeholder="Ex.: Combos"
                />

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={
                    !newCategory.trim()
                  }
                >
                  <Plus
                    size={17}
                    weight="bold"
                  />

                  Adicionar
                </button>
              </div>
            </label>
          </div>

          <div className="category-drawer__section-heading">
            <span>
              Categorias
            </span>

            <strong>
              {categories.length}
            </strong>
          </div>

          <div className="category-drawer__list">
            {categories.map(
              (category) => {
                const productCount =
                  getProductCount(
                    category,
                  );

                const isEditing =
                  editingCategory ===
                  category;

                return (
                  <article
                    key={category}
                    className="category-drawer__item"
                  >
                    {isEditing ? (
                      <div className="category-drawer__editing">
                        <input
                          type="text"
                          value={
                            editingName
                          }
                          autoFocus
                          onChange={(
                            event,
                          ) =>
                            setEditingName(
                              event
                                .target
                                .value,
                            )
                          }
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              saveEditing();
                            }

                            if (
                              event.key ===
                              "Escape"
                            ) {
                              cancelEditing();
                            }
                          }}
                        />

                        <button
                          type="button"
                          className="category-drawer__confirm"
                          onClick={
                            saveEditing
                          }
                          aria-label="Salvar nome"
                        >
                          <Check
                            size={17}
                            weight="bold"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEditing
                          }
                          aria-label="Cancelar edição"
                        >
                          <X
                            size={17}
                            weight="bold"
                          />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="category-drawer__item-info">
                          <strong>
                            {category}
                          </strong>

                          <span>
                            {productCount}{" "}
                            {productCount ===
                            1
                              ? "produto"
                              : "produtos"}
                          </span>
                        </div>

                        <div className="category-drawer__item-actions">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                category,
                              )
                            }
                            aria-label={`Editar ${category}`}
                          >
                            <PencilSimple
                              size={17}
                              weight="bold"
                            />
                          </button>

                          <button
                            type="button"
                            className="category-drawer__delete"
                            onClick={() =>
                              onDelete(
                                category,
                              )
                            }
                            disabled={
                              productCount >
                              0
                            }
                            title={
                              productCount >
                              0
                                ? "Mova ou exclua os produtos desta categoria antes de excluí-la."
                                : "Excluir categoria"
                            }
                            aria-label={`Excluir ${category}`}
                          >
                            <Trash
                              size={17}
                              weight="bold"
                            />
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              },
            )}
          </div>

          <div className="category-drawer__tip">
            <strong>
              Exclusão protegida
            </strong>

            <span>
              Categorias que possuem
              produtos não podem ser
              excluídas. Primeiro mova os
              produtos para outra
              categoria.
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}