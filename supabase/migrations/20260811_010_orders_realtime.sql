-- ============================================================
-- +Pedido: Pedidos — Real-time
-- Habilita Supabase Realtime na tabela orders para que
-- o board, cozinha e entregas atualizem em tempo real.
-- Idempotente: pode ser re-executada sem erro.
-- ============================================================

-- Habilita Realtime na tabela orders (apenas se ainda nao estiver)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;

-- Envia todas as colunas no payload (necessario para que
-- UPDATE/DELETE entreguem dados completos, nao so a PK)
ALTER TABLE orders REPLICA IDENTITY FULL;
