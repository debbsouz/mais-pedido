-- ============================================================
-- +Pedido: cupons de desconto (plano Essencial)
--
-- Cupom de verdade: gera desconto real no carrinho da loja
-- pública, revalidado no servidor na hora de criar o pedido (nunca
-- confia no desconto calculado no navegador). A tabela NÃO é
-- pública — só uma função valida um código específico, sem expor
-- a lista inteira de cupons pra qualquer visitante.
-- ============================================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order_cents INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT coupons_discount_value_valid CHECK (
    (discount_type = 'percentage' AND discount_value BETWEEN 1 AND 100)
    OR (discount_type = 'fixed' AND discount_value > 0)
  ),
  CONSTRAINT coupons_min_order_non_negative CHECK (min_order_cents >= 0),
  UNIQUE (organization_id, code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select_member" ON coupons
  FOR SELECT USING (is_member_of(organization_id));

CREATE POLICY "coupons_insert_member" ON coupons
  FOR INSERT WITH CHECK (is_member_of(organization_id));

CREATE POLICY "coupons_update_member" ON coupons
  FOR UPDATE USING (is_member_of(organization_id)) WITH CHECK (is_member_of(organization_id));

CREATE POLICY "coupons_delete_member" ON coupons
  FOR DELETE USING (is_member_of(organization_id));

-- Registro do cupom usado em cada pedido (auditoria/relatório).
ALTER TABLE orders
  ADD COLUMN coupon_code TEXT,
  ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- validate_public_coupon(org_id, code, subtotal_cents)
--
-- Único jeito de checar um cupom de fora da organização — não
-- expõe a lista de cupons, só valida UM código específico que o
-- cliente já digitou. Usado tanto na prévia do carrinho quanto
-- (de novo, servidor a servidor) na hora de criar o pedido de
-- verdade, pra nunca confiar no desconto calculado no navegador.
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_public_coupon(
  p_organization_id UUID,
  p_code TEXT,
  p_subtotal_cents INTEGER
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_cents INTEGER,
  error_code TEXT,
  min_order_cents INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_discount INTEGER;
BEGIN
  SELECT * INTO v_coupon FROM coupons
  WHERE organization_id = p_organization_id
    AND upper(code) = upper(trim(p_code))
    AND is_active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'not_found'::TEXT, 0;
    RETURN;
  END IF;

  IF p_subtotal_cents < v_coupon.min_order_cents THEN
    RETURN QUERY SELECT false, 0, 'below_minimum'::TEXT, v_coupon.min_order_cents;
    RETURN;
  END IF;

  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := (p_subtotal_cents * v_coupon.discount_value) / 100;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;

  v_discount := LEAST(v_discount, p_subtotal_cents);

  RETURN QUERY SELECT true, v_discount, NULL::TEXT, 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_public_coupon(UUID, TEXT, INTEGER) TO anon, authenticated;
