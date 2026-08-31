-- ============================================================
-- +Pedido: Loja pública — corrige RLS de order_items para pedido
-- anônimo
--
-- A policy "order_items_insert_public" (migration 014) usava uma
-- subquery direta em "orders" dentro do WITH CHECK. RLS se aplica
-- também dentro de subqueries de policy — como o visitante anônimo
-- não tem policy de SELECT em "orders" (só membro da organização
-- pode ler pedido, o que é correto: pedido tem nome/telefone de
-- cliente), essa subquery sempre falhava, mesmo com origin='Site'.
--
-- Corrige criando uma função SECURITY DEFINER (mesmo padrão de
-- is_member_of/can_create_orders/can_manage_orders), que verifica
-- a condição por dentro, sem depender da RLS de "orders" pro
-- visitante anônimo.
-- ============================================================

CREATE OR REPLACE FUNCTION public.order_is_public(order_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = order_id AND origin = 'Site'
  )
$$;

GRANT EXECUTE ON FUNCTION public.order_is_public(UUID) TO anon;

DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;

CREATE POLICY "order_items_insert_public" ON order_items
  FOR INSERT WITH CHECK (public.order_is_public(order_id));
