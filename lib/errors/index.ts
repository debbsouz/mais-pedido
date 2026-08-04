/**
 * Classes de erro reutilizáveis para o +Pedido.
 *
 * Hierarquia:
 * - BaseError (abstrato)
 *   - AppError
 *     - ValidationError
 *     - NotFoundError
 *     - ConflictError
 *     - UnauthorizedError
 *     - ForbiddenError
 */

// ============================================================
// Base Error
// ============================================================

/**
 * Erro base para todos os erros customizados do +Pedido.
 * Fornece estrutura consistente para serialização e log.
 */
export abstract class BaseError extends Error {
  readonly name: string
  readonly cause?: Error
  readonly timestamp: Date

  constructor(message: string, options?: { cause?: Error }) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = new Date()
    this.cause = options?.cause

    // Necessário para instanceof funcionar corretamente em subclasses
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ============================================================
// Application Errors
// ============================================================

/**
 * Erro base para erros de aplicação conhecidos.
 * São erros esperados que podem ser tratados e exibidos ao usuário.
 */
export class AppError extends BaseError {
  readonly code: string
  readonly statusCode: number

  constructor(
    message: string,
    options?: {
      code?: string
      statusCode?: number
      cause?: Error
    }
  ) {
    super(message, options)
    this.code = options?.code ?? 'APP_ERROR'
    this.statusCode = options?.statusCode ?? 400
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    }
  }
}

/**
 * Erro de validação de dados de entrada.
 * Usado quando os dados fornecidos não atendem aos requisitos.
 */
export class ValidationError extends AppError {
  readonly issues?: Array<{
    path: (string | number)[]
    message: string
  }>

  constructor(
    message: string,
    options?: {
      issues?: Array<{ path: (string | number)[]; message: string }>
      cause?: Error
    }
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      cause: options?.cause,
    })
    this.issues = options?.issues
  }

  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
    }

    if (this.issues) {
      json.issues = this.issues
    }

    return json
  }
}

/**
 * Erro de recurso não encontrado.
 * Usado quando um recurso solicitado não existe.
 */
export class NotFoundError extends AppError {
  readonly resource?: string
  readonly id?: string

  constructor(
    message: string,
    options?: {
      resource?: string
      id?: string
      cause?: Error
    }
  ) {
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      cause: options?.cause,
    })
    this.resource = options?.resource
    this.id = options?.id
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      resource: this.resource,
      id: this.id,
      timestamp: this.timestamp.toISOString(),
    }
  }
}

/**
 * Erro de conflito de estado.
 * Usado quando uma operação viola uma regra de negócio.
 */
export class ConflictError extends AppError {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, {
      code: 'CONFLICT',
      statusCode: 409,
      cause: options?.cause,
    })
  }
}

/**
 * Erro de não autenticado.
 * Usado quando o usuário não está logado.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Não autenticado', options?: { cause?: Error }) {
    super(message, {
      code: 'UNAUTHORIZED',
      statusCode: 401,
      cause: options?.cause,
    })
  }
}

/**
 * Erro de não autorizado.
 * Usado quando o usuário está autenticado mas não tem permissão.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado', options?: { cause?: Error }) {
    super(message, {
      code: 'FORBIDDEN',
      statusCode: 403,
      cause: options?.cause,
    })
  }
}
