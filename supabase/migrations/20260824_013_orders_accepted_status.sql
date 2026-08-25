-- ============================================================
-- +Pedido: Pedidos — Status 'accepted'
--
-- Adiciona o status 'accepted' ao fluxo de pedidos.
--
-- Fluxo completo agora:
--   novo → aceito → preparando → pronto → entrega → finalizado
--            ↑         ↑
--           new    → accepted → preparing → ready → delivery → completed
--                                                            ↓
--                                                        cancelled
--
-- Isso permite que o atendente/cozinha confirme explicitamente
-- a recepção do pedido antes de iniciar a preparação.
-- ============================================================

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'accepted', 'preparing', 'ready', 'delivery', 'completed', 'cancelled'));
