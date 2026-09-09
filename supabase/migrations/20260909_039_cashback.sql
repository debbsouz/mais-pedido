-- ============================================================
-- +Pedido: cashback (dado real, configurável por empresa)
--
-- Cada empresa define a própria regra — não existe uma regra única
-- que sirva pra todo mundo. O dono liga o cashback e escolhe o
-- percentual; o sistema cuida do resto sozinho:
--
--  - Ganha: quando um pedido é marcado como concluído (não na
--    criação — evita gente criar e cancelar pedido pra ganhar
--    saldo à toa).
--  - Usa: o cliente escolhe usar o saldo como desconto na loja
--    pública, na hora de fechar um pedido novo.
--  - Se um pedido com cashback usado for cancelado, o saldo volta
--    (não pode perder o desconto por um pedido que não aconteceu).
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN cashback_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN cashback_percent INTEGER,
  ADD COLUMN cashback_min_order_cents INTEGER,
  ADD COLUMN cashback_min_redeem_cents INTEGER;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_cashback_percent_check
  CHECK (
    cashback_percent IS NULL
    OR (cashback_percent >= 0 AND cashback_percent <= 100)
  );

ALTER TABLE customers
  ADD COLUMN cashback_balance_cents INTEGER NOT NULL DEFAULT 0;

ALTER TABLE customers
  ADD CONSTRAINT customers_cashback_balance_non_negative
  CHECK (cashback_balance_cents >= 0);

ALTER TABLE orders
  ADD COLUMN cashback_earned_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN cashback_redeemed_cents INTEGER NOT NULL DEFAULT 0;

-- Devolve o saldo de cashback + o quanto a empresa oferece, pra um
-- telefone. SECURITY DEFINER porque o visitante da loja pública é
-- anônimo (RLS de customers exige ser membro da organização) —
-- mesmo padrão de validate_public_coupon: só devolve o suficiente
-- pra loja mostrar, nunca dado de outro cliente.
CREATE OR REPLACE FUNCTION public.get_public_cashback_info(
  p_organization_id UUID,
  p_phone TEXT
)
RETURNS TABLE (
  enabled BOOLEAN,
  balance_cents INTEGER,
  min_redeem_cents INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_phone TEXT;
  v_org RECORD;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  SELECT o.cashback_enabled, o.cashback_min_redeem_cents
  INTO v_org
  FROM organizations o
  WHERE o.id = p_organization_id;

  IF v_org IS NULL OR NOT v_org.cashback_enabled THEN
    RETURN QUERY SELECT false, 0, NULL::INTEGER;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    true,
    coalesce(
      (
        SELECT c.cashback_balance_cents
        FROM customers c
        WHERE c.organization_id = p_organization_id
          AND c.phone = v_phone
      ),
      0
    ),
    v_org.cashback_min_redeem_cents;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_cashback_info(UUID, TEXT)
  TO anon, authenticated;

-- Resgata o cashback disponível (até o limite do subtotal já com
-- cupom aplicado) e já debita o saldo do cliente, atômico. Chamado
-- de dentro de createPublicOrder, depois de calcular o subtotal
-- real no servidor — nunca confia em valor vindo do navegador.
CREATE OR REPLACE FUNCTION public.redeem_public_cashback(
  p_organization_id UUID,
  p_phone TEXT,
  p_max_redeem_cents INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
  v_customer_id UUID;
  v_balance INTEGER;
  v_redeemed INTEGER;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  IF length(v_phone) = 0 OR p_max_redeem_cents <= 0 THEN
    RETURN 0;
  END IF;

  SELECT id, cashback_balance_cents INTO v_customer_id, v_balance
  FROM customers
  WHERE organization_id = p_organization_id AND phone = v_phone
  FOR UPDATE;

  IF v_customer_id IS NULL OR v_balance <= 0 THEN
    RETURN 0;
  END IF;

  v_redeemed := LEAST(v_balance, p_max_redeem_cents);

  UPDATE customers
  SET cashback_balance_cents = cashback_balance_cents - v_redeemed
  WHERE id = v_customer_id;

  RETURN v_redeemed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_public_cashback(UUID, TEXT, INTEGER)
  TO anon, authenticated;
