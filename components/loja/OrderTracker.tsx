import {
  Check,
  ChefHat,
  Motorcycle,
  Package,
  Storefront,
} from "@phosphor-icons/react";

import type {
  OrderFulfillment,
  OrderStatusStep,
} from "@/lib/storefront/types";

interface OrderTrackerProps {
  fulfillment: OrderFulfillment;
  currentStep?: OrderStatusStep;
  tableNumber?: string | null;
}

interface TrackerStep {
  id: OrderStatusStep;
  label: string;
  icon: typeof Check;
}

const stepsByFulfillment: Record<OrderFulfillment, TrackerStep[]> = {
  delivery: [
    { id: "received", label: "Pedido recebido", icon: Check },
    { id: "accepted", label: "Pedido aceito", icon: Check },
    { id: "preparing", label: "Em preparo", icon: ChefHat },
    {
      id: "out-for-delivery",
      label: "Saiu para entrega",
      icon: Motorcycle,
    },
    { id: "delivered", label: "Entregue", icon: Package },
  ],
  pickup: [
    { id: "received", label: "Pedido recebido", icon: Check },
    { id: "accepted", label: "Pedido aceito", icon: Check },
    { id: "preparing", label: "Em preparo", icon: ChefHat },
    {
      id: "ready",
      label: "Pronto para retirada",
      icon: Storefront,
    },
  ],
  "dine-in": [
    { id: "received", label: "Pedido recebido", icon: Check },
    { id: "accepted", label: "Pedido aceito", icon: Check },
    { id: "preparing", label: "Em preparo", icon: ChefHat },
    { id: "ready", label: "Pronto", icon: Storefront },
  ],
};

/**
 * Tela visual de acompanhamento do pedido. `currentStep` ausente
 * = pré-visualização (nenhuma etapa concluída ainda), usada hoje
 * na confirmação do checkout para mostrar o que o cliente verá
 * assim que o backend passar a atualizar o status de verdade.
 */
export function OrderTracker({
  fulfillment,
  currentStep,
  tableNumber,
}: OrderTrackerProps) {
  const steps = stepsByFulfillment[fulfillment];
  const currentIndex = currentStep
    ? steps.findIndex((step) => step.id === currentStep)
    : -1;

  return (
    <div className="order-tracker">
      {tableNumber && (
        <span className="storefront__table-badge">
          Mesa {tableNumber}
        </span>
      )}

      <ol className="order-tracker__steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isDone =
            currentIndex >= 0 && index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={step.id}
              className="order-tracker__step"
              data-state={
                isDone
                  ? "done"
                  : isCurrent
                    ? "current"
                    : "pending"
              }
            >
              <span className="order-tracker__step-icon">
                <Icon
                  size={14}
                  weight="bold"
                />
              </span>

              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
