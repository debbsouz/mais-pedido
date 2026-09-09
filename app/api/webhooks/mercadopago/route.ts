import { type NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPayment } from '@/lib/mercado-pago'

/**
 * Webhook do Mercado Pago — avisa quando o status de um pagamento
 * muda. Configurado dinamicamente por pedido (notification_url na
 * criação do Pix, em app/actions/public-orders.ts), com o id da
 * organização na URL (?org=...) pra saber qual chave usar.
 *
 * IMPORTANTE — nunca recebeu um aviso real do Mercado Pago (precisa
 * de uma URL pública, que só existe depois de publicado). Construído
 * estritamente a partir da documentação oficial.
 *
 * Segurança: nunca confia no status que vem no corpo do aviso — só
 * no que a API do Mercado Pago confirma ao reconsultar o pagamento,
 * com a chave da própria organização.
 */
export async function POST(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get('org')

  if (!organizationId) {
    return NextResponse.json(
      { error: 'organização não informada' },
      { status: 400 },
    )
  }

  let body: { type?: string; data?: { id?: string } }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'corpo inválido' },
      { status: 400 },
    )
  }

  // Só nos importa notificação de pagamento — o Mercado Pago manda
  // outros tipos de evento que não usamos.
  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('mercado_pago_access_token')
    .eq('id', organizationId)
    .maybeSingle()

  const accessToken = org?.mercado_pago_access_token as
    | string
    | null

  if (!accessToken) {
    return NextResponse.json({ ok: true })
  }

  const payment = await fetchPayment(accessToken, body.data.id)

  if (!payment || !payment.externalReference) {
    return NextResponse.json({ ok: true })
  }

  if (payment.status === 'approved') {
    await admin
      .from('orders')
      .update({ payment_confirmed_at: new Date().toISOString() })
      .eq('id', payment.externalReference)
      .eq('organization_id', organizationId)
      .is('payment_confirmed_at', null)
  }

  return NextResponse.json({ ok: true })
}
