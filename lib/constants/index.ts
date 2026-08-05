/**
 * Constantes globais do +Pedido.
 *
 * Apenas constantes realmente usadas e sem vínculo com regras de negócio.
 * Novas constantes devem ser adicionadas conforme houver necessidade real.
 */

// ============================================================
// HTTP
// ============================================================

/**
 * Status codes HTTP comuns.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ============================================================
// Paginação
// ============================================================

/**
 * Configuração padrão de paginação.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// ============================================================
// Localização
// ============================================================

export const LOCALE = 'pt-BR'
export const TIMEZONE = 'America/Sao_Paulo'
export const CURRENCY = 'BRL'
