"use client";

import {
  Copy,
  Eye,
  EyeSlash,
  Trash,
  X,
} from "@phosphor-icons/react";

interface ProductActionsMenuProps {
  open: boolean;
  productName: string;
  available: boolean;
  onClose: () => void;
  onDuplicate: () => void;
  onToggleAvailability: () => void;
  onDelete: () => void;
}

export function ProductActionsMenu({
  open,
  productName,
  available,
  onClose,
  onDuplicate,
  onToggleAvailability,
  onDelete,
}: ProductActionsMenuProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="product-actions-menu">
      <button
        type="button"
        className="product-actions-menu__backdrop"
        onClick={onClose}
        aria-label="Fechar ações"
      />

      <section className="product-actions-menu__card">
        <header>
          <div>
            <span>
              Ações do produto
            </span>

            <strong>
              {productName}
            </strong>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X
              size={18}
              weight="bold"
            />
          </button>
        </header>

        <div className="product-actions-menu__actions">
          <button
            type="button"
            onClick={onDuplicate}
          >
            <Copy
              size={18}
              weight="bold"
            />

            <div>
              <strong>
                Duplicar produto
              </strong>

              <span>
                Cria uma cópia para editar.
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={onToggleAvailability}
          >
            {available ? (
              <EyeSlash
                size={18}
                weight="bold"
              />
            ) : (
              <Eye
                size={18}
                weight="bold"
              />
            )}

            <div>
              <strong>
                {available
                  ? "Marcar indisponível"
                  : "Marcar disponível"}
              </strong>

              <span>
                {available
                  ? "Pausa este produto temporariamente."
                  : "Volta a aceitar pedidos deste produto."}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="product-actions-menu__delete"
            onClick={onDelete}
          >
            <Trash
              size={18}
              weight="bold"
            />

            <div>
              <strong>
                Excluir produto
              </strong>

              <span>
                Remove o produto do cardápio.
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}