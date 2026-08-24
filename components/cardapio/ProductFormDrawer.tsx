"use client";

import {
  Check,
  ImageSquare,
  Trash,
  UploadSimple,
  X,
} from "@phosphor-icons/react";
import {
  type ChangeEvent,
  useState,
} from "react";

import {
  type ProductCategory,
} from "@/lib/catalog";

import {
  createClient,
} from "@/lib/supabase/client";

export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  image: string | null;
  available: boolean;
}

interface ProductFormDrawerProps {
  open: boolean;
  product?: ProductFormData | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (
    product: ProductFormData,
  ) => void;
}

interface ProductFormContentProps {
  product?: ProductFormData | null;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (
    product: ProductFormData,
  ) => void;
}

function formatInitialPrice(
  value?: number,
) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).replace(
    ".",
    ",",
  );
}

function ProductFormContent({
  product,
  categories: categoryOptions,
  onClose,
  onSave,
}: ProductFormContentProps) {
  const [name, setName] =
    useState(
      product?.name ?? "",
    );

  const [
    description,
    setDescription,
  ] = useState(
    product?.description ?? "",
  );

  const [
    category,
    setCategory,
  ] =
    useState<ProductCategory>(
      product?.category ??
        categoryOptions[0] ??
        "",
    );

  const [price, setPrice] =
    useState(
      formatInitialPrice(
        product?.price,
      ),
    );

  const [image, setImage] =
    useState<string | null>(
      product?.image ?? null,
    );

  const [
    available,
    setAvailable,
  ] = useState(
    product?.available ?? true,
  );

  function parsePrice(
    value: string,
  ) {
    return Number(
      value
        .replace(/\./g, "")
        .replace(",", "."),
    );
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      return;
    }

    // Preview local imediato via base64
    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setImage(
          reader.result,
        );
      }
    };

    reader.readAsDataURL(file);

    // Upload para Supabase Storage
    const supabase =
      createClient();

    const fileExt =
      file.name.split(".").pop();

    const filePath =
      `products/${crypto.randomUUID()}.${fileExt}`;

    const { error } =
      await supabase.storage
        .from("product-images")
        .upload(filePath, file);

    if (error) {
      window.alert(
        "Erro ao fazer upload da imagem.",
      );
      return;
    }

    const { data } =
      supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

    setImage(
      data.publicUrl,
    );
  }

  function removeImage() {
    setImage(null);
  }

  function handleSave() {
    const normalizedName =
      name.trim();

    const normalizedDescription =
      description.trim();

    const normalizedPrice =
      parsePrice(price);

    if (
      !normalizedName ||
      !Number.isFinite(
        normalizedPrice,
      ) ||
      normalizedPrice <= 0
    ) {
      return;
    }

    onSave({
      id:
        product?.id ??
        `product-${Date.now()}`,
      name: normalizedName,
      description:
        normalizedDescription,
      category,
      price:
        normalizedPrice,
      image,
      available,
    });

    onClose();
  }

  return (
    <div className="product-drawer">
      <button
        type="button"
        className="product-drawer__backdrop"
        onClick={onClose}
        aria-label="Fechar formulário"
      />

      <aside className="product-drawer__panel">
        <header className="product-drawer__header">
          <div>
            <span>
              {product
                ? "Editar produto"
                : "Novo produto"}
            </span>

            <h2>
              {product
                ? product.name
                : "Cadastrar produto"}
            </h2>

            <p>
              Preencha os dados
              principais do item
              do cardápio.
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

        <div className="product-drawer__content">
          <div className="product-drawer__image-field">
            <span>
              Foto do produto
            </span>

            {image ? (
              <div className="product-drawer__image-preview">
                <img
                  src={image}
                  alt={
                    name
                      ? `Foto de ${name}`
                      : "Foto do produto"
                  }
                />

                <div className="product-drawer__image-actions">
                  <label>
                    <UploadSimple
                      size={17}
                      weight="bold"
                    />

                    Trocar foto

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={
                        handleImageChange
                      }
                    />
                  </label>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                  >
                    <Trash
                      size={17}
                      weight="bold"
                    />

                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <label className="product-drawer__image-upload">
                <ImageSquare
                  size={32}
                  weight="duotone"
                />

                <strong>
                  Adicionar foto
                </strong>

                <span>
                  JPG, PNG ou WEBP
                </span>

                <small>
                  Clique para
                  selecionar uma
                  imagem
                </small>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleImageChange
                  }
                />
              </label>
            )}
          </div>

          <label className="product-drawer__field">
            <span>
              Nome do produto
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Ex.: X-Bacon"
            />
          </label>

          <label className="product-drawer__field">
            <span>
              Descrição
            </span>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Descreva ingredientes ou detalhes do produto..."
              rows={4}
            />
          </label>

          <div className="product-drawer__grid">
            <label className="product-drawer__field">
              <span>
                Categoria
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target
                      .value as ProductCategory,
                  )
                }
              >
                {categoryOptions.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="product-drawer__field">
              <span>
                Preço
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value,
                  )
                }
                placeholder="0,00"
              />
            </label>
          </div>

          <div className="product-drawer__availability">
            <div>
              <strong>
                Produto disponível
              </strong>

              <span>
                Quando desligado,
                o item não fica
                disponível para
                novos pedidos.
              </span>
            </div>

            <button
              type="button"
              className={
                available
                  ? "product-drawer__toggle product-drawer__toggle--on"
                  : "product-drawer__toggle"
              }
              onClick={() =>
                setAvailable(
                  (current) =>
                    !current,
                )
              }
              aria-pressed={
                available
              }
            >
              <span />
            </button>
          </div>
        </div>

        <footer className="product-drawer__footer">
          <button
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              !name.trim() ||
              !price.trim()
            }
          >
            <Check
              size={18}
              weight="bold"
            />

            {product
              ? "Salvar alterações"
              : "Cadastrar produto"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function ProductFormDrawer({
  open,
  product,
  categories,
  onClose,
  onSave,
}: ProductFormDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <ProductFormContent
      key={
        product?.id ??
        "new-product"
      }
      product={product}
      categories={categories}
      onClose={onClose}
      onSave={onSave}
    />
  );
}