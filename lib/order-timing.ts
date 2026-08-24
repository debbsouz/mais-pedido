export type OrderUrgency = "normal" | "warning" | "critical";

/**
 * Extrai o numero de minutos de uma string como "ha 7 min".
 * Usado como fallback antes do timer no cliente iniciar (now === null).
 */
function getElapsedFromTime(time?: string): number {
  if (!time) {
    return 0;
  }

  const match = time.match(/(\d+)/);

  return match ? Number(match[1]) : 0;
}

export function getElapsedMinutes(
  now: number | null,
  createdAt?: number,
  time?: string,
): number {
  if (now !== null && createdAt) {
    return Math.max(
      0,
      Math.floor((now - createdAt) / 1000 / 60),
    );
  }

  return getElapsedFromTime(time);
}

export function getOrderUrgency(minutes: number): OrderUrgency {
  if (minutes >= 20) {
    return "critical";
  }

  if (minutes >= 10) {
    return "warning";
  }

  return "normal";
}

/**
 * Formata minutos decorridos como "agora", "há X min", "há Xh" ou "há Xd".
 */
export function formatElapsedLabel(minutes: number): string {
  if (minutes < 1) {
    return "agora";
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours}h`;
  }

  const days = Math.floor(hours / 24);

  return `há ${days}d`;
}
