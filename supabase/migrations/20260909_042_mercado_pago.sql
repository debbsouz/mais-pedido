-- ============================================================
-- +Pedido: Pix real via Mercado Pago (chave própria de cada empresa)
--
-- Cada organização cola a própria "Chave de acesso" (Access Token)
-- do Mercado Pago dela (Configurações → Pagamentos) — o dinheiro
-- cai direto na conta de cada uma, nunca passa pela Next Code.
-- Não existe registro de "aplicativo"/OAuth aqui, é o modelo mais
-- simples: uma chave por organização, igual outros campos manuais
-- já preenchidos no cadastro de cada cliente.
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN mercado_pago_access_token TEXT;

ALTER TABLE orders
  ADD COLUMN mercado_pago_payment_id TEXT,
  ADD COLUMN pix_qr_code TEXT,
  ADD COLUMN pix_qr_code_base64 TEXT,
  ADD COLUMN payment_confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_mercado_pago_payment_id
  ON orders(mercado_pago_payment_id)
  WHERE mercado_pago_payment_id IS NOT NULL;
