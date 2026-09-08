-- ============================================================
-- +Pedido: corrige upsert_customer_from_order (035) — não
-- normalizava o telefone antes de gravar. Sem isso, o mesmo
-- cliente digitando "(51) 99999-9999" num pedido e "51999999999"
-- em outro viraria dois cadastros diferentes (a comparação com
-- customers.phone, que é sempre só dígitos, nunca bateria).
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
DECLARE
  v_phone TEXT;
BEGIN
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  IF length(v_phone) = 0 THEN
    RETURN;
  END IF;

  INSERT INTO customers (organization_id, name, phone)
  VALUES (p_organization_id, p_name, v_phone)
  ON CONFLICT (organization_id, phone) DO NOTHING;
END;
$$;
