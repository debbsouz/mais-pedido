-- ============================================================
-- +Pedido: cadastro automático de cliente pelo pedido público
--
-- A loja pública (/loja/[slug]) cria pedido sem sessão (visitante
-- anônimo) — a policy de customers exige ser membro da organização,
-- então um INSERT direto na tabela falharia pra esse visitante.
-- Mesmo padrão já usado em validate_public_coupon: função
-- SECURITY DEFINER, bem estreita (só insere, nunca atualiza dado
-- existente — ON CONFLICT DO NOTHING preserva nome/endereço que a
-- equipe já tenha cadastrado manualmente).
-- ============================================================

CREATE OR REPLACE FUNCTION public.upsert_customer_from_order(
  p_organization_id UUID,
  p_name TEXT,
  p_phone TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_phone IS NULL OR length(trim(p_phone)) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO customers (organization_id, name, phone)
  VALUES (p_organization_id, p_name, p_phone)
  ON CONFLICT (organization_id, phone) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_customer_from_order(UUID, TEXT, TEXT)
  TO anon, authenticated;
