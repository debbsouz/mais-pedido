-- ============================================================
-- +Pedido: devolve cashback resgatado num pedido que não chegou a
-- ser criado (ex.: falha no insert depois do resgate já ter sido
-- debitado). redeem_public_cashback só aceita valores positivos
-- pra resgatar — passar um negativo nele não devolve nada, então
-- essa função separada existe só pra isso.
-- ============================================================

CREATE OR REPLACE FUNCTION public.refund_public_cashback(
  p_organization_id UUID,
  p_phone TEXT,
  p_amount_cents INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  IF length(v_phone) = 0 OR p_amount_cents <= 0 THEN
    RETURN;
  END IF;

  UPDATE customers
  SET cashback_balance_cents = cashback_balance_cents + p_amount_cents
  WHERE organization_id = p_organization_id AND phone = v_phone;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refund_public_cashback(UUID, TEXT, INTEGER)
  TO anon, authenticated;
