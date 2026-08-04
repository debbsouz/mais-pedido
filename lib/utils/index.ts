/**
 * Funções utilitárias puras do +Pedido.
 *
 * Sem dependências externas, utilizáveis em qualquer parte do código.
 * Adicionar novas funções apenas quando houver necessidade real.
 */

// ============================================================
// Formatação
// ============================================================

/**
 * Formata um valor em centavos para moeda brasileira.
 *
 * @param cents - Valor em centavos (ex: 1999 = R$ 19,99)
 * @param currency - Código da moeda (padrão: BRL)
 * @returns String formatada (ex: "R$ 19,99")
 *
 * @example
 * formatCurrency(1999) // "R$ 19,99"
 */
export function formatCurrency(cents: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

/**
 * Converte um valor decimal para centavos.
 *
 * @param value - Valor decimal (ex: 19.99)
 * @returns Valor em centavos (ex: 1999)
 */
export function toCents(value: number): number {
  return Math.round(value * 100)
}

/**
 * Formata uma data para exibição (dd/mm/aaaa).
 *
 * @param date - Data a ser formatada
 * @param options - Opções de formatação
 *
 * @example
 * formatDate(new Date('2024-01-15')) // "15/01/2024"
 * formatDate(new Date('2024-01-15'), { includeTime: true }) // "15/01/2024 10:30"
 */
export function formatDate(
  date: Date | string,
  options?: { includeTime?: boolean }
): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }

  if (options?.includeTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
  }

  return new Intl.DateTimeFormat('pt-BR', formatOptions).format(d)
}

/**
 * Formata um número de telefone brasileiro.
 *
 * @param phone - Apenas dígitos (ex: "11999999999")
 * @returns "(11) 99999-9999"
 *
 * @example
 * formatPhone('11999999999') // "(11) 99999-9999"
 */
export function formatPhone(phone: string): string {
  const digits = keepOnlyDigits(phone)

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Remove formatação, mantendo apenas dígitos.
 *
 * @example
 * keepOnlyDigits('(11) 99999-9999') // "11999999999"
 */
export function keepOnlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

// ============================================================
// Validação
// ============================================================

/**
 * Valida um CPF brasileiro.
 *
 * @example
 * isValidCPF('529.982.247-25') // true
 */
export function isValidCPF(cpf: string): boolean {
  const digits = keepOnlyDigits(cpf)

  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  // Validação dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

/**
 * Valida um CNPJ brasileiro.
 *
 * @example
 * isValidCNPJ('11.222.333/0001-81') // true
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = keepOnlyDigits(cnpj)

  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false

  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(digits[12])) return false

  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i]) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(digits[13])) return false

  return true
}

/**
 * Valida um email.
 *
 * @example
 * isValidEmail('user@example.com') // true
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
