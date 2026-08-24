/**
 * Encurta o id (UUID) do pedido para um código curto de exibição, ex: "#A1B2C3".
 */
export function getShortOrderCode(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface PaymentLabelInput {
  method: string | null;
  cardBrand?: string | null;
}

/**
 * Formata a forma de pagamento para exibição, ex: "Crédito · Visa".
 */
export function getPaymentLabel(
  payment?: PaymentLabelInput | null,
): string {
  if (!payment?.method) {
    return "Não informado";
  }

  const { method, cardBrand } = payment;

  if (method === "Crédito" || method === "Débito") {
    return `${method} · ${cardBrand ?? "Bandeira não informada"}`;
  }

  return method;
}
