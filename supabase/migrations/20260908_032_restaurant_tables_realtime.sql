-- ============================================================
-- +Pedido: Mesas — Real-time
-- Habilita Supabase Realtime na tabela restaurant_tables para
-- que o painel, o app do Garçom e o app do Atendente atualizem
-- juntos quando uma mesa muda de status em qualquer um deles.
-- Idempotente: pode ser re-executada sem erro.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'restaurant_tables'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
  END IF;
END $$;

-- Envia todas as colunas no payload (necessario para que
-- UPDATE/DELETE entreguem dados completos, nao so a PK)
ALTER TABLE restaurant_tables REPLICA IDENTITY FULL;
