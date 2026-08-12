-- ============================================================
-- +Pedido: Pedidos — Real-time
-- Habilita Supabase Realtime na tabela orders para que
-- o board, cozinha e entregas atualizem em tempo real.
-- ============================================================

-- Habilita Realtime na tabela orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Envia todas as colunas no payload (necessario para que
-- UPDATE/DELETE entreguem dados completos, nao so a PK)
ALTER TABLE orders REPLICA IDENTITY FULL;
