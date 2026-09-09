import 'server-only'

/**
 * Chamadas à API do Mercado Pago (Pix). Cada organização usa a
 * própria "Chave de acesso" (Access Token) — o dinheiro cai direto
 * na conta dela, a Next Code nunca vê nem processa o pagamento em
 * si, só cria a cobrança e recebe o aviso de confirmação.
 *
 * Referência: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments/post
 *
 * IMPORTANTE — nunca testado contra a API real (nenhuma chave de
 * teste foi fornecida). Construído estritamente a partir da
 * documentação oficial. Antes de usar com clientes reais, testar
 * com uma chave de teste (sandbox) do Mercado Pago.
 */

const MERCADO_PAGO_API_URL = 'https://api.mercadopago.com'

export interface CreatePixPaymentInput {
  accessToken: string
  amountCents: number
  description: string
  payerEmail: string
  externalReference: string
  notificationUrl: string
}

export interface PixPaymentResult {
  success: true
  paymentId: string
  status: string
  qrCode: string | null
  qrCodeBase64: string | null
}

export interface PixPaymentError {
  success: false
  error: string
}

/**
 * Cria uma cobrança Pix. `amountCents` é convertido pra reais
 * (formato exigido pela API) só na hora da chamada — o resto do
 * sistema continua trabalhando em centavos, igual tudo mais.
 */
export async function createPixPayment(
  input: CreatePixPaymentInput,
): Promise<PixPaymentResult | PixPaymentError> {
  try {
    const response = await fetch(
      `${MERCADO_PAGO_API_URL}/v1/payments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
          'Content-Type': 'application/json',
          // Evita cobrança duplicada em caso de reenvio de rede.
          'X-Idempotency-Key': input.externalReference,
        },
        body: JSON.stringify({
          transaction_amount: Math.round(input.amountCents) / 100,
          description: input.description,
          payment_method_id: 'pix',
          external_reference: input.externalReference,
          notification_url: input.notificationUrl,
          payer: {
            email: input.payerEmail,
          },
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error:
          data?.message ??
          'Não foi possível criar a cobrança Pix.',
      }
    }

    const transactionData =
      data?.point_of_interaction?.transaction_data ?? {}

    return {
      success: true,
      paymentId: String(data.id),
      status: data.status as string,
      qrCode: transactionData.qr_code ?? null,
      qrCodeBase64: transactionData.qr_code_base64 ?? null,
    }
  } catch {
    return {
      success: false,
      error: 'Falha ao conectar com o Mercado Pago.',
    }
  }
}

export interface MercadoPagoPayment {
  id: string
  status: string
  externalReference: string | null
}

/**
 * Reconsulta um pagamento direto na API, com a chave da própria
 * organização. Usado pelo webhook — nunca confia no status que vem
 * no corpo do aviso, só no que a API confirma na hora.
 */
export async function fetchPayment(
  accessToken: string,
  paymentId: string,
): Promise<MercadoPagoPayment | null> {
  try {
    const response = await fetch(
      `${MERCADO_PAGO_API_URL}/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      id: String(data.id),
      status: data.status as string,
      externalReference:
        (data.external_reference as string) ?? null,
    }
  } catch {
    return null
  }
}
