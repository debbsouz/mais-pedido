"use client";

import { useState } from "react";

import {
  MagnifyingGlass,
  ShareNetwork,
  Star,
} from "@phosphor-icons/react";

import type {
  StorefrontBrand,
  StorefrontSocial,
  StorefrontStatus,
} from "@/lib/storefront/types";

import { SocialLinks } from "./SocialLinks";

interface StoreHeaderProps {
  brand: StorefrontBrand;
  status: StorefrontStatus;
  social: StorefrontSocial;
  onSearch: (term: string) => void;
  showDeliveryTime?: boolean;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function StoreHeader({
  brand,
  status,
  social,
  onSearch,
  showDeliveryTime = true,
}: StoreHeaderProps) {
  const hasDeliveryTime =
    showDeliveryTime &&
    status.deliveryTimeMinMinutes !== null &&
    status.deliveryTimeMaxMinutes !== null;
  const [isSearchOpen, setIsSearchOpen] =
    useState(false);

  const [shareFeedback, setShareFeedback] =
    useState<string | null>(null);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: brand.name,
          url,
        });
      } catch {
        // Usuário cancelou o compartilhamento — ignora.
      }

      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareFeedback("Link copiado!");

      window.setTimeout(
        () => setShareFeedback(null),
        2000,
      );
    } catch {
      // Sem permissão de área de transferência — ignora.
    }
  }

  return (
    <header className="storefront__header">
      <div
        className="storefront__banner"
        data-empty={brand.bannerUrl ? undefined : "true"}
      >
        {brand.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.bannerUrl}
            alt=""
          />
        )}
      </div>

      <div className="storefront__identity">
        <div className="storefront__logo">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
            />
          ) : (
            brand.initials
          )}
        </div>

        <div className="storefront__identity-text">
          <h1>{brand.name}</h1>

          <span className="storefront__identity-meta">
            <span className="storefront__type">
              {brand.type}
            </span>

            {brand.reviewCount > 0 && (
              <span className="storefront__rating">
                <Star
                  size={12}
                  weight="fill"
                />
                {brand.rating.toFixed(1)}
                <em>({brand.reviewCount})</em>
              </span>
            )}
          </span>
        </div>

        <div className="storefront__header-actions">
          <div className="storefront__share-wrap">
            <button
              type="button"
              aria-label="Compartilhar loja"
              onClick={handleShare}
            >
              <ShareNetwork
                size={18}
                weight="bold"
              />
            </button>

            {shareFeedback && (
              <span className="storefront__share-feedback">
                {shareFeedback}
              </span>
            )}
          </div>

          <button
            type="button"
            aria-label="Buscar produtos"
            onClick={() =>
              setIsSearchOpen((open) => !open)
            }
          >
            <MagnifyingGlass
              size={18}
              weight="bold"
            />
          </button>
        </div>
      </div>

      <div className="storefront__info-row">
        <span
          className={`storefront__status storefront__status--${
            status.isOpen ? "open" : "closed"
          }`}
        >
          {status.isOpen ? "Aberto" : "Fechado"}
        </span>

        <span className="storefront__info-divider">
          ·
        </span>

        <span>
          Pedido mín. {formatPrice(status.minOrder)}
        </span>

        {hasDeliveryTime && (
          <>
            <span className="storefront__info-divider">
              ·
            </span>

            <span>
              Entrega em {status.deliveryTimeMinMinutes}
              -{status.deliveryTimeMaxMinutes} min
            </span>
          </>
        )}
      </div>

      <SocialLinks social={social} />

      {isSearchOpen && (
        <div className="storefront__search">
          <MagnifyingGlass size={16} />

          <input
            type="text"
            autoFocus
            placeholder="Buscar no cardápio..."
            onChange={(event) =>
              onSearch(event.target.value)
            }
          />
        </div>
      )}
    </header>
  );
}
