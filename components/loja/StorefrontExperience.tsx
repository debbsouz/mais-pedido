"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import { Tag } from "@phosphor-icons/react";

import type { StorefrontData } from "@/lib/storefront/types";

import { BottomTabBar, type StorefrontTab } from "./BottomTabBar";
import { CartBar } from "./CartBar";
import { CartDrawer, type CartLine } from "./CartDrawer";
import { CategoryNav } from "./CategoryNav";
import { HighlightsSection } from "./HighlightsSection";
import { MyOrdersTab } from "./MyOrdersTab";
import { PopularSection } from "./PopularSection";
import { ProductSection } from "./ProductSection";
import { PromotionCarousel } from "./PromotionCarousel";
import { ReorderSection } from "./ReorderSection";
import { StoreHeader } from "./StoreHeader";

interface StorefrontExperienceProps {
  data: StorefrontData;
  tableNumber?: string | null;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Tag;
  title: string;
  description: string;
}) {
  return (
    <div className="storefront__empty-tab">
      <Icon
        size={34}
        weight="light"
      />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

export function StorefrontExperience({
  data,
  tableNumber = null,
}: StorefrontExperienceProps) {
  const [activeCategory, setActiveCategory] =
    useState<string>("Todos");

  const [searchTerm, setSearchTerm] = useState("");

  const [quantities, setQuantities] = useState<
    Record<string, number>
  >({});

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [activeTab, setActiveTab] =
    useState<StorefrontTab>("home");

  function addToCart(productId: string) {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + 1,
    }));
  }

  function incrementItem(productId: string) {
    addToCart(productId);
  }

  function decrementItem(productId: string) {
    setQuantities((prev) => {
      const current = prev[productId] ?? 0;

      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }

      return {
        ...prev,
        [productId]: current - 1,
      };
    });
  }

  function handleSelectTab(tab: StorefrontTab) {
    if (tab === "cart") {
      setIsCartOpen(true);
      return;
    }

    setActiveTab(tab);
  }

  const visibleProducts = useMemo(() => {
    const term = normalize(searchTerm.trim());

    return data.products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch =
        term.length === 0 ||
        normalize(product.name).includes(term) ||
        normalize(product.description).includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [data.products, activeCategory, searchTerm]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<
      string,
      StorefrontData["products"]
    >();

    for (const product of visibleProducts) {
      const list = groups.get(product.category) ?? [];
      list.push(product);
      groups.set(product.category, list);
    }

    return groups;
  }, [visibleProducts]);

  const cartLines: CartLine[] = useMemo(() => {
    return Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = data.products.find(
          (item) => item.id === productId,
        );

        return {
          productId,
          name: product?.name ?? "",
          price:
            product?.promoPrice &&
            product.promoPrice < product.price
              ? product.promoPrice
              : (product?.price ?? 0),
          quantity,
        };
      });
  }, [data.products, quantities]);

  const cartCount = cartLines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  const cartTotal = cartLines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const brandStyle = {
    "--store-brand": data.brand.theme.primary,
    "--store-brand-secondary": data.brand.theme.secondary,
  } as CSSProperties;

  return (
    <div
      className="storefront"
      style={brandStyle}
      data-store-slug={data.slug}
    >
      <StoreHeader
        brand={data.brand}
        status={data.status}
        social={data.social}
        onSearch={setSearchTerm}
        showDeliveryTime={!tableNumber}
      />

      {activeTab === "home" && (
        <>
          <PromotionCarousel promos={data.promos} />

          <PopularSection
            productIds={data.popularProductIds}
            products={data.products}
            onAdd={addToCart}
          />

          <ReorderSection
            items={data.recentOrders}
            onReorder={(itemId) => {
              const match = data.recentOrders.find(
                (item) => item.id === itemId,
              );

              const product = data.products.find(
                (item) => item.name === match?.name,
              );

              if (product) {
                addToCart(product.id);
              }
            }}
          />

          <CategoryNav
            categories={data.categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />

          <HighlightsSection
            products={data.products}
            onAdd={addToCart}
          />

          <main className="storefront__products">
            {[...groupedByCategory.entries()].map(
              ([category, products]) => (
                <ProductSection
                  key={category}
                  category={category}
                  products={products}
                  quantities={quantities}
                  onAdd={addToCart}
                  onIncrement={incrementItem}
                  onDecrement={decrementItem}
                />
              ),
            )}

            {visibleProducts.length === 0 && (
              <p className="storefront__no-results">
                Nenhum produto encontrado.
              </p>
            )}
          </main>

          <CartBar
            count={cartCount}
            total={cartTotal}
            onOpen={() => setIsCartOpen(true)}
          />
        </>
      )}

      {activeTab === "orders" && (
        <MyOrdersTab
          organizationId={data.organizationId}
        />
      )}

      {activeTab === "promos" && (
        <div className="storefront__promos-tab">
          {data.promos.length === 0 ? (
            <EmptyTab
              icon={Tag}
              title="Promoções"
              description="Novidades e cupons deste restaurante vão aparecer aqui."
            />
          ) : (
            <PromotionCarousel promos={data.promos} />
          )}
        </div>
      )}

      <BottomTabBar
        active={activeTab}
        cartCount={cartCount}
        onSelect={handleSelectTab}
      />

      <CartDrawer
        open={isCartOpen}
        organizationId={data.organizationId}
        lines={cartLines}
        paymentMethods={data.paymentMethods}
        tableNumber={tableNumber}
        onClose={() => setIsCartOpen(false)}
        onIncrement={incrementItem}
        onDecrement={decrementItem}
        onOrderPlaced={() => setQuantities({})}
      />
    </div>
  );
}
