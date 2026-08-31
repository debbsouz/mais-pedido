-- ============================================================
-- +Pedido: Loja pública — consulta de status por id do pedido
--
-- Permite que o cliente acompanhe o próprio pedido na aba
-- "Pedidos" da loja, sem precisar de login: o navegador guarda o
-- id do pedido (UUID, não adivinhável) depois de criar, e usa
-- essa função pra buscar o status atualizado.
--
-- Devolve só o necessário pra acompanhamento — nunca nome,
-- telefone ou endereço do cliente.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_order_status(p_order_id UUID)
RETURNS TABLE (
  id UUID,
  number INTEGER,
  status TEXT,
  fulfillment TEXT,
  created_at TIMESTAMPTZ,
  total_cents INTEGER
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, number, status, fulfillment, created_at, total_cents
  FROM orders
  WHERE id = p_order_id AND origin = 'Site';
$$;

GRANT EXECUTE ON FUNCTION public.get_public_order_status(UUID) TO anon;
