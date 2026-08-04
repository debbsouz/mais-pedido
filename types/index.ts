/**
 * Tipagens compartilhadas do +Pedido.
 *
 * Apenas tipos realmente usados em múltiplas partes do sistema.
 * Tipos de domínio devem ser definidos quando o banco e os fluxos forem definidos.
 */

// ============================================================
// Paginação
// ============================================================

/**
 * Parâmetros de paginação para queries.
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Metadados de paginação para resposta.
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Resposta paginada genérica.
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

// ============================================================
// API
// ============================================================

/**
 * Resposta de erro da API.
 */
export interface APIError {
  name: string
  code: string
  message: string
  timestamp: string
  issues?: Array<{
    path: (string | number)[]
    message: string
  }>
}
