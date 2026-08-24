import { Bank, Money, QrCode } from "@phosphor-icons/react";

import type {
  StorefrontPaymentMethod,
  StorefrontPaymentMethodId,
} from "@/lib/storefront/types";

interface PaymentMethodProps {
  methods: StorefrontPaymentMethod[];
  selected: StorefrontPaymentMethodId | null;
  onSelect: (id: StorefrontPaymentMethodId) => void;
}

const iconById: Record<StorefrontPaymentMethodId, typeof QrCode> = {
  pix: QrCode,
  card: Bank,
  cash: Money,
};

export function PaymentMethod({
  methods,
  selected,
  onSelect,
}: PaymentMethodProps) {
  return (
    <div className="payment-method-list">
      {methods.map((method) => {
        const Icon = iconById[method.id];
        const isActive = selected === method.id;

        return (
          <button
            key={method.id}
            type="button"
            className={`payment-method-option${
              isActive ? " is-active" : ""
            }`}
            onClick={() => onSelect(method.id)}
          >
            <Icon
              size={20}
              weight="bold"
            />

            <span>
              <strong>{method.label}</strong>
              <small>{method.description}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
