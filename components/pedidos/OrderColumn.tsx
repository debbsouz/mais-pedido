import type { ReactNode } from "react";

interface OrderColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  variant: "waiting" | "preparing" | "ready" | "delivery";
}

export function OrderColumn({
  title,
  count,
  children,
  variant,
}: OrderColumnProps) {
  return (
    <section className={`order-column order-column--${variant}`}>
      <div className="order-column__header">
        <div>
          <span className="order-column__indicator" />
          <h2>{title}</h2>
        </div>

        <span className="order-column__count">{count}</span>
      </div>

      <div className="order-column__content">{children}</div>
    </section>
  );
}