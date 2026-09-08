import 'server-only'

import { headers } from 'next/headers'

/**
 * Origem (protocolo + host) da requisição atual, pra montar links
 * absolutos em e-mails (convite de funcionário, recuperar senha).
 * Não existe uma env var fixa de URL do site — funciona em
 * localhost, preview e produção sem precisar configurar nada extra.
 */
export async function getSiteOrigin() {
  const headersList = await headers()

  const host =
    headersList.get('host') ?? 'localhost:3000'

  const protocol = host.startsWith('localhost')
    ? 'http'
    : 'https'

  return `${protocol}://${host}`
}
