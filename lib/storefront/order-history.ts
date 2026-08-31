"use client";

/**
 * Lembra, no navegador do cliente, quais pedidos ele fez nesta
 * loja — sem precisar de login. Usado só pela aba "Pedidos" da
 * loja pública, pra buscar o status atualizado (o servidor nunca
 * confia nisso pra nada além de "quais ids consultar").
 */

function storageKey(organizationId: string) {
  return `mais-pedido-loja-pedidos-${organizationId}`;
}

export function getStoredOrderIds(
  organizationId: string,
): string[] {
  try {
    const raw = window.localStorage.getItem(
      storageKey(organizationId),
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.filter(
          (id): id is string => typeof id === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function rememberOrderId(
  organizationId: string,
  orderId: string,
) {
  try {
    const current = getStoredOrderIds(organizationId);

    if (current.includes(orderId)) {
      return;
    }

    window.localStorage.setItem(
      storageKey(organizationId),
      JSON.stringify([orderId, ...current].slice(0, 20)),
    );
  } catch {
    // localStorage indisponível (modo privado, etc.) — o pedido
    // já foi criado normalmente, só não fica salvo pra consulta.
  }
}
