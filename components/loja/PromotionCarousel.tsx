import {
  Gift,
  Motorcycle,
  Percent,
  Sparkle,
  Tag,
} from "@phosphor-icons/react";

import type {
  StorefrontPromo,
  StorefrontPromoKind,
} from "@/lib/storefront/types";

interface PromotionCarouselProps {
  promos: StorefrontPromo[];
}

const iconByKind: Record<StorefrontPromoKind, typeof Tag> = {
  discount: Percent,
  "free-delivery": Motorcycle,
  coupon: Gift,
  combo: Sparkle,
  notice: Tag,
  custom: Tag,
};

/**
 * Faixa de promoções/destaques configuráveis pela loja. É
 * totalmente opcional: nem todo estabelecimento vai querer
 * trabalhar com cupom, entrega grátis ou combo, então some
 * sozinha quando `promos` vier vazio.
 */
export function PromotionCarousel({
  promos,
}: PromotionCarouselProps) {
  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="storefront__promos-shelf">
      <div className="storefront__promos">
        {promos.map((promo) => {
          const Icon = iconByKind[promo.kind];

          return (
            <div
              key={promo.id}
              className="promo-card"
            >
              <span className="promo-card__icon">
                <Icon
                  size={16}
                  weight="bold"
                />
              </span>

              <div>
                <strong>{promo.title}</strong>
                <span>{promo.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
