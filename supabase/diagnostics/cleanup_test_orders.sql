-- ============================================================
-- Limpeza: remove pedidos de teste criados durante diagnostico
-- ============================================================
DELETE FROM orders
WHERE customer_name IN ('TESTE REALTIME', 'TESTE RLS OFF', 'TESTE FIX');
