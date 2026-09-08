/** * Formata o número do pedido para exibição com zeros à esquerda, ex: "#001".
 * @param number - O número sequencial do pedido
 */
export function formatOrderNumber(number: number): string {
  return `#${String(number).padStart(3, '0')}`
}

/**
 * @deprecated Use formatOrderNumber(number) instead. * Encurta o id (UUID) do pedido para um código curto de exibição, ex: "#A1B2C3".
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

/**
 * Iniciais a partir do nome da empresa, ex: "Burger House" → "BH",
 * "Padaria" → "PA". Usado como avatar de fallback quando não há
 * logo cadastrada.
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Remove tudo que não é dígito — usado como chave de comparação
 * entre telefones digitados de formas diferentes (com/sem DDD,
 * parênteses, espaço, hífen).
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Formata um telefone (só dígitos) para exibição: "(51) 99999-9999"
 * ou "(51) 9999-9999", conforme a quantidade de dígitos. Sem DDD
 * reconhecível, devolve o valor original sem tentar adivinhar.
 */
export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return phone
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
